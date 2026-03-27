import express from "express"
import { askLegalAI } from "../services/aiEngine.js"
const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Legal research endpoint working" })
})

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: "Question is required" })
    const answer = await askLegalAI(question)
    res.json({ answer })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/analyze", async (req, res) => {
  try {
    const { content, type, instruction } = req.body
    if (!content) return res.status(400).json({ error: "Content is required" })
    const prompt = `${instruction}\n\nDocument content:\n${content}`
    const result = await askLegalAI(prompt)
    res.json({ result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router