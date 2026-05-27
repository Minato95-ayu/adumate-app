const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const geminiKey = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY="(.+)"/)[1];

const genAI = new GoogleGenerativeAI(geminiKey);

async function testAI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'Gemini 2.0 is working!'");
    console.log(result.response.text());
  } catch (e) {
    console.log("Error: " + e.message);
  }
}

testAI();
