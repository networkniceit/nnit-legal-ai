// frontend/components/ContractAnalyzer.js
import { useState } from "react"
import api from "../api"

function ContractAnalyzer() {
  const [files, setFiles] = useState([])
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [analysisType, setAnalysisType] = useState("risk")

  function handleFiles(selected) {
    const arr = [...selected]
    setFiles(prev => {
      const existing = prev.map(f => f.name)
      const newFiles = arr.filter(f => !existing.includes(f.name))
      return [...prev, ...newFiles]
    })
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function fileIcon(name) {
    const ext = name.split(".").pop().toLowerCase()
    return { pdf: "📄", doc: "📝", docx: "📝", txt: "📃", csv: "📊" }[ext] || "📎"
  }

  function fileSize(b) {
    if (b < 1024) return b + " B"
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB"
    return (b / 1048576).toFixed(1) + " MB"
  }

  async function analyze() {
    if (files.length === 0) return
    setLoading(true)
    setResult("")

    try {
      // Read all files as text
      const fileContents = await Promise.all(
        files.map(f => new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = e => resolve({ name: f.name, content: e.target.result })
          reader.onerror = () => resolve({ name: f.name, content: "[Could not read file]" })
          reader.readAsText(f)
        }))
      )

      const fileText = fileContents
        .map(f => `=== FILE: ${f.name} ===\n${f.content}\n=== END ===`)
        .join("\n\n")

      const typeMap = {
        risk: "Perform a detailed RISK ANALYSIS. Identify high, medium and low risks. Flag problematic clauses.",
        summary: "Provide a clear SUMMARY in plain language. Explain the document purpose and key points.",
        clauses: "Extract and explain all KEY CLAUSES with their meaning and implications.",
        parties: "Identify all PARTIES, their roles and main obligations.",
        obligations: "List all OBLIGATIONS for each party including deadlines and payment terms."
      }

      const res = await api.post("/legal/analyze", {
        content: fileText,
        type: analysisType,
        instruction: typeMap[analysisType]
      })

      setResult(res.data.result || res.data.answer || "Analysis complete.")
    } catch (err) {
      // fallback — call Anthropic directly if backend route not ready
      setResult("⚠️ Could not connect to backend. Check your API route /legal/analyze is set up.")
    }

    setLoading(false)
  }

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>📄 Contract Analyzer</h2>
      <p style={styles.sub}>Upload contracts and get instant AI risk analysis</p>

      {/* Analysis Type */}
      <div style={styles.typeRow}>
        {["risk", "summary", "clauses", "parties", "obligations"].map(t => (
          <button
            key={t}
            style={{ ...styles.typeBtn, ...(analysisType === t ? styles.typeBtnActive : {}) }}
            onClick={() => setAnalysisType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        style={{ ...styles.uploadZone, ...(dragOver ? styles.uploadZoneOver : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => document.getElementById("contractFileInput").click()}
      >
        <input
          id="contractFileInput"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv"
          style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop your contract here</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>or click to browse</div>
        <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "monospace" }}>PDF · DOC · DOCX · TXT</div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((f, i) => (
            <div key={i} style={styles.fileItem}>
              <span style={{ fontSize: 18 }}>{fileIcon(f.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>{fileSize(f.size)}</div>
              </div>
              <button style={styles.removeBtn} onClick={() => removeFile(i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Analyze Button */}
      <button
        style={{ ...styles.analyzeBtn, ...(files.length === 0 || loading ? styles.analyzeBtnDisabled : {}) }}
        onClick={analyze}
        disabled={files.length === 0 || loading}
      >
        {loading ? "⏳ Analyzing..." : "Analyze Contract"}
      </button>

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <div style={styles.resultTitle}>📋 Analysis Result</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap" }}>{result}</div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { background: "#0d1220", border: "1px solid #1e2a40", borderRadius: 12, padding: 24, marginBottom: 20 },
  title: { fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#e2e8f0" },
  sub: { fontSize: 13, color: "#94a3b8", marginBottom: 16 },
  typeRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  typeBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #1e2a40", background: "transparent", color: "#4a5568", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" },
  typeBtnActive: { borderColor: "rgba(201,168,76,0.4)", color: "#c9a84c", background: "rgba(201,168,76,0.1)" },
  uploadZone: { border: "2px dashed #263350", borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", marginBottom: 12, color: "#e2e8f0", transition: "all 0.2s" },
  uploadZoneOver: { borderColor: "#c9a84c", background: "rgba(201,168,76,0.08)" },
  fileList: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  fileItem: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#111827", border: "1px solid #1e2a40", borderRadius: 8 },
  removeBtn: { background: "none", border: "none", color: "#4a5568", cursor: "pointer", fontSize: 13, padding: "2px 4px" },
  analyzeBtn: { width: "100%", padding: 12, borderRadius: 9, border: "none", background: "linear-gradient(135deg,#c9a84c,#8a6010)", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 16 },
  analyzeBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  result: { background: "#111827", border: "1px solid #1e2a40", borderRadius: 10, padding: 16 },
  resultTitle: { fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #1e2a40" }
}

export default ContractAnalyzer