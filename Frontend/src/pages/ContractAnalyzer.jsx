import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ContractAnalyzer() {
  const navigate = useNavigate();
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setContractText(ev.target.result);
    reader.readAsText(file);
  };

  const analyzeContract = async () => {
    if (!contractText.trim()) return;
    setLoading(true);
    setAnalysis("");
    try {
      const res = await api.post("/legal/analyze", {
        content: contractText,
        type: "risk",
        instruction: "Analyze this contract thoroughly. Provide: 1) Executive Summary, 2) Key Terms, 3) Risky Clauses, 4) Missing Protections, 5) Recommended Changes, 6) Risk Score (1-10), 7) Overall Recommendation."
      });
      setAnalysis(res.data.result);
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
            <h3 style={{ color: "#28a745", marginBottom: "15px" }}>Upload or Paste Your Contract</h3>

            {/* FILE UPLOAD BUTTON */}
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="contractFile" style={{ display: "inline-block", padding: "10px 20px", background: "#28a745", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                📁 Upload File (PDF, DOC, TXT)
              </label>
              <input
                id="contractFile"
                type="file"
                accept=".txt,.doc,.docx,.pdf,.csv"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              {fileName && <span style={{ marginLeft: "12px", color: "#28a745", fontSize: "13px" }}>✅ {fileName}</span>}
            </div>

            <div style={{ textAlign: "center", color: "#555", marginBottom: "12px", fontSize: "13px" }}>— or paste text below —</div>

            <textarea
              value={contractText}
              onChange={e => setContractText(e.target.value)}
              placeholder="Paste your contract text here for AI analysis..."
              rows={16}
              style={{ width: "100%", padding: "15px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "8px", color: "white", fontSize: "14px", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
            />
            <button
              onClick={analyzeContract}
              disabled={loading || !contractText.trim()}
              style={{ width: "100%", padding: "14px", background: loading ? "#444" : "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "15px" }}
            >
              {loading ? "Analyzing..." : "Analyze Contract"}
            </button>
          </div>

          {analysis && (
            <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #28a745" }}>
              <h3 style={{ color: "#28a745", marginBottom: "15px" }}>AI Analysis Result</h3>
              <div style={{ background: "#0a0a1a", padding: "20px", borderRadius: "8px", maxHeight: "600px", overflowY: "auto" }}>
                <pre style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", fontSize: "14px", lineHeight: "1.7", fontFamily: "inherit", margin: 0 }}>{analysis}</pre>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button onClick={() => navigator.clipboard.writeText(analysis)} style={{ flex: 1, padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Copy Analysis</button>
                <button onClick={() => { const blob = new Blob([analysis], {type: "text/plain"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "contract-analysis.txt"; a.click(); }} style={{ flex: 1, padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Download Report</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}