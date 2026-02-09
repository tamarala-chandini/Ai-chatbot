require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Load API key
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Debug check
console.log("Loaded GROQ KEY:", GROQ_API_KEY);

// If key missing, show error immediately
if (!GROQ_API_KEY) {
  console.log("❌ GROQ_API_KEY is missing. Check your .env file.");
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "❌ No message received" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant like ChatGPT."
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Debug full response if error
    if (data.error) {
      console.log("Groq Error:", data);
      return res.json({ reply: "❌ AI Error: " + data.error.message });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.json({ reply: "❌ Server error contacting AI" });
  }
});

app.listen(3000, () => {
  console.log("✅ Chatbox running at http://localhost:3000");
});
