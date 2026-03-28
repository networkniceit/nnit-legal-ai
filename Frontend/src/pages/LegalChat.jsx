import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const languages = { en: "English", de: "Deutsch", fr: "Francais", es: "Espanol", ar: "Arabic", zh: "Chinese", hi: "Hindi", pt: "Portugues", ru: "Russian", ja: "Japanese", ko: "Korean", tr: "Turkce" };
const langCodes = { en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", ar: "ar-SA", zh: "zh-CN", hi: "hi-IN", pt: "pt-PT", ru: "ru-RU", ja: "ja-JP", ko: "ko-KR", tr: "tr-TR" };

export default function LegalChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! I am NNIT AI Legal Assistant. I can help you with legal questions, contract advice, tenant rights, employment law, business law, and more. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const question = `Respond in ${languages[language]}. ${input}`;
      const res = await api.post("/legal/chat", { question });
      const answer = res.data.answer;
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      speakText(answer);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI. Please try again." }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice not supported in this browser. Use Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = langCodes[language] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCodes[language] || "en-US";
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const openCamera = async () => {
    setShowCamera(true);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permission.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setInput(prev => prev + " [Photo captured - describe the document in this image]");
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
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
              {msg.role === "assistant" && (
                <button onClick={() => speakText(msg.content)} style={{ display: "block", marginTop: "8px", background: "none", border: "1px solid #444", color: "#667eea", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                  Read Aloud
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
            <div style={{ padding: "15px 20px", background: "#1a1a2e", borderRadius: "20px 20px 20px 5px", border: "1px solid #333", color: "#667eea" }}>AI is thinking...</div>
          </div>
        )}
      </div>

      {showCamera && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ color: "white", marginBottom: "16px" }}>Camera Scanner</h3>
          {cameraError ? (
            <p style={{ color: "red" }}>{cameraError}</p>
          ) : (
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "500px", borderRadius: "12px", border: "2px solid #667eea" }} />
          )}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={capturePhoto} style={{ padding: "10px 24px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Capture</button>
            <button onClick={closeCamera} style={{ padding: "10px 24px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}

      <div style={{ padding: "20px", background: "#1a1a2e", borderTop: "1px solid #333" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <button onClick={listening ? stopVoice : startVoice} style={{ padding: "8px 16px", background: listening ? "#dc3545" : "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
              {listening ? "Stop Listening" : "Voice Input"}
            </button>
            {speaking && (
              <button onClick={stopSpeaking} style={{ padding: "8px 16px", background: "#fd7e14", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                Stop Reading
              </button>
            )}
            <button onClick={openCamera} style={{ padding: "8px 16px", background: "#17a2b8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
              Camera Scanner
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder={listening ? "Listening..." : "Ask your legal question..."} rows={2} style={{ flex: 1, padding: "12px", background: listening ? "#1a2e1a" : "#2a2a3e", border: listening ? "1px solid #28a745" : "1px solid #444", borderRadius: "10px", color: "white", fontSize: "14px", resize: "none", fontFamily: "inherit" }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "12px 24px", background: loading ? "#444" : "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "14px" }}>Send</button>
          </div>
        </div>
        <p style={{ color: "#444", fontSize: "11px", textAlign: "center", marginTop: "10px" }}>AI legal advice is informational only. Consult a licensed attorney for official representation.</p>
      </div>
    </div>
  );
}
