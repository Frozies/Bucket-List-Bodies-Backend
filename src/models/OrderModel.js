const mongoose = require("mongoose");
const customerSchema = require('./CustomerModel')
const mealSchema = require('./MealModel')

const orderSchema = new mongoose.Schema({
    id: Number,
    customer: customerSchema,
    meals: [mealSchema],
    status: String,
    total: Number,
    coupon: String,
    notes: String,
    deliveryDate: Date
});

const orderModel = mongoose.model('Order', orderSchema);

export default [orderModel, orderSchema, mealSchema]