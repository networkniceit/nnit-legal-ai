import express from "express"
import multer from "multer"
import fs from "fs"
import { askLegalAI } from "../services/aiEngine.js"
const router = express.Router()
const upload = multer({ dest: "./uploads/" })

router.get("/", (req, res) => {
  res.json({ message: "Contracts endpoint working" })
})

router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { text } = req.body
    let contractText = text || ""
    if (req.file) {
      contractText = fs.readFileSync(req.file.path, "utf8")
      fs.unlinkSync(req.file.path)
    }
    if (!contractText) return res.status(400).json({ error: "No contract text or file provided" })
    const prompt = `Analyze this contract and provide: 1) Key clauses summary 2) Potential risks 3) Recommendations\n\nContract:\n${contractText.slice(0, 8000)}`
    const analysis = await askLegalAI(prompt)
    res.json({ analysis })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
