import express from "express"
import Groq from "groq-sdk"
const router = express.Router()
const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
router.post("/", async (req, res) => {
  try {
    const { messages, systemPrompt, max_tokens } = req.body
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: max_tokens || 1500,
      messages: [
        { role: "system", content: systemPrompt || "You are NNIT Legal AI, a professional legal assistant." },
        ...messages
      ]
    })
    res.json({ result: response.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
export default router
