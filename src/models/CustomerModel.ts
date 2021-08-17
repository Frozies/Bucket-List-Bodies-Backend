import mongoose from "mongoose";
import {addressSchema} from "./UtilityModel";


export const CustomerSchema = new mongoose.Schema({
    id: Number,
    name: String,
    phone: String,
    address: addressSchema,
    cards: [String],
    orders: [String],
    notes: String,
})

export const CustomerModel = mongoose.model('Customer', CustomerSchema);

module.exports = CustomerModel;