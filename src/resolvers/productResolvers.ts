import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import _ from "lodash";
import {StatusCode} from "./UtilityResolvers";
import {extraModel} from "../models/extraModel";

const mealModel = require('../models/mealModel');

const calculateMealPrice = (inputValue: string) => {
    return  Math.ceil( parseInt(String(parseFloat(inputValue) * 100)))
}


export const productResolvers = {
    Query: {
        retrieveAllMeals: async() => {
            return mealModel.find()
        },

        retrieveMeal: (parent: any, args: any, context: any, info: any) => {
            const foundMeal = mealModel.findOne({productID: args.meal})
          return foundMeal;
        },

        retrieveAllExtras: async() => {
            return extraModel.find()
        },

        retrieveExtra: (parent: any, args: any, context: any, info: any) => {
            const foundExtra = extraModel.findOne({productID: args.extra})
            return foundExtra;
        },


    },
    Mutation: {
        /*
        * PRIMARY MEALS
         */
        createMeal: async(parent: any, args: any, context: any, info: any) => {
            let priceID = '';
            let productID = '';
            let photoURL = args.meal.photoURL
            let newMeal;

            console.log("Creating Meal")
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
                console.log("Error creating Stripe Product: " + err)
                throw new Error("Error creating Stripe Product: " + err);
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
                throw new Error("Error creating Stripe Price: " + err);
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
                    vegetables: args.meal.vegetables
                })
            }
            catch (err) {
                console.log("Error pushing meal to MongoDB: " + err);
                throw new Error("Error pushing meal to MongoDB: " + err);
            }
            finally {
                if (newMeal != undefined) return newMeal
            }
        },

        deleteMeal: async(parent: any, args: any, context: any, info: any) => {
            //Deactivate meal on stripe
            try {
                await stripe.products.update(
                    args.meal.productID,
                    {active:false}
                );
            }
            catch (err) {
                console.log("Error deactivating product on stripe: " + err);
                return ("Error deactivating product on stripe: " + err);
            }

            //delete meal from db
            try {
                const deletedMeal = mealModel.findOneAndDelete({productID: args.meal.productID});
                console.log("Deleted: " + deletedMeal._conditions.productID);
                return ("Deleted: " + deletedMeal._conditions.productID);
            }
            catch (err) {
                console.log("Error deleting product: " + err);
                throw new Error("Error deleting product: " + err);
            }
        },

        updateMeal: async(parent: any, args: any, context: any, info: any) => {
            let updatedMeal;

            //Update Stripe Product
            try {
                const params: Stripe.ProductUpdateParams = {
                    // active: args.meal.active ? args.meal.active : undefined, TODO: Fix this, and uncomment this line
                    description: args.meal.description ? args.meal.description : undefined,
                    images: [args.meal.photoURL ? args.meal.photoURL : undefined],
                    name: args.meal.title ? args.meal.title : undefined,
                }
                await stripe.products.update(args.meal.productID, params)
            }
            catch (err) {
                console.log("Error updating stripe product: " + err)
                throw new Error("Error updating stripe product: " + err);
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
                throw new Error("Error updating meal in database: " + err);
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
                    throw new Error("Error updateMealPrice - Creating a new price: " + err)
                }

                //deactivate old price
                try {
                    await stripe.prices.update(oldPrice.id, {
                        active: false,
                    })
                }
                catch (err) {
                    console.log("Error updateMealPrice - Deleting old price: " + err)
                    throw new Error("Error updateMealPrice - Deleting old price: " + err)
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
                    throw new Error("Error updateMealPrice - Updating Mongoose Model: " + err)
                }

                return updatedMeal;

            }
            catch (err) {
                console.log("Error updatingMealPrice: " + err)
                throw new Error("Error updatingMealPrice: " + err);
            }
        },

        /*
        * EXTRAS AND ADDONS TO ORDERS
        */

        createExtra: async(parent: any, args: any, context: any, info: any) => {
            let priceID = '';
            let productID = '';
            let photoURL = args.extra.photoURL
            let newExtra;

            //Create Stripe Product
            try {
                const product = await stripe.products.create({
                    name: args.extra.title,
                    description: args.extra.description,
                    images: [photoURL]
                });

                productID = product.id
                console.log("Product ID: " + product.id)
            }
            catch (err) {
                console.log("Error creating Stripe Product: " + err)
                throw new Error("Error creating Stripe Product: " + err);
            }

            //Create Stripe Price
            try {
                const price = await stripe.prices.create({
                    currency: 'usd',
                    product: productID,
                    unit_amount: calculateMealPrice(args.extra.pretaxPrice)
                });

                priceID = price.id;
            }
            catch (err) {
                console.log("Error creating Stripe Price: " + err);
                throw new Error("Error creating Stripe Price: " + err);
            }

            //Create Mongoose Model
            try {
                newExtra = await extraModel.create({
                    productID: productID,
                    priceID: priceID,
                    title: args.meal.title,
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
                console.log("Error pushing extra to MongoDB: " + err);
                throw new Error("Error pushing extra to MongoDB: " + err);
            }
            finally {
                return newExtra
            }
        },

        deleteExtra: async(parent: any, args: any, context: any, info: any) => {
            // @ts-ignore
            //TODO: this ts-ignore is hiding some dumb error... Also check the ID
            return extraModel.findByIdAndDelete( {productID: args.extra}, (err: any, docs: any) => {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Deleted: ", docs);
                }
            })
        },

        updateExtra: async(parent: any, args: any, context: any, info: any) => {
            let updatedExtra;

            //Update Stripe Product
            try {
                const params: Stripe.ProductUpdateParams = {
                    active: args.extra.active ? args.extra.active : undefined,
                    description: args.extra.description ? args.extra.description : undefined,
                    images: [args.extra.photoURL ? args.extra.photoURL : undefined],
                    name: args.extra.title ? args.extra.title : undefined,
                }
                await stripe.products.update(args.extra.productID, params)
            }
            catch (err) {
                console.log("Error updating stripe product: " + err)
                throw new Error("Error updating stripe product: " + err)
            }

            //Update Mongoose Model
            try {
                const filter = {
                    productID: args.extra.productID
                }

                const update = {
                    title: args.extra.title ? args.extra.title : undefined,
                    vegetables: args.extra.vegetables ? args.extra.vegetables : undefined,
                    description: args.extra.description ? args.extra.description : undefined,
                    photoURL: args.extra.photoURL ? args.extra.photoURL : undefined,
                    proteinWeight: args.extra.proteinWeight ? args.extra.proteinWeight : undefined,
                    fatWeight: args.extra.fatWeight ? args.extra.fatWeight : undefined,
                    carbs: args.extra.carbs ? args.extra.carbs : undefined,
                    calories: args.extra.calories ? args.extra.calories : undefined,
                    extraStatus: args.extra.extraStatus ? args.extra.extraStatus : undefined,
                }

                await extraModel.updateOne(filter, _.pickBy(update, (param: any) => {
                    if (param !== undefined) return param
                }))

                updatedExtra = extraModel.findOne(filter)
            }
            catch (err) {
                console.log("Error updating extra in database: " + err);
                throw new Error("Error updating extra in database: " + err);
            }
            finally {
                return updatedExtra
            }
        },

        updateExtraPrice: async(parent: any, args: any, context: any, info: any) => {
            //Update Stripe Price
            //Price is not updatable. If there is a change, we need to deactivate the old one and
            //create a new one.
            try {
                let oldPrice = await stripe.prices.retrieve(args.extra.priceID);
                let newPriceID;
                let updatedExtra;
                // const floatPrice = price.unit_amount ? price.unit_amount / 100 : undefined

                //create a new price
                try {
                    const price = await stripe.prices.create({
                        currency: 'usd',
                        product: args.extra.productID,
                        unit_amount: calculateMealPrice(args.extra.pretaxPrice)
                    });
                    newPriceID = price.id
                }
                catch (err) {
                    console.log("Error updateExtraPrice - Creating a new price: " + err)
                    throw new Error("Error updateExtraPrice - Creating a new price: " + err)
                }

                //deactivate old price
                try {
                    await stripe.prices.update(oldPrice.id, {
                        active: false,
                    })
                }
                catch (err) {
                    console.log("Error updateExtraPrice - Deleting old price: " + err)
                    throw new Error("Error updateExtraPrice - Deleting old price: " + err)
                }

                //update the mongoose model
                try {
                    const filter = {
                        productID: args.extra.productID
                    }

                    const update = {
                        priceID: newPriceID,
                        pretaxPrice: args.extra.pretaxPrice
                    }

                    await extraModel.updateOne(filter, _.pickBy(update, (param: any) => {
                        if (param !== undefined) return param
                    }))

                    updatedExtra = extraModel.findOne(filter)
                }
                catch (err) {
                    console.log("Error updateExtraPrice - Updating Mongoose Model: " + err)
                    throw new Error("Error updateExtraPrice - Updating Mongoose Model: " + err)
                }

                return updatedExtra;

            }
            catch (err) {
                console.log("Error updatingExtraPrice: " + err)
                throw new Error("Error updatingExtraPrice: " + err)
            }
        },
    }
}
module.exports = productResolvers;