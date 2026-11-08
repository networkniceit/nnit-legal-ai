import express from "express"
import { askLegalAI, askAIWithProvider } from "../services/aiEngine.js"
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

// General AI endpoint used by the NNIT PDF / Office tools (key stays on the server)
const hits = new Map()
router.post("/complete", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.ip
    const now = Date.now()
    const recent = (hits.get(ip) || []).filter(t => now - t < 60000)
    if (recent.length >= 20) return res.status(429).json({ error: "Too many requests, wait a minute" })
    recent.push(now); hits.set(ip, recent)
    const { system, user } = req.body
    if (!user || typeof user !== "string") return res.status(400).json({ error: "user text is required" })
    if (user.length > 30000 || (system && String(system).length > 2000)) return res.status(413).json({ error: "Text too long" })
    const out = await askAIWithProvider(system || "You are a helpful professional assistant.", user)
    res.json({ answer: out.answer, provider: out.provider })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
