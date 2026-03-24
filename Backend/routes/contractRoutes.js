import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Contracts endpoint working" })
})

export default router
