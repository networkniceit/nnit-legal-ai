// backend/controllers/billingController.js

import {createSubscriptionSession} from "../services/billingService.js"

export async function subscribe(req,res){

const {email} = req.body

const url = await createSubscriptionSession(email)

res.json({checkoutUrl:url})

}