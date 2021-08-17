import mongoose from "mongoose";
// const customerSchema = require('./CustomerModel')
const mealSchema = require('./MealModel')

export const orderSchema = new mongoose.Schema({
    id: Number,
    // customer: customerSchema,
    // meals: [mealSchema],
    meals: [String],
    status: String,
    total: Number,
    coupon: String,
    notes: String,
    deliveryDate: Date
});

export const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;