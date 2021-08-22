import mongoose from "mongoose";

/*A meal has:
* productID: the product ID created from the stripe api.
* priceID: the priceID created from the stripe api.
* title: which explains the protein and how its cooked.
* sides: a string array of a list of potential sides that can go with it. (retrieved elsewhere)
* description: a more in depth description of spices and any important information that the customer needs
* photoURL: a nice photo of the meal.
* price: ex 10.99 the cost before tax.
* proteinWeight: how many grams of protein the meal has.
* fatWeight: how many grams of fat the meal has.
* carbs: How many grams of carbohydrates a meal has.
* calories: how many calories a meal has.*/

export const mealSchema = new mongoose.Schema({
    productID: String,
    priceID: String,
    title: String,
    vegetables: [String],
    description: String,
    photoURL: String,
    price: Number,
    proteinWeight: Number,
    fatWeight: Number,
    carbs: Number,
    calories: Number,
});


export const mealModel = mongoose.model('Meal', mealSchema);

module.exports = mealModel;