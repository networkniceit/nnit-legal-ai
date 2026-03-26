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

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth",authRoutes)
app.use("/legal",legalRoutes)
app.use("/contracts",contractRoutes)
app.use("/cases",caseRoutes)
app.use("/compliance",complianceRoutes)
app.use("/upload",uploadRoutes)

app.listen(5000,()=>{
console.log("NNIT Legal AI running on port 5000")
})
