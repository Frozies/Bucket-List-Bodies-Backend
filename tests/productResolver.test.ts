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
    describe('Mutations', () => {
        it('createMeal', async () => {
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

            const result = await mockDB.executeOperation({
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
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.createMeal.productID).not.equal('' || undefined);
            expect(result.data.createMeal.priceID).not.equal('' || undefined);
            expect(result.data.createMeal.title).to.equal("Blackened Chicken");
            expect(result.data.createMeal.vegetables).to.members(['Broccoli', 'Green Beans'])
            expect(result.data.createMeal.description).to.equal('A fresh cooked chicken and veggie.');
            expect(result.data.createMeal.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg')
            expect(result.data.createMeal.pretaxPrice).to.equal(9.99);
            expect(result.data.createMeal.proteinWeight).to.equal(5);
            expect(result.data.createMeal.fatWeight).to.equal(10);
            expect(result.data.createMeal.carbs).to.equal(15);
            expect(result.data.createMeal.calories).to.equal(20);
        });

    });

    /*describe('Queries', () => {
        it('Retrieve all meals', () => {

        });
    });*/


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