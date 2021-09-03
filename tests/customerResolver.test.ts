import {mealSchema} from "../src/models/mealModel";
import * as mongoose from "mongoose";
import {expect} from "chai";
import { gql } from "apollo-server-express";
import {before} from "mocha";

const mockDB = require('./mockDB');

let mealModel: any;
let testMealProductID: string;
let testMealPriceID: string;


let seedMealProductID: string;
let seedExtraProductID: string;


//Connect to the mock database before testing
/*before(async () => {
    await mockDB.connect()
    mealModel = mongoose.model("Meal", mealSchema)
});*/

describe('Customer Resolvers Unit Testing', () => {
    describe('Mutations', () => {
        describe('createCustomer', () => {

            /*const CREATE_MEAL = gql`
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
                }`*/

            it('Successfully create customer', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_CUSTOMER,
                    variables: {
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                /*expect(result.data.createMeal.productID).not.equal('' || undefined);
                expect(result.data.createMeal.priceID).not.equal('' || undefined);
                expect(result.data.createMeal.title).to.equal("Blackened Chicken");
                expect(result.data.createMeal.vegetables).to.members(['Broccoli', 'Green Beans'])
                expect(result.data.createMeal.description).to.equal('A fresh cooked chicken and veggie.');
                expect(result.data.createMeal.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg')
                expect(result.data.createMeal.pretaxPrice).to.equal(9.99);
                expect(result.data.createMeal.proteinWeight).to.equal(5);
                expect(result.data.createMeal.fatWeight).to.equal(10);
                expect(result.data.createMeal.carbs).to.equal(15);
                expect(result.data.createMeal.calories).to.equal(20);*/

                //set the productID to be used in later queries.
                testMealProductID = result.data.createMeal.productID
                testMealPriceID = result.data.createMeal.priceID
            });
        });

        describe('updateCustomer', () => {

            it('Successfully update all parameters of a meal', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_CUSTOMER,
                    variables: {

                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                /*expect(result.data.updateMeal.title).to.equal("Spaghetti");
                expect(result.data.updateMeal.vegetables).to.members(['Roasted Tomatoes'])
                expect(result.data.updateMeal.description).to.equal('Fresh cooked mom\'s spaghetti!');
                expect(result.data.updateMeal.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1629420667/kjf28kcvywbbwqng8jld.jpg')
                expect(result.data.updateMeal.proteinWeight).to.equal(4);
                expect(result.data.updateMeal.fatWeight).to.equal(15);
                expect(result.data.updateMeal.carbs).to.equal(20);
                expect(result.data.updateMeal.calories).to.equal(25);*/
            });
        });

        describe('deleteCustomer', () => {

            it('Successfully delete meal', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_CUSTOMER,
                    variables: {

                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteMeal).to.equal("Deleted: " + testMealProductID)
            });
        });

    });

    describe('Queries', () => {

        /*it('Seed with meal', async () => {
            const result = await mockDB.executeOperation({
                query: CREATE_MEAL,
                variables: {
                    "createMealMeal": {
                        title: "Blackened Chicken",
                        vegetables: ["Broccoli", "Green Beans"],
                        description: "A fresh cooked chicken and veggie.",
                        photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg",
                        pretaxPrice: 9.99,
                        proteinWeight: 5,
                        fatWeight: 10,
                        carbs: 15,
                        calories: 20,
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
            seedMealProductID = result.data.createMeal.productID
        });

        it('Seed with Extra', async () => {
            const result = await mockDB.executeOperation({
                query: CREATE_EXTRA,
                variables: {
                    "createExtraExtra": {
                        "title": "Egg White Bites",
                        "description": "Delicious egg white bites!",
                        "photoURL": "https://res.cloudinary.com/bucketlistbodies/image/upload/v1630536377/Egg-white-veggie-bites_mv1aga.jpg",
                        "pretaxPrice": 2.00,
                        "proteinWeight": 10,
                        "fatWeight": 15,
                        "carbs": 20,
                        "calories": 25,
                    }
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.createExtra.productID).not.equal('' || undefined);
            expect(result.data.createExtra.priceID).not.equal('' || undefined);
            expect(result.data.createExtra.title).to.equal("Egg White Bites");
            expect(result.data.createExtra.description).to.equal('Delicious egg white bites!');
            expect(result.data.createExtra.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1630536377/Egg-white-veggie-bites_mv1aga.jpg')
            expect(result.data.createExtra.pretaxPrice).to.equal(2.00);
            expect(result.data.createExtra.proteinWeight).to.equal(10);
            expect(result.data.createExtra.fatWeight).to.equal(15);
            expect(result.data.createExtra.carbs).to.equal(20);
            expect(result.data.createExtra.calories).to.equal(25);

            //set the productID to be used in later queries.
            seedExtraProductID = result.data.createExtra.productID
        });*/

        it('Retrieve all customers', async () => {
            const result = await mockDB.executeOperation({
                query: RETRIEVE_ALL_CUSTOMERS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            console.log(result.data.retrieveAllMeals)
            console.log("seedMeal: " + seedMealProductID)

            expect(result.data.retrieveAllMeals[0].productID).to.equal(seedMealProductID)
        });

        it('Retrieve specific customer', async () => {
            const result = await mockDB.executeOperation({
                query: RETRIEVE_CUSTOMER,
                variables: {
                    "retrieveMealMeal": seedMealProductID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveMeal[0].productID).to.equal(seedMealProductID)
        });


        after(()=>{
            //cleanup
            const DELETE_EXTRA = gql`
                mutation DeleteExtraMutation($deleteExtraExtra: deleteExtraInput) {
                    deleteExtra(extra: $deleteExtraExtra)
                }
            `;

            const DELETE_MEAL = gql`
                mutation DeleteMealMutation($deleteMealMeal: deleteMealInput) {
                    deleteMeal(meal: $deleteMealMeal)
                }
            `;

            it('Delete seed meal', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_MEAL,
                    variables: {
                        "deleteMealMeal": {
                            productID: seedMealProductID,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteMeal).to.equal("Deleted: " + seedMealProductID)
            });

            it('Delete seed extra', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_EXTRA,
                    variables: {
                        "deleteExtraExtra": {
                            productID: seedExtraProductID,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteExtra).to.equal("Deleted: " + seedExtraProductID)
            });
        })
    });

});