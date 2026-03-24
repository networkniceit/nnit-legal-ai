import {useState} from "react"
import api from "../api"

function LegalChat(){

const [question,setQuestion] = useState("")
const [answer,setAnswer] = useState("")

async function ask(){

const res = await api.post("/legal/research",{
question
})

setAnswer(res.data.result)

}

return(

<div>

<h3>AI Legal Assistant</h3>

<textarea
value={question}
onChange={(e)=>setQuestion(e.target.value)}
/>

<button onClick={ask}>
Ask
</button>

<p>{answer}</p>

</div>

)

}

export default LegalChat