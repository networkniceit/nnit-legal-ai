import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Legal research endpoint working" })
})

export default router