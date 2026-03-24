// services/caseBuilder.js

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function buildLegalCase(caseData){

  const prompt = `
You are a professional litigation strategist.

Case Facts:
${caseData.facts}

Client Goal:
${caseData.goal}

Opponent:
${caseData.opponent}

Jurisdiction:
${caseData.jurisdiction}

Provide:

1. Case summary
2. Legal arguments
3. Evidence checklist
4. Possible defenses
5. Court filing strategy
6. Risk analysis
`

  const completion = await openai.chat.completions.create({

    model:"gpt-4o-mini",

    messages:[
      { role:"system", content:"You are a litigation expert." },
      { role:"user", content:prompt }
    ]

  })

  return completion.choices[0].message.content

}