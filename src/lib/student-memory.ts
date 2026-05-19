// lib/student-memory.ts
// 🧠 FREE Zep-Alternative — Firebase Firestore based AI Memory System
// Replaces Zep Cloud ($49/month) with $0 Firestore solution
// Features: Persistent memory, entity extraction, student profile, cross-session context

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentProfile {
  city?: string;           // "Patna", "Delhi"
  exam?: string;           // "NEET", "JEE", "UPSC"
  budget?: number;         // 5000 (monthly ₹)
  lookingFor?: string[];   // ["hostel", "library", "mess"]
  college?: string;        // "XYZ Engineering College"
  stream?: string;         // "Medical", "Engineering", "Commerce"
  year?: string;           // "1st year", "2nd year"
  hostelArea?: string;     // Preferred locality
  dietPref?: string;       // "veg", "non-veg"
  weakSubjects?: string[]; // ["Physics", "Organic Chemistry"]
  strongSubjects?: string[]; // ["Biology", "Maths"]
  targetScore?: string;    // "650+", "99 percentile"
  dailyStudyHours?: number; // 6
  lastUpdated?: number;
}

export interface StudentMemory {
  profile: StudentProfile;
  facts: string[];                         // ["NEET 2026 aspirant", "5000 budget for hostel"]
  recentMessages: Array<{
    role: "user" | "assistant";
    content: string;
    ts: number;
  }>;
  summary?: string;                        // AI-generated summary of past conversations
  messageCount: number;
  lastActive?: number;
}

// How many recent messages to keep in Firestore (rolling window)
const MAX_RECENT_MESSAGES = 30;
// After how many messages to auto-extract facts using AI
const EXTRACT_EVERY_N = 6;

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function memoryRef(userId: string) {
  return adminDb.collection("user_memory").doc(userId);
}

/**
 * Load student memory from Firestore (or return empty if new user)
 */
export async function loadMemory(userId: string): Promise<StudentMemory> {
  try {
    const snap = await memoryRef(userId).get();
    if (!snap.exists) {
      return {
        profile: {},
        facts: [],
        recentMessages: [],
        messageCount: 0,
      };
    }
    return snap.data() as StudentMemory;
  } catch {
    // Never fail — just return empty
    return { profile: {}, facts: [], recentMessages: [], messageCount: 0 };
  }
}

/**
 * Save a new message pair + update message count
 * Keeps only last MAX_RECENT_MESSAGES messages (rolling window)
 */
