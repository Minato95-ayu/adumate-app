
async function testVidwan() {
    console.log("🚀 Starting Vidwan AI Self-Verification...");
    
    const testCases = [
        {
            name: "Complex Reasoning & Hinglish",
            body: {
                prompt: "Ek paheli bujho: Wo kya hai jo subah 4 pair par, dopahar ko 2 pair par, aur shaam ko 3 pair par chalta hai? Detailed logic samjhao Hinglish mein.",
                history: []
            }
        },
        {
            name: "Coding & Formatting",
            body: {
                prompt: "Python mein ek recursive function likho jo Fibonacci series generate kare, aur use explain karo.",
                history: []
            }
        },
        {
            name: "Session Memory Test",
            body: {
                prompt: "Abhi maine upar kya pucha tha? Short mein batao.",
                history: [
                    { role: "user", content: "Python mein ek recursive function likho jo Fibonacci series generate kare, aur use explain karo." },
                    { role: "assistant", content: "Bilkul, yahan recursive function ka code hai... [Mock Code]" }
                ]
            }
        }
    ];

    for (const test of testCases) {
        console.log(`\n--- Testing: ${test.name} ---`);
        try {
            const resp = await fetch('http://localhost:3000/api/vidwan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.body)
            });
            const data = await resp.json();
            if (data.error) {
                console.error(`❌ Error: ${data.error}`);
            } else {
                console.log(`✅ Provider: ${data.provider}`);
                console.log(`📄 Response Snippet: ${data.text.substring(0, 150)}...`);
            }
        } catch (e) {
            console.error(`❌ Connection failed: ${e.message}`);
        }
    }
}

testVidwan();
