// services/legalResearch.js

import OpenAI from "openai"
import pg from "pg"

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function searchLegalDatabase(query){

  const client = await pool.connect()

  try{

    const laws = await client.query(
      `SELECT title, content FROM laws
       WHERE to_tsvector(content) @@ plainto_tsquery($1)
       LIMIT 5`,
       [query]
    )

    const cases = await client.query(
      `SELECT case_name, summary FROM court_decisions
       WHERE to_tsvector(summary) @@ plainto_tsquery($1)
       LIMIT 5`,
       [query]
    )

    return {
      laws: laws.rows,
      cases: cases.rows
    }

  } finally {
    client.release()
  }

}

export async function analyzeLegalQuestion(question){

  const research = await searchLegalDatabase(question)

  const prompt = `
You are a professional legal researcher.

Question:
${question}

Relevant Laws:
${JSON.stringify(research.laws)}

Court Decisions:
${JSON.stringify(research.cases)}

Provide:
1. Legal explanation
2. Relevant statutes
3. Possible legal strategy
`

  const completion = await openai.chat.completions.create({

    model: "llama-3.3-70b-versatile",

    messages:[
      { role:"system", content:"You are a legal research assistant." },
      { role:"user", content: prompt }
    ]

  })

  return completion.choices[0].message.content

}
