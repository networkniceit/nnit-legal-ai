// services/evidenceManager.js

import fs from "fs"

export function storeEvidence(file,userId){

const folder=`uploads/${userId}`

if(!fs.existsSync(folder)){
fs.mkdirSync(folder,{recursive:true})
}

const path=`${folder}/${file.originalname}`

fs.writeFileSync(path,file.buffer)

return path

}

export function listEvidence(userId){

const folder=`uploads/${userId}`

if(!fs.existsSync(folder)){
return []
}

return fs.readdirSync(folder)

}