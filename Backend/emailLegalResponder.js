// services/emailLegalResponder.js

import OpenAI from "openai"

const openai = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

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