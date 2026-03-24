import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function askLegalAI(question) {

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional legal assistant."
      },
      {
        role: "user",
        content: question
      }
    ]
  })

  return completion.choices[0].message.content
}