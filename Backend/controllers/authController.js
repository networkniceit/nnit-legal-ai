import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
    .catch(err => console.error("MongoDB connection error:", err.message))
}

export async function register(req, res) {
  try {
    const { email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hashed })
    await user.save()
    res.json({ message: "User created" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: "Invalid credentials" })
    const token = jwt.sign({ id: user._id }, process.env.ADMIN_KEY || "secret", { expiresIn: "24h" })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}