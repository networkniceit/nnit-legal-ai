import express from "express"
import fetch from "node-fetch"
const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { messages, systemPrompt, max_tokens } = req.body
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        max_tokens: max_tokens || 1500,
        messages: [
          { role: "system", content: systemPrompt || "You are NNIT Legal AI, a professional legal assistant." },
          ...messages
        ]
      })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.json({ result: data.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
