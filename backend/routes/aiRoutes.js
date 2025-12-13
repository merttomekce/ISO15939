import express from "express";

const router = express.Router();

router.post("/analyze", async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return res.status(500).json({ error: { message: "Server API Key not configured." } });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch from Gemini API");
        }

        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

router.post("/chat", async (req, res) => {
    try {
        const { message, context } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return res.status(500).json({ error: { message: "Server API Key not configured." } });
        }

        const systemContext = `
            You are "ISO Assist", a helpful AI assistant for a website dedicated to the ISO/IEC 15939 Software Measurement Process standards.
            Your goal is to help users understand software quality measurement, navigate the website, and use the simulation tools.
            
            Website Sections:
            - Home: Overview of the 6-step measurement process.
            - Simulator: Interactive tool to practice ISO 15939 (Define, Weight, Measure, Analyze).
            - Measurement: Form to create a real-world measurement plan.
            - References: Detailed documentation and helpful links.

            Tone: Professional, encouraging, and concise.
            If asked about things unrelated to software quality or the website, politely steer the conversation back to the topic.
        `;

        const fullPrompt = `${systemContext}\n\nUser Question: ${message}\n\nExisting Context: ${JSON.stringify(context || [])}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch from Gemini API");
        }

        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

export default router;
