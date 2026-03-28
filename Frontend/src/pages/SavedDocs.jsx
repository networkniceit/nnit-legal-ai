import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SavedDocs() {
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nnit_saved_docs") || "[]"); } catch { return []; }
  });
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const navigate = useNavigate();

  const save = () => {
    const updated = docs.map(d => d.id === editing ? { ...d, title: editTitle, content: editText, updated: new Date().toLocaleString() } : d);
    setDocs(updated);
    localStorage.setItem("nnit_saved_docs", JSON.stringify(updated));
    setEditing(null);
  };

  const remove = (id) => {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("nnit_saved_docs", JSON.stringify(updated));
  };

  const download = (doc) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.title + ".txt";
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "white" }}>
      <div style={{ background: "#1a1a2e", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #333" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", fontSize: "14px" }}>Back</button>
        <h2 style={{ color: "white", margin: 0 }}>Saved Documents</h2>
      </div>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px" }}>
        {docs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", marginTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>??</div>
            <p>No saved documents yet. Generate documents and save them here.</p>
          </div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid #333" }}>
              {editing === doc.id ? (
                <div>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #667eea", borderRadius: "6px", color: "white", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box" }} />
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={10} style={{ width: "100%", padding: "10px", background: "#0a0a1a", border: "1px solid #444", borderRadius: "6px", color: "white", fontSize: "13px", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button onClick={save} style={{ padding: "8px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save</button>
                    <button onClick={() => setEditing(null)} style={{ padding: "8px 20px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h3 style={{ color: "#667eea", margin: 0 }}>{doc.title}</h3>
                    <span style={{ color: "#555", fontSize: "11px" }}>{doc.updated || doc.created}</span>
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", color: "#aaa", fontSize: "13px", lineHeight: "1.6", maxHeight: "200px", overflowY: "auto", fontFamily: "inherit", margin: "0 0 12px 0" }}>{doc.content.substring(0, 300)}...</pre>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => { setEditing(doc.id); setEditText(doc.content); setEditTitle(doc.title); }} style={{ padding: "7px 16px", background: "#fd7e14", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Edit</button>
                    <button onClick={() => download(doc)} style={{ padding: "7px 16px", background: "#667eea", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Download</button>
                    <button onClick={() => navigator.clipboard.writeText(doc.content)} style={{ padding: "7px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Copy</button>
                    <button onClick={() => remove(doc.id)} style={{ padding: "7px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
