import mongoose from "mongoose";
// const customerSchema = require('./CustomerModel')
const mealSchema = require('./MealModel')

/*An order has:
* id: the Stripe ID generated when an order is created.
* customer: a customer's ID number. This is used to retrieve the customer when needed.
* meals: a string array of meal IDs.
* status: The string status of an order, whether its been created, cooked, delivered, or something else.
* total: the total calculated price of the order after taxes.
* coupon: the coupon used to create the order
* notes: any notes on the order itself.
* deliveryDate: the date and time a delivery was delivered.
* */
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