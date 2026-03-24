import { useState } from "react"

function App(){

const [question,setQuestion] = useState("")
const [answer,setAnswer] = useState("")

async function askLegal(){

const res = await fetch("https://nnit-legal-ai-production.up.railway.app/ask-legal",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body: JSON.stringify({question})
})

const data = await res.json()
setAnswer(data.answer)
}

return(

<div>

<h1>NNIT AI Lawyer</h1>

<textarea
value={question}
onChange={(e)=>setQuestion(e.target.value)}
/>

<button onClick={askLegal}>
Ask Legal AI
</button>

<p>{answer}</p>

</div>

)
}

export default App
