import {mealSchema} from "../src/models/mealModel";
import * as mongoose from "mongoose";
import {expect} from "chai";
import { gql } from "apollo-server-express";
const {apolloServer} = require('./mockDB');

const mockDB = require('./mockDB');

let mealModel: any;


//Connect to the mock database before testing
before(async () => {
    await mockDB.connect()
    mealModel = mongoose.model("Meal", mealSchema)
});

describe('Product Resolvers Unit Testing', () => {
    describe('createMeal', async () => {
        it('create Meal 2', async () => {
            const CREATE_MEAL = gql`
                mutation CreateMealMutation($createMealMeal: createMealInput) {
                    createMeal(meal: $createMealMeal) {
                        productID
                        priceID
                        title
                        vegetables
                        photoURL
                        description
                        pretaxPrice
                        proteinWeight
                        fatWeight
                        carbs
                        calories
                    }
                }`

            const result = await apolloServer.executeOperation({
                query: CREATE_MEAL,
                variables: {
                    "createMealMeal": {
                        title: "Blackened Chicken",
                        vegetables: ["Broccoli", "Green Beans"],
                        description: "A fresh cooked chicken and veggie.",
                        photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg",
                        pretaxPrice: "9.99",
                        proteinWeight: "5",
                        fatWeight: "10",
                        carbs: "15",
                        calories: "20",
                    }
                }
            });

            expect(result.errors).to.undefined;
            expect(result.data.productID).to.not.undefined
            expect(result.data.priceID).to.not.undefined
        });
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