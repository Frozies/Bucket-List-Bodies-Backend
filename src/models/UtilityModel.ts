import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema({
    city: String,
    line1: String,
    line2: String,
    postal: String,
    state: String,
});

export const addressModel = mongoose.model('Address', addressSchema)

module.exports = [addressModel, addressSchema];
