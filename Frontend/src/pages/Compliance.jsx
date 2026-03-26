import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OPENAI_KEY = "REMOVED";

export default function Compliance() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessType: "", country: "Germany", employees: "", activities: "", dataHandling: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const scanCompliance = async () => {
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
            content: "You are a legal compliance expert specializing in EU/German business law, GDPR, employment law and regulatory compliance."
          }, {
            role: "user",
            content: `Perform a comprehensive compliance audit:

Business Type: ${form.businessType}
Country: ${form.country}
Employees: ${form.employees}
Business Activities: ${form.activities}
Data Handling: ${form.dataHandling}

Provide:
1. GDPR Compliance Status
2. Employment Law Compliance
3. Business Registration Requirements
4. Tax Obligations
5. Industry-Specific Regulations
6. Data Protection Requirements
7. Compliance Violations Found
8. Risk Score (1-10)
9. Priority Action Items
10. Recommended Legal Steps`
          }],
          max_tokens: 3000
        })
      });
      const data = await response.json();
      setResult(data.choices[0].message.content);
    } catch (err) {
      setResult("Error scanning compliance. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #333" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#17a2b8", cursor: "pointer", fontSize: "14px" }}>Back</button>
        <h2 style={{ color: "white", margin: 0 }}>Compliance Scanner</h2>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "20px" }}>
          <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #333" }}>
            <h3 style={{ color: "#17a2b8", marginBottom: "20px" }}>Business Compliance Scan</h3>
            {[
              { key: "businessType", label: "Business Type", placeholder: "e.g. IT Company, Restaurant, Online Shop", type: "input" },
              { key: "employees", label: "Number of Employees", placeholder: "e.g. 5", type: "input" },
              { key: "activities", label: "Business Activities", placeholder: "Describe what your business does...", type: "textarea" },
              { key: "dataHandling", label: "Data Handling", placeholder: "What customer data do you collect and process?", type: "textarea" }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>{f.label}</label>
                {f.type === "input" ? (
                  <input type="text" value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                ) : (
                  <textarea value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} rows={3} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>Country</label>
              <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white" }}>
                {["Germany", "UK", "France", "Netherlands", "Spain", "Italy", "USA"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={scanCompliance} disabled={loading || !form.businessType.trim()} style={{ width: "100%", padding: "14px", background: loading ? "#444" : "#17a2b8", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px" }}>
              {loading ? "Scanning Compliance..." : "Scan My Business"}
            </button>
          </div>
          {result && (
            <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #17a2b8" }}>
              <h3 style={{ color: "#17a2b8", marginBottom: "15px" }}>Compliance Report</h3>
              <div style={{ background: "#0a0a1a", padding: "20px", borderRadius: "8px", maxHeight: "600px", overflowY: "auto" }}>
                <pre style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", fontSize: "14px", lineHeight: "1.7", fontFamily: "inherit", margin: 0 }}>{result}</pre>
              </div>
              <button onClick={() => navigator.clipboard.writeText(result)} style={{ marginTop: "15px", padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Copy Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
