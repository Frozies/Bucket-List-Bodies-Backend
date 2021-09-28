import Stripe from "stripe";
require('dotenv').config();
const secret = process.env.STRIPE_SECRET_KEY
// @ts-ignore
export const stripe = new Stripe(secret, {
    apiVersion: "2020-08-27",
    typescript: true,
});

export const customerID = (_parent: any) => {
    if (_parent?.customerId != undefined) return _parent.customerId;
    else if (_parent._doc?.customerId != undefined) return _parent._doc.customerId;
    else if (_parent._conditions?.customerId != undefined) return _parent._conditions.customerId;
}