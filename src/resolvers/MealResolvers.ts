const mealModel = require('../models/MealModel')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const MealResolvers = {
    Query: {
        retrieveAllMeals: async() => {
            const all = await mealModel.find()
            return all
        },
    },
    Mutation: {
        createMeal: async(parent: any, args: { meal: { title: any; description: any; photoURL: any; price: string; sides: any; carbs: string; calories: string; allergies: any; }; }, context: any, info: any) => {
            let priceID = '';
            let productID = '';

            //Create Stripe Product
            try {
                const product = await stripe.products.create({
                    name: args.meal.title,
                    description: args.meal.description,
                    images: [args.meal.photoURL]
                });

                productID = product.id
                console.log("Product ID: " + productID)
            }
            catch (err) {
                return "Error creating Stripe Product: " + err;
            }

            //Create Stripe Price
            try {
                const price = await stripe.prices.create({
                    currency: 'usd',
                    product: productID,
                    unit_amount: Math.ceil( parseInt(String(parseFloat(args.meal.price) * 100))),
                });

                priceID = price.id;
            }
            catch (err) {
                return "Error creating Stripe Price: " + err;
            }

            //Create Mongoose Model
            try {
                await mealModel.create({
                    productID: productID,
                    priceID: priceID,
                    title: args.meal.title,
                    sides: args.meal.sides,
                    description: args.meal.description,
                    photoURL: args.meal.photoURL,
                    price: parseFloat(args.meal.price),
                    carbs: parseInt(args.meal.carbs),
                    calories: parseInt(args.meal.calories),
                    allergies: args.meal.allergies,
                })
            }
            catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }

            return true
        },
    }
}
module.exports = MealResolvers;