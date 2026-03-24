// backend/services/billingService.js

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function createSubscriptionSession(userEmail){

const session = await stripe.checkout.sessions.create({

mode:"subscription",

customer_email:userEmail,

line_items:[
{
price:process.env.STRIPE_PRICE_ID,
quantity:1
}
],

success_url:"http://localhost:3000/success",
cancel_url:"http://localhost:3000/cancel"

})

return session.url

}