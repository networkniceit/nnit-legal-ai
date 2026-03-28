import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const docTypes = [
  { id: "nda", name: "Non-Disclosure Agreement (NDA)", fields: ["Party A Name", "Party B Name", "Duration", "Governing Law"] },
  { id: "employment", name: "Employment Contract", fields: ["Employer Name", "Employee Name", "Position", "Salary", "Start Date", "Working Hours"] },
  { id: "lease", name: "Lease Agreement", fields: ["Landlord Name", "Tenant Name", "Property Address", "Monthly Rent", "Lease Duration"] },
  { id: "freelance", name: "Freelance Contract", fields: ["Client Name", "Freelancer Name", "Project Description", "Payment Amount", "Deadline"] },
  { id: "cease", name: "Cease and Desist Letter", fields: ["Your Name", "Recipient Name", "Violation Description", "Demanded Action"] },
  { id: "partnership", name: "Partnership Agreement", fields: ["Partner 1 Name", "Partner 2 Name", "Business Name", "Profit Split", "Duration"] },
  { id: "privacy", name: "Privacy Policy", fields: ["Company Name", "Website URL", "Data Types Collected", "Contact Email"] },
  { id: "terms", name: "Terms of Service", fields: ["Company Name", "Service Description", "Governing Law", "Contact Email"] }
];

const saveDoc = (title, content) => {
  const docs = JSON.parse(localStorage.getItem("nnit_saved_docs") || "[]");
  docs.unshift({ id: Date.now(), title, content, created: new Date().toLocaleString() });
  localStorage.setItem("nnit_saved_docs", JSON.stringify(docs));
  alert("Document saved!");
};

export default function DocumentGenerator() {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [fields, setFields] = useState({});
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);

  const generateDoc = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    setGenerated("");
    try {
      const fieldInfo = Object.entries(fields).map(([k, v]) => k + ": " + v).join("\n");
      const question = "Generate a complete " + selectedDoc.name + " with these details:\n\n" + fieldInfo + "\n\nMake it professional, comprehensive and legally sound for Germany/EU jurisdiction.";
      const res = await api.post("/legal/chat", { question });
      setGenerated(res.data.answer);
    } catch (err) {
      setGenerated("Error generating document. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #333" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#fd7e14", cursor: "pointer", fontSize: "14px" }}>Back</button>
        <h2 style={{ color: "white", margin: 0 }}>Legal Document Generator</h2>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        {!selectedDoc ? (
          <div>
            <h3 style={{ color: "#fd7e14", marginBottom: "25px" }}>Select Document Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
              {docTypes.map(doc => (
                <div key={doc.id} onClick={() => { setSelectedDoc(doc); setFields({}); setGenerated(""); }} style={{ background: "#1a1a2e", padding: "20px", borderRadius: "10px", cursor: "pointer", border: "1px solid #333", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#fd7e14"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
                  <h4 style={{ color: "#fd7e14", margin: "0 0 8px 0" }}>{doc.name}</h4>
                  <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>{doc.fields.length} fields required</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: generated ? "1fr 1fr" : "1fr", gap: "20px" }}>
            <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ color: "#fd7e14", margin: 0 }}>{selectedDoc.name}</h3>
                <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "1px solid #444", color: "#aaa", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Change Type</button>
              </div>
              {selectedDoc.fields.map(field => (
                <div key={field} style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>{field}</label>
                  <input type="text" value={fields[field] || ""} onChange={e => setFields({ ...fields, [field]: e.target.value })} placeholder={"Enter " + field.toLowerCase() + "..."} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={generateDoc} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#444" : "#fd7e14", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}>
                {loading ? "Generating..." : "Generate Document"}
              </button>
            </div>
            {generated && (
              <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "25px", border: "1px solid #fd7e14" }}>
                <h3 style={{ color: "#fd7e14", marginBottom: "15px" }}>Generated Document</h3>
                <div style={{ background: "#0a0a1a", padding: "20px", borderRadius: "8px", maxHeight: "500px", overflowY: "auto" }}>
                  <pre style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", fontSize: "13px", lineHeight: "1.8", fontFamily: "inherit", margin: 0 }}>{generated}</pre>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button onClick={() => saveDoc(selectedDoc.name, generated)} style={{ flex: 1, padding: "10px", background: "#764ba2", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save Document</button>
                  <button onClick={() => navigator.clipboard.writeText(generated)} style={{ flex: 1, padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Copy</button>
                  <button onClick={() => { const blob = new Blob([generated], {type: "text/plain"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = selectedDoc.id + ".txt"; a.click(); }} style={{ flex: 1, padding: "10px", background: "#fd7e14", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Download</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
