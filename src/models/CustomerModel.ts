import mongoose from "mongoose";
import {addressSchema} from "./UtilityModel";

/*A customer has:
* id: a number generated iteratively
* firstName: The customer's first name
* lastName: The customer's last name
* phone: The customer's cellphone number
* address: A link to the address schema. The customer's delivery address
* cards: An array of the stripe IDs of credit cards
* orders: an array of order IDs linked to the customer.
* notes: any direct notes a customer has. This could potentially become an array with its own schema later.
* */
export const CustomerSchema = new mongoose.Schema({
    id: Number,
    firstName: String,
    lastName: String,
    phone: String,
    address: addressSchema,
    cards: [String],
    orders: [String],
    notes: String,
})

export const CustomerModel = mongoose.model('Customer', CustomerSchema);

module.exports = CustomerModel;