import mongoose from "mongoose";
import {StatusCode} from "../resolvers/UtilityResolvers";

/*A Extra has:
* productID: the product ID created from the stripe api.
* priceID: the priceID created from the stripe api.
* title: which explains the protein and how its cooked.
* description: a more in depth description of spices and any important information that the customer needs
* photoURL: a nice photo of the meal.
* price: ex 10.99 the cost before tax.
* proteinWeight: how many grams of protein the meal has.
* fatWeight: how many grams of fat the meal has.
* carbs: How many grams of carbohydrates a meal has.
* calories: how many calories a meal has.
* */

export const extraSchema = new mongoose.Schema({
    productID: String,
    priceID: String,
    title: String,
    description: String,
    photoURL: String,
    pretaxPrice: Number,
    proteinWeight: Number,
    fatWeight: Number,
    carbs: Number,
    calories: Number,
});


export const extraModel = mongoose.model('Extra', extraSchema);

module.exports = extraModel;