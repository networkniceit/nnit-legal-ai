import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Compliance endpoint working" })
})

export default router
