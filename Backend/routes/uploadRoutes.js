import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

const router = express.Router()

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    const dir = "./uploads"
    if(!fs.existsSync(dir)) fs.mkdirSync(dir)
    cb(null, dir)
  },
  filename: function(req, file, cb){
    cb(null, Date.now()+"-"+file.originalname)
  }
})

const upload = multer({storage, limits:{fileSize:10*1024*1024}})

router.post("/upload", upload.single("file"), (req, res) => {
  if(!req.file) return res.status(400).json({error:"No file uploaded"})
  res.json({
    success:true,
    message:"File uploaded successfully",
    filename:req.file.filename,
    originalname:req.file.originalname,
    size:req.file.size,
    path:req.file.path
  })
})

router.get("/uploads", (req, res) => {
  const dir = "./uploads"
  if(!fs.existsSync(dir)) return res.json({files:[]})
  const files = fs.readdirSync(dir).map(f => ({name:f, path:"/uploads/"+f}))
  res.json({files})
})

export default router
