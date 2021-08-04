import mongoose from "mongoose";

export const CustomerSchema = new mongoose.Schema({
    id: Number,
    name: String,
    phone: String,
    // address: AddressSchema,
    cards: [String],
    orders: [String],
    notes: String,
})

export const CustomerModel = mongoose.model('Customer', CustomerSchema);

export default [CustomerModel, CustomerSchema];