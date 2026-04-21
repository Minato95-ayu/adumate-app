import { NextResponse } from "next/server";

const APP_CONTEXT = `
Adumate Features:
- Knowledge Finder: Search for videos, notes, telegram channels.
- AI Test: Generate custom tests for any topic (JEE, NEET, etc.).
- Service Map: Find libraries, hostels, PG, mess, tutors nearby.
- 1v1 Challenge: Compete with friends on educational topics.
- Partner Portal: For service providers to list their businesses.
- Founder: Ayush Kaushik.
- Goal: Simplify student life in India.
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", the digital scholar of Adumate.
Adumate is a student ecosystem in India.

Your Characteristics:
- High intelligence, scholarly yet modern.
- Expert in Indian competitive exams (JEE, NEET, UPSC, etc.).
- Knowledgeable about student living (hostels, libraries).
- Helpful and proactive.

App Context:
${APP_CONTEXT}

Your Role:
- Answer student queries about studies or the app.
- If a student feels down after a test, encourage them.
- Suggest new things to learn.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    // Use direct fetch to Gemini API to match the project's existing working pattern
    // Try gemini-1.5-flash first, then gemini-pro
    const models = ["gemini-1.5-flash", "gemini-pro"];
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        // Format prompt for Gemini with system instruction
        // We combine system prompt and conversation history into the contents
        const contents = [
          {
            role: "user",
            parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_PROMPT}\n\nUser conversation follows.` }]
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am Vidwan AI, your scholarly digital mentor. How can I assist you today?" }]
          }
        ];

        // Add history (excluding the first assistant message)
        messages.forEach((m: any, i: number) => {
          if (i === 0 && m.role === "assistant") return;
          contents.push({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          });
        });

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          })
        });

        const data = await resp.json();
        if (data.error) throw new Error(data.error.message || "Gemini Error");

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ role: "assistant", content: text });
        }
      } catch (err: any) {
        console.error(`Gemini fallback failed for ${model}:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    return NextResponse.json({ error: lastError || "Failed to connect to Vidwan AI" }, { status: 500 });
  } catch (error: any) {
    console.error("Vidwan AI API Global Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
