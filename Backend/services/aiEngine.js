import dotenv from 'dotenv'
dotenv.config()
import Groq from 'groq-sdk'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Main engine: OpenAI (the paid key already on this system). Groq is only a safety net if OpenAI fails.
async function viaOpenAI(system, user, maxTokens) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error('OpenAI: ' + (data.error?.message || res.status))
  return data.choices[0].message.content
}

async function viaGroq(system, user, maxTokens) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
  })
  return response.choices[0].message.content
}

export async function askAIWithProvider(system, user, maxTokens = 3000) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return { answer: await viaOpenAI(system, user, maxTokens), provider: 'openai' }
    } catch (e) {
      console.error('OpenAI failed, using Groq fallback:', e.message)
    }
  }
  return { answer: await viaGroq(system, user, maxTokens), provider: 'groq' }
}

export async function askAI(system, user) {
  return (await askAIWithProvider(system, user)).answer
}

export async function askLegalAI(question) {
  return askAI('You are a professional legal assistant.', question)
}
