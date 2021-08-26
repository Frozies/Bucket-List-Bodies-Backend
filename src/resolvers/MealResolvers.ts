import {stripe} from "../index";
import {Stripe} from "stripe";
import _ from "lodash";

const mealModel = require('../models/mealModel');

const calculateMealPrice = (inputValue: string) => {
    return  Math.ceil( parseInt(String(parseFloat(inputValue) * 100)))
}


export const MealResolvers = {
    Query: {
        retrieveAllMeals: async() => {
            return mealModel.find()
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
            console.log(args)

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
            /*//Update Stripe Price
            //Price is not updatable. If there is a change, we need to deactivate the old one and
            //create a new one
            try {
                mealModel.findOne({productID: args.meal.productID}, async (err: any, meal: any) => {
                    if (err) throw err;
                    else {
                        priceID = meal.priceID
                    }

                    let price = await stripe.prices.retrieve(<string>priceID);

                    console.table(price)

                    const floatPrice = price.unit_amount ? price.unit_amount / 100 : undefined

                    if (floatPrice == undefined) {
                        const price = await stripe.prices.create({
                            currency: 'usd',
                            product: args.meal.productID,
                            unit_amount: calculateMealPrice(args.meal.pretaxPrice)
                        });

                        priceID = price.id;
                    }
                    if (floatPrice != undefined && args.meal.pretaxPrice != floatPrice) {
                        //deactivate old price
                        const oldPrice = await stripe.prices.update(args.meal.priceID, {
                            active: false,
                        })

                        //create a new price
                        const price = await stripe.prices.create({
                            currency: 'usd',
                            product: args.meal.productID,
                            unit_amount: calculateMealPrice(args.meal.pretaxPrice)
                        });
                        priceID = price.id;
                    } else {
                        priceID = undefined;
                    }
                });
            }
            catch (err) {
                console.log("Error updating stripe price: " + err)
                return "Error updating stripe price: " + err
            }*/
        }
    },
}
module.exports = MealResolvers;