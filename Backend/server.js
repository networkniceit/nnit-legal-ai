import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import legalRoutes from "./routes/legalRoutes.js"
import contractRoutes from "./routes/contractRoutes.js"
import caseRoutes from "./routes/caseRoutes.js"
import complianceRoutes from "./routes/complianceRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import aiRoutes from "./routes/aiRoute.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import emailRoutes from "./routes/emailRoutes.js"
import clientRoutes from "./routes/clientRoutes.js"

import jwt from "jsonwebtoken"

// Safety: the case manager needs a login; busy public endpoints are limited per visitor so nobody can run up the AI bill.
const requireLogin = (req, res, next) => {
  const token = (req.headers.authorization || "").split(" ")[1]
  try { jwt.verify(token, process.env.JWT_SECRET || process.env.ADMIN_KEY); next() }
  catch { res.status(401).json({ error: "Login required" }) }
}
const visits = new Map()
const limitPublic = (max) => (req, res, next) => {
  const parts = String(req.headers["x-forwarded-for"] || req.ip).split(",")
  const ip = parts[parts.length - 1].trim()
  const now = Date.now()
  const recent = (visits.get(ip) || []).filter(t => now - t < 60000)
  if (recent.length >= max) return res.status(429).json({ error: "Too many requests, wait a minute" })
  recent.push(now); visits.set(ip, recent)
  if (visits.size > 5000) for (const [k, v] of visits) if (!v.some(t => now - t < 60000)) visits.delete(k)
  next()
}
const app = express()

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}))
app.use(express.json())

app.use("/auth", authRoutes)
app.use(["/legal", "/api/legal-ai", "/contracts", "/compliance", "/upload", "/email"], limitPublic(40))
app.use("/legal", legalRoutes)
app.use("/contracts", contractRoutes)
app.use("/cases", requireLogin, caseRoutes)
app.use("/compliance", complianceRoutes)
app.use("/upload", uploadRoutes)
app.use("/api/legal-ai", aiRoutes)
app.use("/payments", paymentRoutes)
app.use("/email", emailRoutes)
app.use("/clients", clientRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log("NNIT Legal AI running on port " + PORT)
})



