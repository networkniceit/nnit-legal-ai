import {useState} from "react"
import api from "../api"

function ComplianceScanner(){

const [result,setResult] = useState("")

async function scan(){

const res = await api.post("/compliance/scan",{
businessType:"startup",
employees:5
})

setResult(res.data.result)

}

return(

<div>

<h3>Compliance Check</h3>

<button onClick={scan}>
Scan Business
</button>

<p>{result}</p>

</div>

)

}

export default ComplianceScanner