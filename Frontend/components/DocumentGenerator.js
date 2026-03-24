import {useState} from "react"
import api from "../api"
function DocumentGenerator(){
const [doc,setDoc] = useState("")
const [file,setFile] = useState(null)
const [uploading,setUploading] = useState(false)
const [uploadResult,setUploadResult] = useState("")

async function generate(){
const res = await api.post("/contracts/generate",{type:"nda",partyA:"Company",partyB:"Client"})
setDoc(res.data.document)
}

async function uploadFile(){
if(!file) return
setUploading(true)
const form = new FormData()
form.append("file",file)
try{
const res = await api.post("/contracts/upload",form,{headers:{"Content-Type":"multipart/form-data"}})
setUploadResult(res.data.message||"File uploaded successfully")
}catch(e){
setUploadResult("Upload failed: "+e.message)
}
setUploading(false)
}

return(
<div>
<h3>Generate Legal Document</h3>
<button onClick={generate}>Generate NDA</button>
<pre>{doc}</pre>
<hr/>
<h3>Upload Legal Document</h3>
<input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>setFile(e.target.files[0])}/>
<button onClick={uploadFile} disabled={uploading||!file}>
{uploading?"Uploading...":"Upload Document"}
</button>
{uploadResult && <p>{uploadResult}</p>}
</div>
)
}
export default DocumentGenerator