export async function saveMessages(
  userId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  try {
    const ref = memoryRef(userId);
    const snap = await ref.get();
    const existing = snap.exists ? (snap.data() as StudentMemory) : null;

    const current = existing?.recentMessages ?? [];
    const newMessages: StudentMemory["recentMessages"] = [
      ...current,
      { role: "user", content: userMsg.slice(0, 1000), ts: Date.now() },
      { role: "assistant", content: assistantMsg.slice(0, 1500), ts: Date.now() },
    ];

    // Rolling window — keep last N messages only
    const trimmed = newMessages.slice(-MAX_RECENT_MESSAGES);
    const newCount = (existing?.messageCount ?? 0) + 1;

    await ref.set(
      {
        recentMessages: trimmed,
        messageCount: newCount,
        lastActive: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[Memory] Save failed (non-critical):", e);
  }
}

/**
 * Save extracted facts + profile to Firestore
 */
export async function saveExtractedData(
  userId: string,
  facts: string[],
  profile: Partial<StudentProfile>
): Promise<void> {
  try {
    const ref = memoryRef(userId);
    const updates: Record<string, unknown> = { lastActive: Date.now() };

    // Merge new profile fields (only update non-empty values)
    const profileUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(profile)) {
      if (v !== undefined && v !== null && v !== "") {
        profileUpdates[`profile.${k}`] = v;
      }
    }
    Object.assign(updates, profileUpdates);

    // Merge new facts (deduplicate by overwriting with set)
    if (facts.length > 0) {
      // Get existing facts first to deduplicate
      const snap = await ref.get();
      const existing = snap.exists ? (snap.data() as StudentMemory)?.facts ?? [] : [];
      const combined = [...new Set([...existing, ...facts])].slice(-25); // max 25 facts
      updates["facts"] = combined;
    }

    await ref.set(updates, { merge: true });
  } catch (e) {
    console.warn("[Memory] Facts save failed (non-critical):", e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY → AI PROMPT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format Firestore memory into a clean string for AI system prompt injection
 */
export function formatMemoryForAI(memory: StudentMemory): string {
  const parts: string[] = [];

  // Student profile
  const p = memory.profile;
  const profileParts: string[] = [];
  if (p.city) profileParts.push(`City: ${p.city}`);
  if (p.exam) profileParts.push(`Exam: ${p.exam}`);
  if (p.budget) profileParts.push(`Budget: ₹${p.budget}/month`);
  if (p.lookingFor?.length) profileParts.push(`Looking for: ${p.lookingFor.join(", ")}`);
  if (p.college) profileParts.push(`College: ${p.college}`);
  if (p.stream) profileParts.push(`Stream: ${p.stream}`);
  if (p.year) profileParts.push(`Year: ${p.year}`);
  if (p.dietPref) profileParts.push(`Diet: ${p.dietPref}`);
  if (p.weakSubjects?.length) profileParts.push(`Weak Subjects: ${p.weakSubjects.join(", ")}`);
  if (p.strongSubjects?.length) profileParts.push(`Strong Subjects: ${p.strongSubjects.join(", ")}`);
  if (p.targetScore) profileParts.push(`Target Score: ${p.targetScore}`);
  if (p.dailyStudyHours) profileParts.push(`Daily Study Hours: ${p.dailyStudyHours}`);

  if (profileParts.length > 0) {
    parts.push(`👤 STUDENT PROFILE:\n${profileParts.map((x) => `• ${x}`).join("\n")}`);
  }

  // Known facts
  if (memory.facts?.length > 0) {
    parts.push(`📌 KNOWN FACTS:\n${memory.facts.map((f) => `• ${f}`).join("\n")}`);
  }

  // Summary (if exists)
  if (memory.summary) {
    parts.push(`📜 PAST CONTEXT SUMMARY:\n${memory.summary}`);
  }

  if (parts.length === 0) return "";

  return `\n\n${"─".repeat(50)}\n🧠 STUDENT LONG-TERM MEMORY (Use this to personalize responses):\n${parts.join("\n\n")}\n${"─".repeat(50)}\n`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO ENTITY EXTRACTION (via Groq — free, fast)
// ─────────────────────────────────────────────────────────────────────────────

const EXTRACT_SYSTEM = `You are an AI that extracts structured student profile data from conversations.
Extract ONLY what is explicitly mentioned. Return valid JSON only. No explanation.

JSON format:
{
  "facts": ["fact1", "fact2"],
  "profile": {
    "city": "string or null",
    "exam": "string or null (NEET/JEE/UPSC/etc)",
    "budget": "number or null (monthly ₹)",
    "lookingFor": ["hostel","mess","library","coaching","tutor","room"],
    "college": "string or null",
    "stream": "string or null",
    "year": "string or null",
    "hostelArea": "string or null",
    "dietPref": "veg or non-veg or null",
    "weakSubjects": ["string"],
    "strongSubjects": ["string"],
    "targetScore": "string or null",
    "dailyStudyHours": "number or null"
  }
}

Rules:
- facts: Short factual statements about the student (max 5, each under 15 words)
- Only include profile fields that are EXPLICITLY mentioned
- budget and dailyStudyHours must be numbers
- weakSubjects/strongSubjects must be arrays of strings
- If nothing relevant found, return: {"facts":[],"profile":{}}`;

/**
 * Use Groq (free) to extract student profile + facts from conversation
 * Called asynchronously — never blocks the main response
 */
export async function extractAndSave(
  userId: string,
  userMessage: string,
  groqApiKey: string
): Promise<void> {
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Fast + free Groq model
        messages: [
          { role: "system", content: EXTRACT_SYSTEM },
          {
            role: "user",
            content: `Extract student data from:\n"${userMessage.slice(0, 600)}"`,
          },
        ],
        max_tokens: 400,
        temperature: 0.1, // Low temp for consistent JSON
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return;

    // Parse JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const extracted = JSON.parse(jsonMatch[0]);
    const facts: string[] = extracted.facts ?? [];
    const profile: Partial<StudentProfile> = extracted.profile ?? {};

    if (facts.length > 0 || Object.keys(profile).length > 0) {
      await saveExtractedData(userId, facts, profile);
    }
  } catch (e) {
    // Silent fail — extraction is bonus feature
    console.warn("[Memory] Extraction failed (non-critical):", e);
  }
}

/**
 * Should we run extraction this message? (every EXTRACT_EVERY_N messages)
 */
export function shouldExtract(messageCount: number): boolean {
  return messageCount % EXTRACT_EVERY_N === 0;
}
