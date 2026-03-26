import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const services = [
    { title: "AI Legal Chat", desc: "Ask any legal question and get instant AI-powered advice", path: "/chat", color: "#667eea", icon: "CHAT" },
    { title: "Contract Analyzer", desc: "Upload contracts and get AI risk analysis", path: "/contract", color: "#28a745", icon: "DOC" },
    { title: "Document Generator", desc: "Generate NDAs, contracts, legal letters instantly", path: "/documents", color: "#fd7e14", icon: "GEN" },
    { title: "Case Builder", desc: "Build your legal case with AI strategy", path: "/case", color: "#dc3545", icon: "CASE" },
    { title: "Compliance Scanner", desc: "Check your business compliance with AI", path: "/compliance", color: "#17a2b8", icon: "SCAN" }
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "15px" }}>LEGAL</div>
        <h1 style={{ fontSize: "42px", margin: "0 0 15px 0", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          NNIT AI Legal Assistant
        </h1>
        <p style={{ fontSize: "18px", color: "#aaa", marginBottom: "30px", maxWidth: "600px", margin: "0 auto 30px" }}>
          Professional AI-powered legal assistance for contracts, cases, compliance and more
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <button onClick={() => navigate("/chat")} style={{ padding: "16px 40px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "30px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            Ask Legal AI
          </button>
          <button onClick={() => navigate("/documents")} style={{ padding: "16px 40px", background: "transparent", color: "white", border: "2px solid #667eea", borderRadius: "30px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}>
            Generate Document
          </button>
        </div>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginTop: "40px" }}>
          {["500+ Legal Templates", "GPT-4 Powered", "12 Languages", "GDPR Compliant"].map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: "20px", fontSize: "13px" }}>{f}</div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "40px", color: "#fff" }}>Legal Services</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {services.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)} style={{ background: "#1a1a2e", borderRadius: "12px", padding: "30px", cursor: "pointer", border: "1px solid #333", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
              <div style={{ width: "50px", height: "50px", borderRadius: "10px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", marginBottom: "15px" }}>{s.icon}</div>
              <h3 style={{ color: s.color, marginBottom: "10px" }}>{s.title}</h3>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#1a1a2e", padding: "30px", textAlign: "center", color: "#666", fontSize: "13px" }}>
        NNIT AI Legal Assistant — networkniceit@gmail.com — Solomon Omomeje Ayodele
        <br/>Note: AI legal advice is informational only. Consult a licensed attorney for official representation.
      </div>
    </div>
  );
}
