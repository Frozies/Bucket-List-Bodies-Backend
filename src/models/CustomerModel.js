const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
    id: Number,
    name: String,
    phone: String,
    address: AddressSchema,
    cards: [String],
    orders: [String],
    notes: String,
})

const CustomerModel = mongoose.model('Customer', CustomerSchema);

export default [CustomerModel, CustomerSchema];