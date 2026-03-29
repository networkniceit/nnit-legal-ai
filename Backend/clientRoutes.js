import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import pg from "pg"

const router = express.Router()
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
const JWT_SECRET = process.env.JWT_SECRET || "nnit-legal-secret-2024"

// Init client tables
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS client_documents (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        title VARCHAR(500),
        content TEXT,
        type VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
  } catch (e) { console.log("Table init:", e.message) }
}
initTables()

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" })
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query("INSERT INTO clients (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id,name,email", [name, email, hash])
    const token = jwt.sign({ id: result.rows[0].id, email }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, client: result.rows[0] })
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already registered" })
    res.status(500).json({ error: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await pool.query("SELECT * FROM clients WHERE email=$1", [email])
    if (!result.rows.length) return res.status(401).json({ error: "Invalid email or password" })
    const client = result.rows[0]
    const valid = await bcrypt.compare(password, client.password_hash)
    if (!valid) return res.status(401).json({ error: "Invalid email or password" })
    const token = jwt.sign({ id: client.id, email }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, client: { id: client.id, name: client.name, email: client.email } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token" })
  try { req.client = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: "Invalid token" }) }
}

router.get("/documents", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM client_documents WHERE client_id=$1 ORDER BY created_at DESC", [req.client.id])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post("/documents", authMiddleware, async (req, res) => {
  try {
    const { title, content, type } = req.body
    const result = await pool.query("INSERT INTO client_documents (client_id,title,content,type) VALUES ($1,$2,$3,$4) RETURNING *", [req.client.id, title, content, type])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete("/documents/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM client_documents WHERE id=$1 AND client_id=$2", [req.params.id, req.client.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id,name,email,created_at FROM clients WHERE id=$1", [req.client.id])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router