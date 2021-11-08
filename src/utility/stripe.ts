import Stripe from "stripe";
require('dotenv').config();
const secret = process.env.STRIPE_SECRET_KEY
// @ts-ignore
export const stripe = new Stripe(secret, {
    apiVersion: "2020-08-27",
    typescript: true,
});

export const customerID = (_parent: any) => {
    console.log(_parent)
    if (_parent?.stripeID != undefined) return _parent.stripeID;
    else if (_parent._doc?.stripeID != undefined) return _parent._doc.stripeID;
    else if (_parent._conditions?.stripeID != undefined) return _parent._conditions.stripeID;
}