import {mealSchema} from "../src/models/mealModel";
import * as mongoose from "mongoose";
import {expect} from "chai";
import { gql } from "apollo-server-express";
const {apolloServer} = require('./mockDB');

const mockDB = require('./mockDB');

let mealModel: any;
let productID: string;
let priceID: string;


//Connect to the mock database before testing
before(async () => {
    await mockDB.connect()
    mealModel = mongoose.model("Meal", mealSchema)
});

describe('Product Resolvers Unit Testing', () => {
    describe('Mutations', () => {
        describe('Create Meal Mutation', () => {

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

            it('Successfully Create a meal', async () => {
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

                //set the productID to be used in later queries.
                productID = result.data.createMeal.productID
                priceID = result.data.createMeal.priceID
            });

            it('Throw Error creating stripe product', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_MEAL,
                    variables: {
                        "createMealMeal": {}
                    }
                });
                expect(result.errors[0].message).to.equal('Error creating Stripe Product: Error: Missing required param: name.')
            });

            it('Throw Error creating stripe price', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_MEAL,
                    variables: {
                        "createMealMeal": {
                            title: "Blackened Chicken",
                            description: "A fresh cooked chicken and veggie.",
                            photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg",
                        }
                    }
                });
                expect(result.errors[0].message).to.equal('Error creating Stripe Price: Error: Invalid integer: NaN')

                //todo: Clear the test data out of stripe.
            });

            it('Throw Error creating mealModel document', async () => {
                mockDB.disconnect()
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

                expect(result.errors[0].message).to.equal('Error pushing meal to MongoDB: MongooseError: Operation `meals.insertOne()` buffering timed out after 10000ms')

                //Reconnect to the database because we severed the connection to test the error message.
                mockDB.connect()
                //todo: Clear the test data out of stripe.
            });
        });

        describe('updateMeal', () => {
            const UPDATE_MEAL = gql`
                mutation UpdateMealMutation($updateMealMeal: updateMealInput) {
                    updateMeal(meal: $updateMealMeal) {
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
                }
            `;

            it('Successfully update all parameters of a meal', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_MEAL,
                    variables: {
                        "updateMealMeal": {
                            productID: productID,
                            title: "Spaghetti",
                            vegetables: ["Roasted Tomatoes"],
                            description: "Fresh cooked mom's spaghetti!",
                            photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1629420667/kjf28kcvywbbwqng8jld.jpg",
                            proteinWeight: 4,
                            fatWeight: 15,
                            carbs: 20,
                            calories: 25,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateMeal.title).to.equal("Spaghetti");
                expect(result.data.updateMeal.vegetables).to.members(['Roasted Tomatoes'])
                expect(result.data.updateMeal.description).to.equal('Fresh cooked mom\'s spaghetti!');
                expect(result.data.updateMeal.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1629420667/kjf28kcvywbbwqng8jld.jpg')
                expect(result.data.updateMeal.proteinWeight).to.equal(4);
                expect(result.data.updateMeal.fatWeight).to.equal(15);
                expect(result.data.updateMeal.carbs).to.equal(20);
                expect(result.data.updateMeal.calories).to.equal(25);
            });
        });

        describe('updateMealPrice', () => {
            const UPDATE_MEAL_PRICE = gql`
                mutation UpdateMealMutation($updateMealPriceMeal: updatePriceInput) {
                    updateMealPrice(meal: $updateMealPriceMeal) {
                        productID
                        priceID
                        pretaxPrice
                    }
                }
            `;

            it('Successfully update the price of a meal', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_MEAL_PRICE,
                    variables: {
                        "updateMealPriceMeal": {
                            productID: productID,
                            priceID: priceID,
                            pretaxPrice: "15.99"
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateMealPrice.productID).to.equal(productID)
                expect(result.data.updateMealPrice.priceID).not.equal(priceID)
                expect(result.data.updateMealPrice.pretaxPrice).to.equal(15.99)

                priceID = result.data.updateMealPrice.priceID;
            });
        });

        describe('deleteMeal', () => {

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