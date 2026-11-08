import dotenv from 'dotenv'
dotenv.config()
import Groq from 'groq-sdk'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
export async function askLegalAI(question) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are a professional legal assistant.' },
      { role: 'user', content: question }
    ]
  })
  return response.choices[0].message.content
}
