import Stripe from "stripe";
require('dotenv').config();
const secret = process.env.STRIPE_SECRET_KEY
// @ts-ignore
export const stripe = new Stripe(secret, {
    apiVersion: "2020-08-27",
    typescript: true,
});