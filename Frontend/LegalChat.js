// frontend/src/components/LegalChat.js

import {useState} from "react"
import api from "../api"

function LegalChat(){

const [question,setQuestion] = useState("")
const [answer,setAnswer] = useState("")

async function askLegalAI(){

const res = await api.post("/legal/research",{
question
})

setAnswer(res.data.result)

}

return(

<div>

<h2>AI Legal Assistant</h2>

<textarea
value={question}
onChange={(e)=>setQuestion(e.target.value)}
placeholder="Ask a legal question..."
/>

<button onClick={askLegalAI}>
Ask Legal AI
</button>

<div>

<h3>Answer</h3>

<p>{answer}</p>

</div>

</div>

)

}

export default LegalChat