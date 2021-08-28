import {stripe} from "../index";
import {Stripe} from "stripe";
import _ from "lodash";
import {StatusCode} from "./UtilityResolvers";

const mealModel = require('../models/mealModel');

const calculateMealPrice = (inputValue: string) => {
    return  Math.ceil( parseInt(String(parseFloat(inputValue) * 100)))
}


export const MealResolvers = {
    Query: {
        retrieveAllMeals: async() => {
            return mealModel.find()
        },

        retrieveMeal: (parent: any, args: any, context: any, info: any) => {
            const foundMeal = mealModel.findOne({productID: args.meal})
          return foundMeal;
        },
    },
    Mutation: {
        createMeal: async(parent: any, args: any, context: any, info: any) => {
            let priceID = '';
            let productID = '';
            let photoURL = args.meal.photoURL
            let newMeal;

            //Create Stripe Product
            try {
                const product = await stripe.products.create({
                    name: args.meal.title,
                    description: args.meal.description,
                    images: [photoURL]
                });

                productID = product.id
                console.log("Product ID: " + product.id)
            }
            catch (err) {
                return "Error creating Stripe Product: " + err;
            }

            //Create Stripe Price
            try {
                const price = await stripe.prices.create({
                    currency: 'usd',
                    product: productID,
                    unit_amount: calculateMealPrice(args.meal.pretaxPrice)
                });

                priceID = price.id;
            }
            catch (err) {
                console.log("Error creating Stripe Price: " + err);
                return "Error creating Stripe Price: " + err;
            }

            //Create Mongoose Model
            try {
                newMeal = await mealModel.create({
                    productID: productID,
                    priceID: priceID,
                    title: args.meal.title,
                    sides: args.meal.sides,
                    description: args.meal.description,
                    photoURL: photoURL,
                    pretaxPrice: parseFloat(args.meal.pretaxPrice),
                    proteinWeight: parseInt(args.meal.proteinWeight),
                    fatWeight: parseInt(args.meal.fatWeight),
                    carbs: parseInt(args.meal.carbs),
                    calories: parseInt(args.meal.calories),
                })
            }
            catch (err) {
                console.log("Error pushing meal to MongoDB: " + err);
                return "Error pushing meal to MongoDB: " + err;
            }
            finally {
                return newMeal
            }
        },

        //TODO: Started on this, need to check if it is finished and working.
        deleteMeal: async(parent: any, args: any, context: any, info: any) => {

            return mealModel.findByIdAndDelete(args.meal._id, (err: any, docs: any) => {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Deleted: ", docs);
                }
            })
        },


        updateMeal: async(parent: any, args: any, context: any, info: any) => {
            let updatedMeal;

            //Update Stripe Product
            try {
                const params: Stripe.ProductUpdateParams = {
                    active: args.meal.active ? args.meal.active : undefined,
                    description: args.meal.description ? args.meal.description : undefined,
                    images: [args.meal.photoURL ? args.meal.photoURL : undefined],
                    name: args.meal.title ? args.meal.title : undefined,
                }
                await stripe.products.update(args.meal.productID, params)
            }
            catch (err) {
                console.log("Error updating stripe product: " + err)
                return "Error updating stripe product: " + err
            }

            //Update Mongoose Model
            try {
                const filter = {
                    productID: args.meal.productID
                }

                const update = {
                    title: args.meal.title ? args.meal.title : undefined,
                    vegetables: args.meal.vegetables ? args.meal.vegetables : undefined,
                    description: args.meal.description ? args.meal.description : undefined,
                    photoURL: args.meal.photoURL ? args.meal.photoURL : undefined,
                    proteinWeight: args.meal.proteinWeight ? args.meal.proteinWeight : undefined,
                    fatWeight: args.meal.fatWeight ? args.meal.fatWeight : undefined,
                    carbs: args.meal.carbs ? args.meal.carbs : undefined,
                    calories: args.meal.calories ? args.meal.calories : undefined,
                    mealStatus: args.meal.mealStatus ? args.meal.mealStatus : undefined,
                }

                await mealModel.updateOne(filter, _.pickBy(update, (param: any) => {
                    if (param !== undefined) return param
                }))

                updatedMeal = mealModel.findOne(filter)
            }
            catch (err) {
                console.log("Error updating meal in database: " + err);
                return "Error updating meal in database: " + err;
            }
            finally {
                return updatedMeal
            }
        },

        updateMealPrice: async(parent: any, args: any, context: any, info: any) => {
            //Update Stripe Price
            //Price is not updatable. If there is a change, we need to deactivate the old one and
            //create a new one.
            try {
                let oldPrice = await stripe.prices.retrieve(args.meal.priceID);
                let newPriceID;
                let updatedMeal;
                // const floatPrice = price.unit_amount ? price.unit_amount / 100 : undefined

                //create a new price
                try {
                    const price = await stripe.prices.create({
                        currency: 'usd',
                        product: args.meal.productID,
                        unit_amount: calculateMealPrice(args.meal.pretaxPrice)
                    });
                    newPriceID = price.id
                }
                catch (err) {
                    console.log("Error updateMealPrice - Creating a new price: " + err)
                    return ("Error updateMealPrice - Creating a new price: " + err)
                }

                //deactivate old price
                try {
                    await stripe.prices.update(oldPrice.id, {
                        active: false,
                    })
                }
                catch (err) {
                    console.log("Error updateMealPrice - Deleting old price: " + err)
                    return ("Error updateMealPrice - Deleting old price: " + err)
                }

                //update the mongoose model
                try {
                    const filter = {
                        productID: args.meal.productID
                    }

                    const update = {
                        priceID: newPriceID,
                        pretaxPrice: args.meal.pretaxPrice
                    }

                    await mealModel.updateOne(filter, _.pickBy(update, (param: any) => {
                        if (param !== undefined) return param
                    }))

                    updatedMeal = mealModel.findOne(filter)
                }
                catch (err) {
                    console.log("Error updateMealPrice - Updating Mongoose Model: " + err)
                    return ("Error updateMealPrice - Updating Mongoose Model: " + err)
                }

                return updatedMeal;

            }
            catch (err) {
                console.log("Error updatingMealPrice: " + err)
                return "Error updatingMealPrice: " + err
            }
        }
    },

    Meal: {

    }
}
module.exports = MealResolvers;