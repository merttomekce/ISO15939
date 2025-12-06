import express from "express";

const router = express.Router();

router.post("/analyze", async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return res.status(500).json({ error: { message: "Server API Key not configured." } });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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

export default router;
