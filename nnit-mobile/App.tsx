import React from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput, ActivityIndicator, Alert, Linking, Modal } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const C = {
  bg: "#08090d", surface: "#0f1117", panel: "#151821", border: "#1e2130",
  accent: "#4f7cff", accent2: "#7c4fff", gold: "#f0c040", success: "#22c55e",
  danger: "#ef4444", warn: "#f59e0b", text: "#e8eaf0", muted: "#6b7280",
}
const API = "https://nnit-legal-ai-production.up.railway.app"

const LANGS: Record<string, string> = {
  en: "Respond in English.", de: "Antworte auf Deutsch.", nl: "Antwoord in het Nederlands.",
  fr: "Reponds en francais.", es: "Responde en espanol.", it: "Rispondi in italiano.",
  pt: "Responda em portugues.", ar: "Ajib bil arabiyya.", zh: "Qing yong zhongwen huida.",
  ja: "Nihongo de kotaete kudasai.", ko: "Hangugeo ro dapdaehaseyo.", ru: "Otvechay po-russki.",
}

let currentLang = "en"

async function askAI(messages: any[], system = "You are NNIT Legal AI, a professional legal assistant.") {
  try {
    const r = await fetch(API + "/api/legal-ai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt: system + " " + (LANGS[currentLang] || ""), max_tokens: 1500 }),
    })
    const d = await r.json()
    return d.result || d.error || "Error getting response"
  } catch (e: any) {
    return "Connection error: " + e.message
  }
}

// ── SHARED COMPONENTS ──
function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={{ backgroundColor: C.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
      {onBack && <TouchableOpacity onPress={onBack}><Ionicons name="arrow-back" size={22} color={C.text} /></TouchableOpacity>}
      <Text style={{ fontSize: 16, fontWeight: "700", color: C.text, flex: 1 }}>{title}</Text>
    </View>
  )
}

function Btn({ label, onPress, color, disabled, small }: any) {
  return (
    <TouchableOpacity
      style={{ backgroundColor: color || C.accent, padding: small ? 8 : 13, borderRadius: 8, alignItems: "center", opacity: disabled ? 0.6 : 1 }}
      onPress={onPress} disabled={disabled}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: small ? 12 : 14 }}>{label}</Text>
    </TouchableOpacity>
  )
}

function Input({ label, value, onChange, placeholder, multiline, secure, keyboard }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</Text>}
      <TextInput
        style={{ backgroundColor: C.bg, borderRadius: 8, borderWidth: 1, borderColor: C.border, color: C.text, padding: 10, fontSize: 13, minHeight: multiline ? 90 : undefined }}
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted}
        multiline={multiline} secureTextEntry={secure} keyboardType={keyboard || "default"} autoCapitalize={keyboard === "email-address" ? "none" : "sentences"}
      />
    </View>
  )
}

function Panel({ children, style }: any) {
  return <View style={[{ backgroundColor: C.panel, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 }, style]}>{children}</View>
}

function ResultBox({ text, onDownload, onSave, onRead }: any) {
  if (!text) return null
  return (
    <Panel>
      <Text style={{ color: C.text, fontSize: 13, lineHeight: 20 }}>{text}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {onDownload && <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, padding: 7, borderRadius: 6 }} onPress={onDownload}><Text style={{ color: C.muted, fontSize: 11 }}>Download</Text></TouchableOpacity>}
        {onSave && <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, padding: 7, borderRadius: 6 }} onPress={onSave}><Text style={{ color: C.muted, fontSize: 11 }}>Save</Text></TouchableOpacity>}
      </View>
    </Panel>
  )
}

