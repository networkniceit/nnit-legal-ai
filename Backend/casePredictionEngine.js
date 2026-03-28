// services/casePredictionEngine.js

import OpenAI from "openai"

const openai=new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

export async function predictCaseOutcome(caseData){

const prompt=`

Predict the possible outcome of this legal case.

Case:
${JSON.stringify(caseData)}

Return:

1 probability of success
2 major risks
3 recommended strategy

`

const completion = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[
{role:"system",content:"You analyze litigation outcomes."},
{role:"user",content:prompt}
]

})

return completion.choices[0].message.content

}
