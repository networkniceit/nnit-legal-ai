import express from "express"
import mongoose from "mongoose"
const router = express.Router()

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["open", "in-progress", "closed"], default: "open" },
  createdAt: { type: Date, default: Date.now }
})
const Case = mongoose.models.Case || mongoose.model("Case", caseSchema)

router.get("/", async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 })
    res.json({ cases })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title) return res.status(400).json({ error: "Title is required" })
    const newCase = new Case({ title, description })
    await newCase.save()
    res.json({ message: "Case created", case: newCase })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch("/:id", async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ case: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id)
    res.json({ message: "Case deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
