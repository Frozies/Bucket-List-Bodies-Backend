const mongoose = require("mongoose");
const {customerSchema} = require('./CustomerModel')

const mealSchema = new mongoose.Schema({
    id: Number, //TODO: Double check all ID variables and reassure that stripe will work with these schemas...
    protein: String,
    vegetable: String,
    carb: String,
    //TODO: 4th option and extras... oops
});

const mealModel = new mongoose.model('Meal', mealSchema);

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

export default [orderModel, orderSchema, mealSchema, mealModel]