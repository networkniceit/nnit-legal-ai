// services/legalDocumentGenerator.js

import Groq from "groq-sdk"
const openai = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateLegalDocument(type,data){

const prompt = `
You are a professional legal document generator.

Document type:
${type}

Information:
${JSON.stringify(data)}

Generate a complete legally formatted document.
`

const completion = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You generate professional legal documents."},
{role:"user",content:prompt}
]

})

return completion.choices[0].message.content

}
