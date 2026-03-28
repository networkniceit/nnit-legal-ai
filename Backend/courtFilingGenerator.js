// services/courtFilingGenerator.js

import Groq from "groq-sdk"
const openai = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateCourtFiling(caseInfo){

const prompt=`

Prepare a professional court filing.

Case:
${JSON.stringify(caseInfo)}

Include:

1 Complaint
2 Legal argument
3 Requested relief
4 Signature block

`

const completion = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You prepare litigation filings."},
{role:"user",content:prompt}
]

})

return completion.choices[0].message.content

}
