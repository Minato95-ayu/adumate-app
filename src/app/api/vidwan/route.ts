import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
- Use your tools for real-time information.
`;

// Helper for "Internet Search" simulation or real fetch if available
async function searchInternet(query: string) {
  // In a real app, you'd use Tavily, Serper, or Google Search API
  // For now, we simulate a scholarly search response
  return `Search results for "${query}": Recent data shows significant advancements in this topic... [Simulated Search Result]`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{
        functionDeclarations: [
          {
            name: "search_internet",
            description: "Search the internet for the latest information on a topic",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_service_info",
            description: "Get information about specific services in Adumate (libraries, hostels, etc.)",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "The category of service (e.g., 'library', 'hostel')",
                },
              },
            },
          }
        ],
      }],
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    // Handle function calls if any
    const calls = response.functionCalls();
    if (calls && calls.length > 0) {
      const toolResponses: any[] = [];
      for (const call of calls) {
        if (call.name === "search_internet") {
          const searchData = await searchInternet((call.args as any).query);
          toolResponses.push({
            functionResponse: {
              name: "search_internet",
              response: { content: searchData },
            },
          });
        } else if (call.name === "get_service_info") {
          toolResponses.push({
            functionResponse: {
              name: "get_service_info",
              response: { content: "Adumate has over 500+ verified libraries and hostels across major student hubs in India." },
            },
          });
        }
      }

      // Send tool responses back to model to get final answer
      const finalResult = await chat.sendMessage(toolResponses);
      const finalText = finalResult.response.text();
      return NextResponse.json({ role: "assistant", content: finalText });
    }

    const text = response.text();
    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: any) {
    console.error("Vidwan AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