// ── HOME ──
function HomeScreen({ navigation }: any) {
  const features = [
    { icon: "chatbubble-outline", label: "AI Legal Chat", screen: "Chat" },
    { icon: "videocam-outline", label: "Video Meetings", screen: "Meeting" },
    { icon: "calendar-outline", label: "Schedule Meeting", screen: "Schedule" },
    { icon: "document-text-outline", label: "Document Generator", screen: "DocGen" },
    { icon: "search-outline", label: "Contract Analyzer", screen: "Analyze" },
    { icon: "shield-outline", label: "Case Builder", screen: "Case" },
    { icon: "checkmark-circle-outline", label: "Compliance Scanner", screen: "Comply" },
    { icon: "warning-outline", label: "Risk Assessment", screen: "Risk" },
    { icon: "time-outline", label: "Extract Deadlines", screen: "Deadlines" },
    { icon: "people-outline", label: "Identify Parties", screen: "Parties" },
    { icon: "camera-outline", label: "Camera Scanner", screen: "Camera" },
    { icon: "copy-outline", label: "500+ Templates", screen: "Templates" },
    { icon: "mic-outline", label: "Voice Writer", screen: "Voice" },
    { icon: "card-outline", label: "Book Consultation", screen: "Pay" },
    { icon: "person-outline", label: "Client Portal", screen: "Portal" },
    { icon: "save-outline", label: "Saved Documents", screen: "Saved" },
    { icon: "settings-outline", label: "Settings", screen: "Settings" },
  ]
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ backgroundColor: C.accent, padding: 20, paddingTop: 36 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>NNIT Legal AI</Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 2, fontSize: 12 }}>Professional Legal Assistant</Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {["GPT-4", "GDPR", "500+ Templates", "Live Meetings"].map(p => (
            <View key={p} style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1, padding: 14 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {features.map(f => (
            <TouchableOpacity key={f.screen} style={{ width: "47%", backgroundColor: C.panel, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border }} onPress={() => navigation.navigate(f.screen)}>
              <Ionicons name={f.icon as any} size={24} color={C.accent} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.text }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ margin: 4, marginTop: 16, backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" }}>
          <Text style={{ color: C.warn, fontSize: 11 }}>AI legal advice is informational only. Consult a licensed attorney for official representation.</Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── AI CHAT ──
function ChatScreen({ navigation }: any) {
  const [msgs, setMsgs] = React.useState([{ r: "ai", t: "Hello! I am your NNIT Legal AI assistant. Ask me anything about contracts, employment law, GDPR, compliance, intellectual property, or any legal matter." }])
  const [inp, setInp] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const scrollRef = React.useRef<ScrollView>(null)
  const quick = ["What are my rights as an employee?", "Explain GDPR for small businesses", "What should an NDA include?", "How do I handle a contract dispute?"]

  const send = async (txt?: string) => {
    const m = txt || inp
    if (!m.trim() || load) return
    setInp("")
    const newMsgs = [...msgs, { r: "user", t: m }]
    setMsgs(newMsgs)
    setLoad(true)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    const rep = await askAI(newMsgs.map(x => ({ role: x.r === "user" ? "user" : "assistant", content: x.t })))
    setMsgs(p => [...p, { r: "ai", t: rep }])
    setLoad(false)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="AI Legal Chat" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {quick.map(q => (
          <TouchableOpacity key={q} style={{ paddingHorizontal: 12, paddingVertical: 10, marginLeft: 8 }} onPress={() => send(q)}>
            <Text style={{ fontSize: 11, color: C.muted }}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView ref={scrollRef} style={{ flex: 1, padding: 14 }}>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignSelf: m.r === "user" ? "flex-end" : "flex-start", backgroundColor: m.r === "user" ? C.accent : C.panel, borderRadius: 12, padding: 12, marginBottom: 10, maxWidth: "85%", borderWidth: m.r === "ai" ? 1 : 0, borderColor: C.border, borderBottomRightRadius: m.r === "user" ? 2 : 12, borderBottomLeftRadius: m.r === "ai" ? 2 : 12 }}>
            {m.r === "ai" && <Text style={{ fontSize: 9, color: C.accent, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>NNIT LEGAL AI</Text>}
            <Text style={{ color: m.r === "user" ? "#fff" : C.text, fontSize: 13, lineHeight: 20 }}>{m.t}</Text>
          </View>
        ))}
        {load && <View style={{ alignSelf: "flex-start", backgroundColor: C.panel, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border }}><ActivityIndicator color={C.accent} /></View>}
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={{ flexDirection: "row", padding: 12, gap: 8, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border }}>
        <TextInput style={{ flex: 1, backgroundColor: C.bg, borderRadius: 8, borderWidth: 1, borderColor: C.border, color: C.text, padding: 10, fontSize: 13, maxHeight: 100 }} value={inp} onChangeText={setInp} placeholder="Ask your legal question..." placeholderTextColor={C.muted} multiline onSubmitEditing={() => send()} />
        <TouchableOpacity style={{ backgroundColor: C.accent, borderRadius: 8, width: 44, height: 44, alignItems: "center", justifyContent: "center" }} onPress={() => send()}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ── MEETINGS ──
function MeetingScreen({ navigation }: any) {
  const [room, setRoom] = React.useState("nnit-legal-" + Math.random().toString(36).substr(2, 6))
  const [type, setType] = React.useState("1-on-1 Consultation")
  const types = ["1-on-1 Consultation", "Group Workshop", "Contract Review", "Case Strategy", "Compliance Training"]

  const join = () => Linking.openURL("https://meet.jit.si/" + room)
  const copyLink = () => Alert.alert("Invite Link", "https://meet.jit.si/" + room + "\n\nShare this link with your client.")

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Video Meetings" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 14 }}>Start a Meeting</Text>
          <Input label="Room Name" value={room} onChange={setRoom} placeholder="nnit-legal-room" />
          <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Meeting Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {types.map(t => (
              <TouchableOpacity key={t} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: type === t ? C.accent : C.border, marginRight: 8, backgroundColor: type === t ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => setType(t)}>
                <Text style={{ color: type === t ? C.accent : C.muted, fontWeight: "600", fontSize: 11 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Btn label="Start Meeting (opens browser)" onPress={join} />
          <TouchableOpacity style={{ borderWidth: 1, borderColor: C.border, padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 }} onPress={copyLink}>
            <Text style={{ color: C.accent, fontWeight: "600", fontSize: 13 }}>Copy Invite Link</Text>
          </TouchableOpacity>
        </Panel>
        <Panel>
          <Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 10 }}>Meeting Features</Text>
          {["Unlimited participants (Jitsi - free)", "Screen sharing built in", "In-meeting chat", "Secure encrypted rooms", "Works on all devices"].map(f => (
            <Text key={f} style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>- {f}</Text>
          ))}
        </Panel>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── SCHEDULE ──
function ScheduleScreen({ navigation }: any) {
  const [client, setClient] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("")
  const [type, setType] = React.useState("1-on-1 Consultation")
  const [agenda, setAgenda] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)

  const schedule = async () => {
    if (!client || !date || !time) { Alert.alert("Please fill in client name, date and time"); return }
    const room = "nnit-" + client.toLowerCase().replace(/\s+/g, "-") + "-" + date.replace(/-/g, "")
    setResult("Meeting scheduled!\n\nClient: " + client + "\nDate: " + date + " at " + time + "\nType: " + type + "\nRoom Link: https://meet.jit.si/" + room)
    if (email) {
      try {
        await fetch(API + "/email/meeting-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientName: client, clientEmail: email, meetingDate: date, meetingTime: time, duration: "1 hour", type, roomName: room, agenda }) })
        setResult(r => r + "\n\nInvitation email sent to " + email)
      } catch (e) { }
    }
  }

  const genAgenda = async () => {
    setLoad(true)
    const a = await askAI([{ role: "user", content: "Generate a professional meeting agenda for a " + type + " with " + (client || "the client") + ". Include opening, key discussion points, action items, and closing." }])
    setAgenda(a); setLoad(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Schedule Meeting" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Input label="Client Name" value={client} onChange={setClient} placeholder="Client full name" />
          <Input label="Client Email" value={email} onChange={setEmail} placeholder="client@email.com" keyboard="email-address" />
          <Input label="Meeting Date (YYYY-MM-DD)" value={date} onChange={setDate} placeholder="2026-04-10" />
          <Input label="Meeting Time" value={time} onChange={setTime} placeholder="10:00 AM" />
          <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {["1-on-1 Consultation", "Group Session", "Contract Review", "Case Strategy"].map(t => (
              <TouchableOpacity key={t} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: type === t ? C.accent : C.border, marginRight: 8, backgroundColor: type === t ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => setType(t)}>
                <Text style={{ color: type === t ? C.accent : C.muted, fontWeight: "600", fontSize: 11 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Input label="Agenda / Notes" value={agenda} onChange={setAgenda} placeholder="Topics to discuss..." multiline />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Btn label="Schedule Meeting" onPress={schedule} /></View>
            <View style={{ flex: 1 }}><Btn label={load ? "..." : "AI Agenda"} onPress={genAgenda} color={C.panel} disabled={load} /></View>
          </View>
        </Panel>
        {result ? <Panel><Text style={{ color: C.success, fontSize: 13, lineHeight: 20 }}>{result}</Text></Panel> : null}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── DOC GEN ──
function DocGenScreen({ navigation }: any) {
  const [docType, setDocType] = React.useState("Non-Disclosure Agreement (NDA)")
  const [p1, setP1] = React.useState("NNIT Tech GmbH")
  const [p2, setP2] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const types = ["Non-Disclosure Agreement (NDA)", "Employment Contract", "Service Agreement", "Partnership Agreement", "Privacy Policy", "Terms of Service", "Cease & Desist Letter", "Demand Letter", "Freelance Contract", "Lease Agreement"]

  const generate = async () => {
    if (!p2.trim()) { Alert.alert("Please enter the other party name"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Generate a professional " + docType + ".\nParty 1: " + p1 + "\nParty 2: " + p2 + "\nDetails: " + details + "\nCreate a complete formal legal document with all standard clauses." }], "You are a professional legal document drafter.")
    setResult(res); setLoad(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Document Generator" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Document Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {types.map(t => <TouchableOpacity key={t} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: docType === t ? C.accent : C.border, marginRight: 8, backgroundColor: docType === t ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => setDocType(t)}><Text style={{ color: docType === t ? C.accent : C.muted, fontWeight: "600", fontSize: 11 }}>{t}</Text></TouchableOpacity>)}
          </ScrollView>
          <Input label="Your Name / Company" value={p1} onChange={setP1} placeholder="Your company name" />
          <Input label="Other Party" value={p2} onChange={setP2} placeholder="Client / Partner name" />
          <Input label="Key Details & Requirements" value={details} onChange={setDetails} placeholder="Terms, duration, jurisdiction, payment, special clauses..." multiline />
          <Btn label={load ? "Generating..." : "Generate Document"} onPress={generate} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 16 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── ANALYZE ──
function AnalyzeScreen({ navigation }: any) {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const analyze = async () => {
    if (!text.trim()) { Alert.alert("Please paste contract text"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Analyze this contract thoroughly. Cover: key clauses, obligations for each party, rights granted, termination conditions, liability provisions, payment terms, IP ownership, and any red flags.\n\n" + text }])
    setResult(res); setLoad(false)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Contract Analyzer" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Input label="Paste Contract Text" value={text} onChange={setText} placeholder="Paste your contract text here..." multiline />
          <Btn label={load ? "Analyzing..." : "Analyze Contract"} onPress={analyze} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── RISK ──
function RiskScreen({ navigation }: any) {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const assess = async () => {
    if (!text.trim()) { Alert.alert("Please paste document text"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Identify all legal risks in this document. For each risk: name it, rate it (High/Medium/Low), explain the concern, and suggest mitigation.\n\n" + text }])
    setResult(res); setLoad(false)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Risk Assessment" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Input label="Paste Document Text" value={text} onChange={setText} placeholder="Paste document text here..." multiline />
          <Btn label={load ? "Assessing..." : "Assess Risks"} onPress={assess} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── DEADLINES ──
function DeadlinesScreen({ navigation }: any) {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const extract = async () => {
    if (!text.trim()) { Alert.alert("Please paste document text"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Extract ALL dates, deadlines, notice periods, renewal dates, payment schedules, and any time-sensitive obligations. Format as a clear list.\n\n" + text }])
    setResult(res); setLoad(false)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Extract Deadlines" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Input label="Paste Document Text" value={text} onChange={setText} placeholder="Paste document text here..." multiline />
          <Btn label={load ? "Extracting..." : "Extract Deadlines"} onPress={extract} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── PARTIES ──
function PartiesScreen({ navigation }: any) {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const identify = async () => {
    if (!text.trim()) { Alert.alert("Please paste document text"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Identify all parties in this document. For each party: their name/description, role, key obligations, rights, and liabilities.\n\n" + text }])
    setResult(res); setLoad(false)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Identify Parties" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Input label="Paste Document Text" value={text} onChange={setText} placeholder="Paste document text here..." multiline />
          <Btn label={load ? "Identifying..." : "Identify Parties"} onPress={identify} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── CASE BUILDER ──
function CaseScreen({ navigation }: any) {
  const [caseType, setCaseType] = React.useState("Contract Dispute")
  const [position, setPosition] = React.useState("Claimant / Plaintiff")
  const [jurisdiction, setJurisdiction] = React.useState("European Union")
  const [facts, setFacts] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const caseTypes = ["Contract Dispute", "Employment Dispute", "IP Infringement", "Personal Injury", "Debt Recovery", "Criminal Defence", "GDPR Violation", "Consumer Rights"]
  const positions = ["Claimant / Plaintiff", "Defendant", "Third Party"]
  const jurisdictions = ["European Union", "United Kingdom", "Germany", "Netherlands", "United States", "France", "Other"]

  const build = async () => {
    if (!facts.trim()) { Alert.alert("Please describe your case facts"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Case Type: " + caseType + "\nPosition: " + position + "\nJurisdiction: " + jurisdiction + "\nFacts: " + facts + "\n\nBuild a comprehensive legal case strategy including: 1) Case assessment 2) Legal arguments 3) Evidence needed 4) Recommended next steps 5) Risk assessment" }], "You are an expert legal strategist.")
    setResult(res); setLoad(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Case Builder" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          {[["Case Type", caseTypes, caseType, setCaseType], ["Your Position", positions, position, setPosition], ["Jurisdiction", jurisdictions, jurisdiction, setJurisdiction]].map(([lbl, opts, val, set]: any) => (
            <View key={lbl}>
              <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>{lbl}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {opts.map((o: string) => <TouchableOpacity key={o} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: val === o ? C.accent : C.border, marginRight: 8, backgroundColor: val === o ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => set(o)}><Text style={{ color: val === o ? C.accent : C.muted, fontWeight: "600", fontSize: 11 }}>{o}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
          ))}
          <Input label="Describe Your Case Facts" value={facts} onChange={setFacts} placeholder="What happened, key dates, parties involved, evidence you have, what outcome you want..." multiline />
          <Btn label={load ? "Building..." : "Build Case Strategy"} onPress={build} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── COMPLIANCE ──
function ComplyScreen({ navigation }: any) {
  const [bizType, setBizType] = React.useState("Sole Trader")
  const [desc, setDesc] = React.useState("")
  const [result, setResult] = React.useState("")
  const [load, setLoad] = React.useState(false)
  const bizTypes = ["Sole Trader", "Limited Company", "Partnership", "E-Commerce", "SaaS / Software", "Healthcare", "Finance", "Non-Profit"]

  const scan = async () => {
    if (!desc.trim()) { Alert.alert("Please describe your business activities"); return }
    setLoad(true); setResult("")
    const res = await askAI([{ role: "user", content: "Business Type: " + bizType + "\nBusiness Activities: " + desc + "\n\nProvide a comprehensive compliance scan including: 1) GDPR compliance requirements 2) Industry-specific regulations 3) Required licenses/registrations 4) Employment law obligations 5) Tax compliance 6) Data protection requirements 7) Risk areas 8) Action items prioritized by urgency" }], "You are a compliance expert.")
    setResult(res); setLoad(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Compliance Scanner" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Select Business Type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {bizTypes.map(b => <TouchableOpacity key={b} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: bizType === b ? C.accent : C.border, backgroundColor: bizType === b ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => setBizType(b)}><Text style={{ color: bizType === b ? C.accent : C.muted, fontWeight: "600", fontSize: 11 }}>{b}</Text></TouchableOpacity>)}
          </View>
          <Input label="Describe Your Business Activities" value={desc} onChange={setDesc} placeholder="What does your business do? What data do you collect? Which countries?" multiline />
          <Btn label={load ? "Scanning..." : "Run Compliance Scan"} onPress={scan} disabled={load} />
        </Panel>
        {load && <ActivityIndicator color={C.accent} style={{ marginTop: 8 }} />}
        <ResultBox text={result} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── TEMPLATES ──
const TEMPLATES = [
  { name: "NDA (Mutual)", cat: "Contracts" }, { name: "NDA (One-Way)", cat: "Contracts" },
  { name: "Employment Contract", cat: "Employment" }, { name: "Freelance Agreement", cat: "Employment" },
  { name: "Non-Compete Clause", cat: "Employment" }, { name: "Service Agreement", cat: "Business" },
  { name: "Partnership Agreement", cat: "Business" }, { name: "Shareholder Agreement", cat: "Business" },
  { name: "Joint Venture Agreement", cat: "Business" }, { name: "Consulting Agreement", cat: "Business" },
  { name: "Privacy Policy (GDPR)", cat: "Compliance" }, { name: "Terms of Service", cat: "Compliance" },
  { name: "Cookie Policy", cat: "Compliance" }, { name: "Data Processing Agreement", cat: "Compliance" },
  { name: "Residential Lease", cat: "Property" }, { name: "Commercial Lease", cat: "Property" },
  { name: "Cease & Desist Letter", cat: "Letters" }, { name: "Demand Letter", cat: "Letters" },
  { name: "Letter of Intent", cat: "Letters" }, { name: "Settlement Offer", cat: "Letters" },
  { name: "Loan Agreement", cat: "Finance" }, { name: "Payment Plan Agreement", cat: "Finance" },
  { name: "SaaS Agreement", cat: "Tech" }, { name: "Software License", cat: "Tech" },
  { name: "API Terms of Use", cat: "Tech" }, { name: "Settlement Agreement", cat: "Dispute" },
  { name: "Supply Agreement", cat: "Business" }, { name: "Distribution Agreement", cat: "Business" },
]

function TemplatesScreen({ navigation }: any) {
  const [search, setSearch] = React.useState("")
  const filtered = TEMPLATES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase()))

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="500+ Legal Templates" onBack={() => navigation.goBack()} />
      <View style={{ padding: 12 }}>
        <TextInput style={{ backgroundColor: C.panel, borderRadius: 8, borderWidth: 1, borderColor: C.border, color: C.text, padding: 10 }} value={search} onChangeText={setSearch} placeholder="Search templates..." placeholderTextColor={C.muted} />
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {filtered.map(t => (
            <TouchableOpacity key={t.name} style={{ width: "47%", backgroundColor: C.panel, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: C.border }} onPress={() => navigation.navigate("DocGen", { template: t.name })}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: C.text, marginBottom: 2 }}>{t.name}</Text>
              <Text style={{ fontSize: 10, color: C.muted }}>{t.cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── VOICE ──
function VoiceScreen({ navigation }: any) {
  const [text, setText] = React.useState("")
  const speak = () => {
    if (!text.trim()) { Alert.alert("Please enter text to read"); return }
    Alert.alert("Voice Reader", "Text-to-speech requires Expo Speech. Add expo-speech to your project to enable this feature.\n\nText: " + text.substr(0, 100) + "...")
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Voice Tools" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 }}>Voice Reader</Text>
          <Input label="Text to Read" value={text} onChange={setText} placeholder="Paste any legal text here and press Play..." multiline />
          <Btn label="Play Text Aloud" onPress={speak} />
        </Panel>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 8 }}>Voice Input</Text>
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>Use the AI Chat screen and type your question. Voice dictation can be enabled through your phone keyboard microphone button.</Text>
          <View style={{ marginTop: 12 }}>
            <Btn label="Go to AI Chat" onPress={() => navigation.navigate("MainTabs", { screen: "chat" })} />
          </View>
        </Panel>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── PAYMENTS ──
function PayScreen({ navigation }: any) {
  const plans = [
    { id: "30min", label: "30 Minute Consultation", price: "EUR 50", desc: "Quick legal advice or Q&A" },
    { id: "1hour", label: "1 Hour Consultation", price: "EUR 99", desc: "In-depth legal consultation" },
    { id: "contract-review", label: "Contract Review Session", price: "EUR 149", desc: "Full contract analysis & risks" },
    { id: "2hour", label: "2 Hour Consultation", price: "EUR 179", desc: "Extended session for complex matters" },
    { id: "case-strategy", label: "Full Case Strategy", price: "EUR 249", desc: "Complete case analysis & action plan" },
  ]
  const [sel, setSel] = React.useState("")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [load, setLoad] = React.useState(false)

  const pay = async () => {
    if (!sel || !name || !email) { Alert.alert("Please select a plan and enter your details"); return }
    setLoad(true)
    try {
      const room = "nnit-" + name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
      const r = await fetch(API + "/payments/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId: sel, clientName: name, clientEmail: email, meetingRoom: room, meetingDate: new Date().toISOString().split("T")[0] }) })
      const d = await r.json()
      if (d.url) Linking.openURL(d.url)
      else Alert.alert("Error", d.error || "Payment failed")
    } catch (e: any) { Alert.alert("Error", e.message) }
    setLoad(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Book Consultation" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>Choose a consultation type and pay securely via Stripe. You will receive a meeting link by email.</Text>
        {plans.map(p => (
          <TouchableOpacity key={p.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.panel, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: sel === p.id ? C.accent : C.border, marginBottom: 10 }} onPress={() => setSel(p.id)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: C.text, fontSize: 13 }}>{p.label}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{p.desc}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "800", color: p.id === "case-strategy" ? C.gold : C.accent }}>{p.price}</Text>
          </TouchableOpacity>
        ))}
        {sel && (
          <Panel>
            <Input label="Your Full Name" value={name} onChange={setName} placeholder="John Smith" />
            <Input label="Your Email" value={email} onChange={setEmail} placeholder="john@example.com" keyboard="email-address" />
            <Btn label={load ? "Processing..." : "Pay Securely with Stripe"} onPress={pay} disabled={load} />
            <Text style={{ color: C.muted, fontSize: 10, textAlign: "center", marginTop: 8 }}>Secured by Stripe. Your card details are never stored.</Text>
          </Panel>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── PORTAL ──
function PortalScreen({ navigation }: any) {
  const [tab, setTab] = React.useState<"login" | "register">("login")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [pass, setPass] = React.useState("")
  const [client, setClient] = React.useState<any>(null)
  const [docs, setDocs] = React.useState<any[]>([])

  React.useEffect(() => {
    AsyncStorage.getItem("nnit-client").then(s => {
      if (s) { const c = JSON.parse(s); setClient(c); loadDocs(c.token) }
    })
  }, [])

  const loadDocs = async (token: string) => {
    try {
      const r = await fetch(API + "/clients/documents", { headers: { "Authorization": "Bearer " + token } })
      const d = await r.json(); setDocs(Array.isArray(d) ? d : [])
    } catch (e) { }
  }

  const auth = async () => {
    const url = tab === "login" ? API + "/clients/login" : API + "/clients/register"
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tab === "login" ? { email, password: pass } : { name, email, password: pass }) })
      const d = await r.json()
      if (d.error) { Alert.alert("Error", d.error); return }
      await AsyncStorage.setItem("nnit-client", JSON.stringify({ ...d.client, token: d.token }))
      setClient({ ...d.client, token: d.token }); loadDocs(d.token)
    } catch (e: any) { Alert.alert("Error", e.message) }
  }

  const logout = async () => { await AsyncStorage.removeItem("nnit-client"); setClient(null); setDocs([]) }

  if (client) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ backgroundColor: C.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>Client Portal</Text>
        <TouchableOpacity onPress={logout}><Text style={{ color: C.danger, fontWeight: "600" }}>Logout</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 18, fontWeight: "700", color: C.text }}>Welcome, {client.name}!</Text>
          <Text style={{ color: C.muted, marginTop: 4 }}>{client.email}</Text>
        </Panel>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 }}>My Documents</Text>
          {docs.length === 0 ? <Text style={{ color: C.muted, fontSize: 13 }}>No documents yet. Your legal documents will appear here after consultations.</Text>
            : docs.map(d => <View key={d.id} style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: C.bg, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: C.border }}><Text style={{ color: C.text, fontSize: 13, fontWeight: "600" }}>{d.title}</Text><Text style={{ color: C.muted, fontSize: 11 }}>{new Date(d.created_at).toLocaleDateString()}</Text></View>)}
        </Panel>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Client Portal" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {(["login", "register"] as const).map(t => <TouchableOpacity key={t} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: tab === t ? C.accent : C.panel, alignItems: "center", borderWidth: 1, borderColor: tab === t ? C.accent : C.border }} onPress={() => setTab(t)}><Text style={{ color: tab === t ? "#fff" : C.muted, fontWeight: "600" }}>{t === "login" ? "Login" : "Register"}</Text></TouchableOpacity>)}
        </View>
        <Panel>
          {tab === "register" && <Input label="Full Name" value={name} onChange={setName} placeholder="John Smith" />}
          <Input label="Email" value={email} onChange={setEmail} placeholder="your@email.com" keyboard="email-address" />
          <Input label="Password" value={pass} onChange={setPass} placeholder="Your password" secure />
          <Btn label={tab === "login" ? "Login to Portal" : "Create Account"} onPress={auth} />
        </Panel>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── SAVED ──
function SavedScreen({ navigation }: any) {
  const [docs, setDocs] = React.useState<any[]>([])

  React.useEffect(() => {
    AsyncStorage.getItem("nnit-saved-docs").then(s => setDocs(s ? JSON.parse(s) : []))
  }, [])

  const del = async (id: number) => {
    const newDocs = docs.filter(d => d.id !== id)
    setDocs(newDocs); await AsyncStorage.setItem("nnit-saved-docs", JSON.stringify(newDocs))
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Saved Documents" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {docs.length === 0 ? (
          <Panel><Text style={{ color: C.muted, textAlign: "center", padding: 20 }}>No saved documents yet. Generate documents and save them here.</Text></Panel>
        ) : docs.map(d => (
          <View key={d.id} style={{ backgroundColor: C.panel, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>{d.title}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{new Date(d.date).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => del(d.id)} style={{ backgroundColor: "rgba(239,68,68,0.15)", padding: 6, borderRadius: 6 }}>
              <Text style={{ color: C.danger, fontSize: 12, fontWeight: "600" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── SETTINGS ──
function SettingsScreen({ navigation }: any) {
  const langs = [["en", "English"], ["de", "Deutsch"], ["nl", "Nederlands"], ["fr", "Francais"], ["es", "Espanol"], ["it", "Italiano"], ["pt", "Portugues"], ["ar", "Arabic"], ["zh", "Chinese"], ["ja", "Japanese"], ["ko", "Korean"], ["ru", "Russian"]]
  const [lang, setLang] = React.useState(currentLang)

  const changeLang = (l: string) => { currentLang = l; setLang(l); AsyncStorage.setItem("nnit-lang", l) }

  React.useEffect(() => { AsyncStorage.getItem("nnit-lang").then(l => { if (l) { currentLang = l; setLang(l) } }) }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 }}>AI Response Language</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {langs.map(([code, name]) => (
              <TouchableOpacity key={code} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: lang === code ? C.accent : C.border, backgroundColor: lang === code ? "rgba(79,124,255,0.1)" : C.bg }} onPress={() => changeLang(code)}>
                <Text style={{ color: lang === code ? C.accent : C.muted, fontWeight: "600", fontSize: 12 }}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Panel>
        <Panel>
          <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 8 }}>About NNIT Legal AI</Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 20 }}>Version 1.0.0{"\n"}Developed by Solomon Omomeje Ayodele{"\n"}networkniceit@gmail.com{"\n"}Minden, Germany{"\n\n"}AI legal advice is informational only. Consult a licensed attorney for official legal representation.</Text>
        </Panel>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── NAVIGATION ──
const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, any> = { Home: "home-outline", Chat: "chatbubble-outline", Meet: "videocam-outline", Docs: "document-text-outline", More: "grid-outline" }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: C.accent, tabBarInactiveTintColor: C.muted,
      tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, height: 62, paddingBottom: 6 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600" }, headerShown: false,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Meet" component={MeetingScreen} />
      <Tab.Screen name="Docs" component={DocGenScreen} />
      <Tab.Screen name="More" component={MoreMenuScreen} />
    </Tab.Navigator>
  )
}

function MoreMenuScreen({ navigation }: any) {
  const items = [
    { icon: "calendar-outline", label: "Schedule Meeting", screen: "Schedule" },
    { icon: "search-outline", label: "Contract Analyzer", screen: "Analyze" },
    { icon: "shield-outline", label: "Case Builder", screen: "Case" },
    { icon: "checkmark-circle-outline", label: "Compliance Scanner", screen: "Comply" },
    { icon: "warning-outline", label: "Risk Assessment", screen: "Risk" },
    { icon: "time-outline", label: "Extract Deadlines", screen: "Deadlines" },
    { icon: "people-outline", label: "Identify Parties", screen: "Parties" },
    { icon: "camera-outline", label: "Camera Scanner", screen: "Camera" },
    { icon: "copy-outline", label: "500+ Templates", screen: "Templates" },
    { icon: "mic-outline", label: "Voice Tools", screen: "Voice" },
    { icon: "card-outline", label: "Book Consultation", screen: "Pay" },
    { icon: "person-outline", label: "Client Portal", screen: "Portal" },
    { icon: "save-outline", label: "Saved Documents", screen: "Saved" },
    { icon: "settings-outline", label: "Settings", screen: "Settings" },
  ]
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ backgroundColor: C.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: C.text }}>All Features</Text>
      </View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {items.map(item => (
          <TouchableOpacity key={item.screen} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.panel, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 }} onPress={() => navigation.navigate(item.screen)}>
            <Ionicons name={item.icon as any} size={22} color={C.accent} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: C.text }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <NavigationContainer theme={{ dark: true, colors: { primary: C.accent, background: C.bg, card: C.surface, text: C.text, border: C.border, notification: C.accent } }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={Tabs} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Analyze" component={AnalyzeScreen} />
        <Stack.Screen name="Case" component={CaseScreen} />
        <Stack.Screen name="Comply" component={ComplyScreen} />
        <Stack.Screen name="Risk" component={RiskScreen} />
        <Stack.Screen name="Deadlines" component={DeadlinesScreen} />
        <Stack.Screen name="Parties" component={PartiesScreen} />
        <Stack.Screen name="Templates" component={TemplatesScreen} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
        <Stack.Screen name="Pay" component={PayScreen} />
        <Stack.Screen name="Portal" component={PortalScreen} />
        <Stack.Screen name="Saved" component={SavedScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DocGen" component={DocGenScreen} />
        <Stack.Screen name="Meeting" component={MeetingScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />`n        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


