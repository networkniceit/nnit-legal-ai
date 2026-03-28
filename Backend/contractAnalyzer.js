// services/contractAnalyzer.js

import fs from "fs"
import pdf from "pdf-parse"
import Groq from "groq-sdk"
const openai = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function extractText(filePath){

  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdf(dataBuffer)

  return data.text
}

export async function analyzeContract(filePath){

  const contractText = await extractText(filePath)

  const prompt = `
You are a legal contract analyst.

Analyze this contract and return:

1. Summary
2. Risky clauses
3. Missing protections
4. Suggested improvements
5. Risk score from 1-10

Contract:
${contractText}
`

  const completion = await openai.chat.completions.create({

    model:"gpt-4o-mini",

    messages:[
      { role:"system", content:"You analyze legal contracts." },
      { role:"user", content:prompt }
    ]

  })

  return completion.choices[0].message.content

}
