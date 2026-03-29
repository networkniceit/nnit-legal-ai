import express from "express"
import nodemailer from "nodemailer"
const router = express.Router()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

router.post("/meeting-invite", async (req, res) => {
  try {
    const { clientName, clientEmail, meetingDate, meetingTime, duration, type, roomName, agenda } = req.body
    const meetingLink = `https://meet.jit.si/${roomName}`

    await transporter.sendMail({
      from: `"NNIT Legal AI" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `Meeting Invitation: ${type} — ${meetingDate} at ${meetingTime}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px">
          <div style="background:linear-gradient(135deg,#4f7cff,#7c4fff);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px">
            <h1 style="color:white;margin:0;font-size:24px">⚖️ NNIT Legal AI</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Professional Legal Assistant</p>
          </div>
          <h2 style="color:#1a1a2e">Hello ${clientName},</h2>
          <p style="color:#444;line-height:1.6">You have a legal consultation scheduled with Solomon Omomeje Ayodele at NNIT Legal AI.</p>
          <div style="background:white;border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin:20px 0">
            <h3 style="color:#4f7cff;margin-top:0">📅 Meeting Details</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#666;width:40%">Type:</td><td style="color:#1a1a2e;font-weight:600">${type}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Date:</td><td style="color:#1a1a2e;font-weight:600">${meetingDate}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Time:</td><td style="color:#1a1a2e;font-weight:600">${meetingTime}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Duration:</td><td style="color:#1a1a2e;font-weight:600">${duration}</td></tr>
            </table>
          </div>
          ${agenda ? `<div style="background:#f0f4ff;border-left:4px solid #4f7cff;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><h4 style="margin:0 0 8px;color:#4f7cff">📋 Agenda</h4><p style="margin:0;color:#444;white-space:pre-wrap;font-size:14px">${agenda}</p></div>` : ""}
          <div style="text-align:center;margin:24px 0">
            <a href="${meetingLink}" style="background:linear-gradient(135deg,#4f7cff,#7c4fff);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">📹 Join Meeting</a>
          </div>
          <p style="color:#666;font-size:13px">Or copy this link: <a href="${meetingLink}" style="color:#4f7cff">${meetingLink}</a></p>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0"/>
          <p style="color:#999;font-size:12px;text-align:center">NNIT Legal AI · networkniceit@gmail.com · Minden, Germany<br/>AI legal advice is informational only. Consult a licensed attorney for official representation.</p>
        </div>
      `,
    })

    res.json({ success: true, message: "Meeting invitation sent to " + clientEmail })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/payment-confirmation", async (req, res) => {
  try {
    const { clientName, clientEmail, amount, type, meetingRoom } = req.body
    await transporter.sendMail({
      from: `"NNIT Legal AI" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `Payment Confirmed — ${type}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2>✅ Payment Confirmed</h2>
          <p>Hello ${clientName}, your payment of €${(amount/100).toFixed(2)} for ${type} has been confirmed.</p>
          <p>Your meeting room: <a href="https://meet.jit.si/${meetingRoom}">https://meet.jit.si/${meetingRoom}</a></p>
          <p>Thank you for choosing NNIT Legal AI.</p>
        </div>
      `,
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router