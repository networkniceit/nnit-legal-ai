import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/database.js"

export async function register(req,res){

const {email,password}=req.body

const hash = await bcrypt.hash(password,10)

await pool.query(
"INSERT INTO users(email,password) VALUES($1,$2)",
[email,hash]
)

res.json({message:"User created"})
}

export async function login(req,res){

const {email,password}=req.body

const result = await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
)

if(result.rows.length===0){
return res.status(401).json({error:"User not found"})
}

const user = result.rows[0]

const valid = await bcrypt.compare(password,user.password)

if(!valid){
return res.status(401).json({error:"Invalid password"})
}

const token = jwt.sign({id:user.id},"secret",{expiresIn:"1d"})

res.json({token})
}