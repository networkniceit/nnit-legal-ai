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

export default router
