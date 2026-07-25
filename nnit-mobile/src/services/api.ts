import { ChatCache } from './storage';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY'; // replace with env var

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  offline?: boolean;
}

const SYSTEM_PROMPT = `You are NNIT Legal AI, a highly experienced legal assistant specializing in:
- Contract analysis and drafting
- Legal compliance (GDPR, corporate law, employment law)
- Case strategy and legal research
- Document review and risk assessment

Respond professionally, cite relevant laws when applicable, and always recommend consulting a licensed attorney for specific legal advice.
Keep responses clear, structured, and actionable.`;

export async function sendLegalChat(
  messages: Message[],
  onOffline?: () => void
): Promise<string> {
  const payload = {
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    const reply = data.choices[0]?.message?.content ?? 'No response.';

    // Save to offline cache
    await ChatCache.save([...messages, { role: 'assistant', content: reply }]);
    return reply;
  } catch (err) {
    onOffline?.();
    // Return cached last response or fallback
    const cached = await ChatCache.load() as Message[];
    const lastAssistant = [...cached].reverse().find((m) => m.role === 'assistant');
    return lastAssistant
      ? `[Offline] ${lastAssistant.content}`
      : '[Offline] Unable to reach the AI. Please check your connection.';
  }
}

export async function analyzeDocument(text: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a legal document analyst. Provide structured analysis with: Summary, Key Clauses, Risks, Missing Provisions, and Recommendations.' },
        { role: 'user', content: `Analyze this legal document:\n\n${text}` },
      ],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  return data.choices[0]?.message?.content ?? 'Analysis failed.';
}

export async function generateDocument(type: string, details: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are an expert legal document drafter. Generate professional, legally sound documents in English.' },
        { role: 'user', content: `Generate a ${type} with these details:\n\n${details}\n\nFormat it professionally with all necessary legal sections.` },
      ],
      max_tokens: 3000,
    }),
  });
  const data = await res.json();
  return data.choices[0]?.message?.content ?? 'Generation failed.';
}

export async function scanCompliance(text: string, area: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: `You are a ${area} compliance expert. Scan documents for compliance issues and provide a detailed report with: Compliance Score (0-100), Issues Found, Risk Level (Low/Medium/High/Critical), and Recommendations.` },
        { role: 'user', content: text },
      ],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  return data.choices[0]?.message?.content ?? 'Scan failed.';
}
