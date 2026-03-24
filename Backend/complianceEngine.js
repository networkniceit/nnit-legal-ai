// services/complianceEngine.js

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function scanBusinessCompliance(data){

  const prompt = `
You are a legal compliance auditor.

Company Info:

Business Type:
${data.businessType}

Country:
${data.country}

Activities:
${data.activities}

Employees:
${data.employees}

Data Handling:
${data.dataHandling}

Analyze compliance with:

1. Data protection laws
2. Employment law
3. Tax obligations
4. Business licensing
5. Regulatory risk

Return:

- Compliance report
- Violations
- Recommended fixes
- Risk score
`

  const completion = await openai.chat.completions.create({

    model:"gpt-4o-mini",

    messages:[
      { role:"system", content:"You are a legal compliance expert." },
      { role:"user", content:prompt }
    ]

  })

  return completion.choices[0].message.content

}