import mongoose from "mongoose";

export const mealSchema = new mongoose.Schema({
    productID: String,
    priceID: String,
    title: String,
    sides: String,
    description: String,
    photoURL: String,
    price: Number,
    carbs: Number,
    calories: Number,
    allergies: [String],
});

export const mealModel = mongoose.model('Meal', mealSchema);

module.exports = mealModel;