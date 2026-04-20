/**
 * AI Service Proxy
 * Calls our internal API route to handle multi-provider fallback securely and avoid CORS issues.
 */

interface AIResponse {
  text: string;
  provider: string;
}

export async function multiCallAI(prompt: string, options: { json?: boolean } = {}): Promise<AIResponse> {
  try {
    const resp = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, json: options.json })
    });

    const data = await resp.json();

    if (!resp.ok) {
      if (data.error?.toLowerCase().includes("quota") || data.error?.toLowerCase().includes("limit") || data.error === "ALL_FAILED") {
        throw new Error("__ALL_PROVIDERS_EXHAUSTED__");
      }
      throw new Error(data.error || "AI Call Failed");
    }

    return {
      text: data.text,
      provider: data.provider
    };
  } catch (err: any) {
    if (err.message === "__ALL_PROVIDERS_EXHAUSTED__") throw err;
    console.error("AI Service Error:", err);
    throw new Error("⚠️ AI Connect nahi ho pa raha. Internet check karein ya 2 min baad try karein.");
  }
}
