import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OPENAI_KEY = "REMOVED";

export default function CaseBuilder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ facts: "", goal: "", opponent: "", jurisdiction: "Germany", caseType: "Civil" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const buildCase = async () => {
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + OPENAI_KEY },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "You are an expert litigation strategist and legal advisor. Build comprehensive legal case strategies with detailed arguments, evidence requirements, and step-by-step action plans."
          }, {
            role: "user",
            content: `Build a complete legal case strategy:

Case Type: ${form.caseType}
Jurisdiction: ${form.jurisdiction}
Facts: ${form.facts}
Goal: ${form.goal}
Opponent: ${form.opponent}

Provide:
1. Case Assessment & Strength Analysis
2. Legal Arguments (with law citations)
3. Evidence Checklist
4. Witness Requirements
5. Timeline and Deadlines
6. Court Filing Strategy
7. Possible Defenses from Opponent
8. Settlement Strategy
9. Risk Analysis
10. Step-by-Step Action Plan`
          }],
          max_tokens: 4000
        })
      });
      const data = await response.json();
      setResult(data.choices[0].message.content);
    } catch (err) {
      setResult("Error building case. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #333" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "14px" }}>Back</button>
        <h2 style={{ color: "white", margin: 0 }}>AI Case Builder</h2>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "20px" }}>
          <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #333" }}>
            <h3 style={{ color: "#dc3545", marginBottom: "20px" }}>Build Your Case</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>Case Type</label>
                <select value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white" }}>
                  {["Civil", "Criminal", "Employment", "Family", "Commercial", "Property", "Immigration"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>Jurisdiction</label>
                <select value={form.jurisdiction} onChange={e => setForm({...form, jurisdiction: e.target.value})} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white" }}>
                  {["Germany", "UK", "USA", "France", "Netherlands", "EU General"].map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            </div>
            {[
              { key: "facts", label: "Case Facts", placeholder: "Describe what happened in detail...", rows: 5 },
              { key: "goal", label: "Your Goal", placeholder: "What outcome do you want?", rows: 3 },
              { key: "opponent", label: "Opponent / Defendant", placeholder: "Who are you against?", rows: 2 }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>{f.label}</label>
                <textarea value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} rows={f.rows} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={buildCase} disabled={loading || !form.facts.trim()} style={{ width: "100%", padding: "14px", background: loading ? "#444" : "#dc3545", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px" }}>
              {loading ? "Building Case Strategy..." : "Build My Case"}
            </button>
          </div>
          {result && (
            <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #dc3545" }}>
              <h3 style={{ color: "#dc3545", marginBottom: "15px" }}>Case Strategy</h3>
              <div style={{ background: "#0a0a1a", padding: "20px", borderRadius: "8px", maxHeight: "600px", overflowY: "auto" }}>
                <pre style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", fontSize: "14px", lineHeight: "1.7", fontFamily: "inherit", margin: 0 }}>{result}</pre>
              </div>
              <button onClick={() => navigator.clipboard.writeText(result)} style={{ marginTop: "15px", padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Copy Strategy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
