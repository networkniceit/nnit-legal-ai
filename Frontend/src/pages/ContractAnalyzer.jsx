import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY || "";

export default function ContractAnalyzer() {
  const navigate = useNavigate();
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeContract = async () => {
    if (!contractText.trim()) return;
    setLoading(true);
    setAnalysis("");
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + OPENAI_KEY },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "You are a professional contract lawyer. Analyze contracts thoroughly and provide: 1) Executive Summary, 2) Key Terms, 3) Risky Clauses (highlight in detail), 4) Missing Protections, 5) Recommended Changes, 6) Risk Score (1-10), 7) Overall Recommendation. Be thorough and professional."
          }, {
            role: "user",
            content: "Please analyze this contract:\n\n" + contractText
          }],
          max_tokens: 3000
        })
      });
      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
    } catch (err) {
      setAnalysis("Error analyzing contract. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #333" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#28a745", cursor: "pointer", fontSize: "14px" }}>Back</button>
        <h2 style={{ color: "white", margin: 0 }}>Contract Analyzer</h2>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: analysis ? "1fr 1fr" : "1fr", gap: "20px" }}>
          <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #333" }}>
            <h3 style={{ color: "#28a745", marginBottom: "15px" }}>Paste Your Contract</h3>
            <textarea value={contractText} onChange={e => setContractText(e.target.value)} placeholder="Paste your contract text here for AI analysis..." rows={20} style={{ width: "100%", padding: "15px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "8px", color: "white", fontSize: "14px", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }} />
            <button onClick={analyzeContract} disabled={loading || !contractText.trim()} style={{ width: "100%", padding: "14px", background: loading ? "#444" : "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "15px" }}>
              {loading ? "Analyzing with GPT-4..." : "Analyze Contract"}
            </button>
          </div>
          {analysis && (
            <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #28a745" }}>
              <h3 style={{ color: "#28a745", marginBottom: "15px" }}>AI Analysis Result</h3>
              <div style={{ background: "#0a0a1a", padding: "20px", borderRadius: "8px", maxHeight: "600px", overflowY: "auto" }}>
                <pre style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", fontSize: "14px", lineHeight: "1.7", fontFamily: "inherit", margin: 0 }}>{analysis}</pre>
              </div>
              <button onClick={() => navigator.clipboard.writeText(analysis)} style={{ marginTop: "15px", padding: "10px 20px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Copy Analysis</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
