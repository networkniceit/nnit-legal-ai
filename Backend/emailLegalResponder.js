// services/emailLegalResponder.js

import Groq from "groq-sdk"
const openai = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateLegalEmailReply(email){

const prompt=`

You are a legal assistant.

Incoming email:
${email}

Write a professional legal reply.

`

const completion = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You write professional legal emails."},
{role:"user",content:prompt}
]

})

return completion.choices[0].message.content

}
