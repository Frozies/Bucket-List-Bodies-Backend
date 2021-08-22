const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mealModel = require('../models/mealModel');


export const MealResolvers = {
    Query: {
        /*retrieveAllMeals: async() => {
            return productsModel.find()
        },*/
    },
    Mutation: {
        /*createMeal: async(parent: any, args: { meal: { title: any; description: any; photoURL: String; price: string; sides: any; carbs: string; calories: string; allergies: any; }; }, context: any, info: any) => {
            let priceID = '';
            let productID = '';
            let photoURL = args.meal.photoURL
            console.log("Meal Photo: " + photoURL)
            console.log("Meal Photo: " + args.meal.photoURL)

            //Create Stripe Product
            try {
                const product = await stripe.products.create({
                    name: args.meal.title,
                    description: args.meal.description,
                    images: [photoURL]
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
                await productsModel.create({
                    productID: productID,
                    priceID: priceID,
                    title: args.meal.title,
                    sides: args.meal.sides,
                    description: args.meal.description,
                    photoURL: photoURL,
                    price: parseFloat(args.meal.price),
                    carbs: parseInt(args.meal.carbs),
                    calories: parseInt(args.meal.calories),
                    allergies: args.meal.allergies,
                    /!*todo: Why tf does a meal have allergies*!/
                })
            }
            catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }

            return true
        },*/
/*
        deleteMeal: async (parent: any, args: any, context: any, info: any) => {
            console.log(args)

            return productsModel.findByIdAndDelete(args.meal._id, (err: any, docs: any) => {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Deleted : ", docs);
                }
            })
        },*/
    }
}
module.exports = MealResolvers;