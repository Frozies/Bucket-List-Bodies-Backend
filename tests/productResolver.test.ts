import {mealSchema} from "../src/models/mealModel";
import * as mongoose from "mongoose";
import {expect} from "chai";

const mockDB = require('./mockDB');

let mealModel: any;

//Connect to the mock database before testing
before(async () => {
    await mockDB.connect()
    mealModel = mongoose.model("Meal", mealSchema)
});

describe('Product Resolvers Unit Testing', () => {
    it('1 = 1', async () => {
        /*const meal = await mealModel.create({
            productID: "productID",
            priceID: "priceID",
            title: "args.meal.title",
            sides: "args.meal.sides",
            description: "args.meal.description",
            photoURL: "photoURL",
            pretaxPrice: 3,
            proteinWeight: 4,
            fatWeight: 5,
            carbs: 6,
            calories: 7,
        })*/

        expect(1).to.equal(1);
    });

    /*describe('Queries', () => {
        describe('Retrieve all meals', () => {

        });

        describe('Retrieve specific meal', () => {

        });

        describe('Retrieve all extras', () => {

        });

        describe('retrieve specific extra', () => {

        });
    });

    describe('Mutations', () => {
        describe('createMeal', () => {
            
        });
        
        describe('updateMeal', () => {
            
        });
        
        describe('updateMealPrice', () => {
            
        });
        
        describe('deleteMeal', () => {
            
        });

        describe('createExtra', () => {
            
        });

        describe('updateExtra', () => {
            
        });

        describe('updateExtraPrice', () => {
            
        });

        describe('deleteExtra', () => {
            
        });
    });*/
});