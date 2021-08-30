import mongoose from "mongoose";

/*
* An orderProducts schema has: (the products included in an order)
* meals: an array of meal ids and the sides to go with that product.
* extras: an array of product ids that are individual items.
* */

export const orderProductsSchema = new mongoose.Schema({
    meals: [{
        proteinID: String,
        vegetable: String,
        carbohydrate: String,
        sauce: String,
        status: String,
    }],
    extras: [{
        extraID: String,
        status: String,
    }]
});


export const orderProductsModel = mongoose.model('Order Products', orderProductsSchema);

/*An order has:
* id: the Stripe ID generated when an order is created.
* customer: a customer's ID number. This is used to retrieve the customer when needed.
* products: a schema based on either an array of meals, or extras.
* status: The string status of an order, whether its been created, cooked, delivered, or something else.
* totalPrice: the total calculated price of the order after taxes.
* coupon: the coupon used to create the order
* notes: any notes on the order itself.
* deliveredDate: the date and time a delivery was delivered.
* */
export const orderSchema = new mongoose.Schema({
    invoiceID: String,
    invoiceItemIDs: [String],
    customerID: String,
    products: orderProductsSchema,
    status: String,
    pretaxPrice: Number,
    coupon: String,
    notes: String,
    deliveredDate: Date,
    creationDate: Date,
});

export const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;