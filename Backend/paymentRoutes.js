import express from "express"
import Stripe from "stripe"
const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const CONSULTATION_PRICES = {
  "30min": { price: 5000, label: "30 Minute Consultation", duration: "30 minutes" },
  "1hour": { price: 9900, label: "1 Hour Consultation", duration: "1 hour" },
  "2hour": { price: 17900, label: "2 Hour Consultation", duration: "2 hours" },
  "contract-review": { price: 14900, label: "Contract Review Session", duration: "1 hour" },
  "case-strategy": { price: 24900, label: "Full Case Strategy Session", duration: "2 hours" },
}

router.post("/create-checkout", async (req, res) => {
  try {
    const { priceId, clientName, clientEmail, meetingRoom, meetingDate } = req.body
    const priceData = CONSULTATION_PRICES[priceId]
    if (!priceData) return res.status(400).json({ error: "Invalid price ID" })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: priceData.label,
            description: `NNIT Legal AI Consultation — ${priceData.duration} with Solomon Omomeje Ayodele`,
          },
          unit_amount: priceData.price,
        },
        quantity: 1,
      }],
      mode: "payment",
      customer_email: clientEmail,
      metadata: { clientName, meetingRoom, meetingDate, priceId },
      success_url: `${process.env.FRONTEND_URL || "https://nnit-legal-ai-zfgy.vercel.app"}?payment=success&room=${meetingRoom}`,
      cancel_url: `${process.env.FRONTEND_URL || "https://nnit-legal-ai-zfgy.vercel.app"}?payment=cancelled`,
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/prices", (req, res) => {
  res.json(CONSULTATION_PRICES)
})

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"]
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      console.log("Payment successful:", session.metadata)
    }
    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router