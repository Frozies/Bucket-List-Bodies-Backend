const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
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

const mealModel = mongoose.model('Meal', mealSchema);

module.exports = mealModel;