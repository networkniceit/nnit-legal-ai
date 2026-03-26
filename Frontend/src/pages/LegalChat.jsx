import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY || "";

const languages = { en: "English", de: "Deutsch", fr: "Francais", es: "Espanol", ar: "Arabic", zh: "Chinese", hi: "Hindi", pt: "Portugues", ru: "Russian", ja: "Japanese", ko: "Korean", tr: "Turkce" };

export default function LegalChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! I am NNIT AI Legal Assistant powered by GPT-4. I can help you with legal questions, contract advice, tenant rights, employment law, business law, and more. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");

  const systemPrompt = `You are NNIT AI Legal Assistant, a professional legal advisor powered by GPT-4. You are owned by Solomon Omomeje Ayodele, NNIT - Network Nice IT Tec (networkniceit@gmail.com).

You provide expert legal advice on:
- Contract law and analysis
- Employment law and workers rights
- Tenant and landlord disputes
- Business law and compliance
- Criminal law explanations
- Family law
- Intellectual property
- GDPR and data protection (especially for Germany/EU)
- Immigration law
- Consumer rights

Guidelines:
- Respond in ${language === "en" ? "English" : language === "de" ? "German" : language === "fr" ? "French" : language === "es" ? "Spanish" : language === "ar" ? "Arabic" : language === "zh" ? "Chinese" : language === "hi" ? "Hindi" : "English"}
- Be professional, clear and thorough
- Cite relevant laws when applicable
- Always note that for official court representation, a licensed attorney is required
- Provide actionable advice and next steps`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + OPENAI_KEY },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "system", content: systemPrompt }, ...messages, userMsg],
          max_tokens: 2000
        })
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI. Please try again." }]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    "Can my landlord evict me without notice?",
    "What are my rights as an employee in Germany?",
    "How do I write a cease and desist letter?",
    "What is GDPR and how does it affect my business?",
    "How do I file a complaint against my employer?"
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "14px" }}>Back</button>
          <h2 style={{ color: "white", margin: 0, fontSize: "18px" }}>NNIT AI Legal Chat</h2>
        </div>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: "6px 12px", background: "#2a2a3e", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "13px" }}>
          {Object.entries(languages).map(([code, name]) => <option key={code} value={code} style={{ color: "#333" }}>{name}</option>)}
        </select>
      </div>

      <div style={{ padding: "15px 20px", background: "#0f0f1a", borderBottom: "1px solid #222" }}>
        <p style={{ color: "#666", fontSize: "12px", margin: "0 0 8px 0" }}>Quick questions:</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => setInput(q)} style={{ padding: "5px 12px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "20px", color: "#aaa", cursor: "pointer", fontSize: "12px" }}>{q}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "20px", display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "15px 20px", borderRadius: msg.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px", background: msg.role === "user" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#1a1a2e", color: "white", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap", border: msg.role === "assistant" ? "1px solid #333" : "none" }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
            <div style={{ padding: "15px 20px", background: "#1a1a2e", borderRadius: "20px 20px 20px 5px", border: "1px solid #333", color: "#667eea" }}>
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "20px", background: "#1a1a2e", borderTop: "1px solid #333" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Ask your legal question..." rows={2} style={{ flex: 1, padding: "12px", background: "#2a2a3e", border: "1px solid #444", borderRadius: "10px", color: "white", fontSize: "14px", resize: "none", fontFamily: "inherit" }} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "12px 24px", background: loading ? "#444" : "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "14px" }}>
            Send
          </button>
        </div>
        <p style={{ color: "#444", fontSize: "11px", textAlign: "center", marginTop: "10px" }}>AI legal advice is informational only. Consult a licensed attorney for official representation.</p>
      </div>
    </div>
  );
}
