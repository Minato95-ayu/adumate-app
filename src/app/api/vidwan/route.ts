import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const APP_CONTEXT = `
Adumate Features:
- Knowledge Finder: Search for videos, notes, telegram channels.
- AI Test: Generate custom tests for any topic (JEE, NEET, etc.).
- Service Map: Find libraries, hostels, PG, mess, tutors nearby.
- 1v1 Challenge: Compete with friends on educational topics.
- Founder: Ayush Kaushik.
- Mission: To simplify student life in India.

Internal Data Access (MCP-like):
- Libraries: We have 500+ verified libraries across major student hubs in India.
- Hostels: 200+ partner hostels with student-friendly amenities.
- Tutors: Expert mentors for JEE, NEET, and Coding.
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", the advanced scholarly digital mentor of Adumate.
You are a "Tony Stark's JARVIS" style assistant for Indian students.

Your Characteristics:
- High intelligence, witty, futuristic, and scholarly.
- Fluent in Hinglish (Hindi + English). 
- You provide deep insights and encourage students.
- You can explain everything from Newton's laws to app features.

Your Role:
- Answer student queries with precision and style.
- If the model supports tools, use them to fetch data.
`;

// Fallback providers logic
async function callFallbackAI(prompt: string) {
  const providers = [
    { name: "Groq", key: process.env.GROQ_API_KEY, url: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" },
    { name: "DeepSeek", key: process.env.DEEPSEEK_API_KEY, url: "https://api.deepseek.com/v1/chat/completions", model: "deepseek-chat" }
  ];

  for (const p of providers) {
    if (!p.key) continue;
    try {
      const resp = await fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${p.key}` },
        body: JSON.stringify({
          model: p.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      const data = await resp.json();
      return data.choices?.[0]?.message?.content;
    } catch (e) {
      console.error(`Fallback to ${p.name} failed:`, e);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Please login to chat." }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(idToken);

    const { prompt: userPrompt } = await req.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Try Gemini with Tools first
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const body = {
          contents: [{ role: "user", parts: [{ text: `SYSTEM: ${SYSTEM_PROMPT}\n\nCONTEXT: ${APP_CONTEXT}\n\nUser: ${userPrompt}` }] }],
          tools: [{
            function_declarations: [
              { name: "get_adumate_stats", description: "Get Adumate stats", parameters: { type: "object", properties: {} } },
              { name: "find_services", description: "Find libraries/hostels", parameters: { type: "object", properties: { cat: { type: "string" } } } }
            ]
          }]
        };

        const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await resp.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
          const call = data.candidates[0].content.parts[0].functionCall;
          const toolData = call.name === "get_adumate_stats" ? "10k+ Students, 500+ Libraries" : "Verified hostels and libraries available.";
          
          const secondResp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [...body.contents, data.candidates[0].content, { role: "function", parts: [{ functionResponse: { name: call.name, response: { content: toolData } } }] }]
            })
          });
          const secondData = await secondResp.json();
          return NextResponse.json({ text: secondData.candidates?.[0]?.content?.parts?.[0]?.text });
        }

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
        }
      } catch (e) {
        console.error("Gemini Primary failed, trying fallbacks...");
      }
    }

    // Fallback to other APIs if Gemini fails or is missing
    const fallbackText = await callFallbackAI(`SYSTEM: ${SYSTEM_PROMPT}\n\nUser: ${userPrompt}`);
    if (fallbackText) return NextResponse.json({ text: fallbackText });

    return NextResponse.json({ error: "ALL_SYSTEMS_OFFLINE: Please check your API keys." }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
