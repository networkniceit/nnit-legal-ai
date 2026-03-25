import {useEffect,useState} from "react"
import api from "../api"

function CaseManager(){

const [cases,setCases] = useState([])

useEffect(()=>{

loadCases()

},[])

async function loadCases(){

const res = await api.get("/cases")

setCases(res.data)

}

return(

<div>

<h3>Your Cases</h3>

<ul>

{cases.map(c=>(
<li key={c.id}>
Case {c.id} - {c.status}
</li>
))}

</ul>

</div>

)

}

export default CaseManager