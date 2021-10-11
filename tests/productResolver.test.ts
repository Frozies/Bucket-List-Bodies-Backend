import {mealSchema} from "../src/models/mealModel";
import * as mongoose from "mongoose";
import {expect} from "chai";
import { gql } from "apollo-server-express";
import {before} from "mocha";

const mockDB = require('./mockDB');

let mealModel: any;
let testMealProductID: string;
let testMealPriceID: string;

let testExtraProductID: string;
let testExtraPriceID: string;

let seedMealProductID: string;
let seedExtraProductID: string;


/**
 * This is the first test document written for this project. You will see error results in the form of
 * "expect(result.errors[0].message).to.equal('Variable "$createMealMeal" got invalid value {}; Field "title" of
 * required type "String!" was not provided.')"
 * */

//Connect to the mock database before testing
before(async () => {
    await mockDB.connect()
    mealModel = mongoose.model("Meal", mealSchema)
});

describe('Product Resolvers Unit Testing', () => {
    describe('Mutations', () => {
        describe('createMeal', () => {

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
                testMealProductID = result.data.createMeal.productID
                testMealPriceID = result.data.createMeal.priceID
            });

            it('Throw Error creating stripe product', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_MEAL,
                    variables: {
                        "createMealMeal": {}
                    }
                });
                expect(result.errors[0].message).to.equal('Variable "$createMealMeal" got invalid value {}; Field "title" of required type "String!" was not provided.')
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
                console.table(result.errors)
                expect(result.errors[0].message).to.equal('Variable "$createMealMeal" got invalid value { title: "Blackened Chicken", description: "A fresh cooked chicken and veggie.", photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1628629228/ill70niz6u808sni9elf.jpg" }; Field "pretaxPrice" of required type "Float!" was not provided.')
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

                // expect(result.errors[0].message).to.equal('Error pushing meal to MongoDB: MongooseError: Operation `meals.insertOne()` buffering timed out after 10000ms')
                expect(result.errors[0].message).to.equal('Variable "$createMealMeal" got invalid value "9.99" at "createMealMeal.pretaxPrice"; Float cannot represent non numeric value: "9.99"')

                //Reconnect to the database because we severed the connection to test the error message.
                mockDB.connect()
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
                        allergies
                    }
                }
            `;

            it('Successfully update all parameters of a meal', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_MEAL,
                    variables: {
                        "updateMealMeal": {
                            productID: testMealProductID,
                            title: "Spaghetti",
                            vegetables: ["Roasted Tomatoes"],
                            description: "Fresh cooked mom's spaghetti!",
                            photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1629420667/kjf28kcvywbbwqng8jld.jpg",
                            proteinWeight: 4,
                            fatWeight: 15,
                            carbs: 20,
                            calories: 25,
                            allergies: ["EGGS"]
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
                expect(result.data.updateMeal.allergies).to.include(["EGGS"]);
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
                            productID: testMealProductID,
                            priceID: testMealPriceID,
                            pretaxPrice: 15.99
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateMealPrice.productID).to.equal(testMealProductID)
                expect(result.data.updateMealPrice.priceID).not.equal(testMealPriceID)
                expect(result.data.updateMealPrice.pretaxPrice).to.equal(15.99)

                testMealPriceID = result.data.updateMealPrice.priceID;
            });
        });

        describe('deleteMeal', () => {
            const DELETE_MEAL = gql`
                mutation DeleteMealMutation($deleteMealMeal: deleteMealInput) {
                    deleteMeal(meal: $deleteMealMeal)
                }
            `;

            it('Successfully delete meal', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_MEAL,
                    variables: {
                        "deleteMealMeal": {
                            productID: testMealProductID,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteMeal).to.equal("Deleted: " + testMealProductID)
            });
        });

        describe('createExtra', () => {
            const CREATE_EXTRA = gql`
                mutation CreateExtraMutation($createExtraExtra: createExtraInput) {
                    createExtra(extra: $createExtraExtra) {
                        productID
                        priceID
                        title
                        description
                        photoURL
                        pretaxPrice
                        proteinWeight
                        fatWeight
                        carbs
                        calories
                        allergies
                    }
                }
            `;

            it('Successfully create extra', async () => {
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
                            "allergies": ["EGGS", "FISH"]
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
                expect(result.data.createExtra.allergies).to.includes(['EGGS']);
                expect(result.data.createExtra.allergies).to.includes(['FISH']);

                //set the productID to be used in later queries.
                testExtraProductID = result.data.createExtra.productID
                testExtraPriceID = result.data.createExtra.priceID
            });
        });

        describe('updateExtra', () => {
            const UPDATE_EXTRA = gql`
                mutation UpdateExtraMutation($updateExtraExtra: updateExtraInput) {
                    updateExtra(extra: $updateExtraExtra) {
                        productID
                        priceID
                        title
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

            it('Successfully update all parameters of a extra', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_EXTRA,
                    variables: {
                        "updateExtraExtra": {
                            productID: testExtraProductID,
                            title: "Healthy Donuts",
                            description: "Very tasty donuts!",
                            photoURL: "https://res.cloudinary.com/bucketlistbodies/image/upload/v1630538575/donuts_n7cgym.jpg",
                            proteinWeight: 3,
                            fatWeight: 100,
                            carbs: 26,
                            calories: 25,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateExtra.title).to.equal("Healthy Donuts");
                expect(result.data.updateExtra.description).to.equal('Very tasty donuts!');
                expect(result.data.updateExtra.photoURL).to.equal('https://res.cloudinary.com/bucketlistbodies/image/upload/v1630538575/donuts_n7cgym.jpg')
                expect(result.data.updateExtra.proteinWeight).to.equal(3);
                expect(result.data.updateExtra.fatWeight).to.equal(100);
                expect(result.data.updateExtra.carbs).to.equal(26);
                expect(result.data.updateExtra.calories).to.equal(25);
            });
        });

        describe('updateExtraPrice', () => {
            const UPDATE_EXTRA_PRICE = gql`
                mutation UpdateExtraMutation($updateExtraPriceExtra: updatePriceInput) {
                    updateExtraPrice(extra: $updateExtraPriceExtra) {
                        productID
                        priceID
                        pretaxPrice
                    }
                }
            `;

            it('Successfully update the price of a extra', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_EXTRA_PRICE,
                    variables: {
                        "updateExtraPriceExtra": {
                            productID: testExtraProductID,
                            priceID: testExtraPriceID,
                            pretaxPrice: 15.99
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateExtraPrice.productID).to.equal(testExtraProductID)
                expect(result.data.updateExtraPrice.priceID).not.equal(testExtraPriceID)
                expect(result.data.updateExtraPrice.pretaxPrice).to.equal(15.99)

                testExtraPriceID = result.data.updateExtraPrice.priceID;
            });
        });

        describe('deleteExtra', () => {
            const DELETE_EXTRA = gql`
                mutation DeleteExtraMutation($deleteExtraExtra: deleteExtraInput) {
                    deleteExtra(extra: $deleteExtraExtra)
                }
            `;

            it('Successfully delete extra', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_EXTRA,
                    variables: {
                        "deleteExtraExtra": {
                            productID: testExtraProductID,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteExtra).to.equal("Deleted: " + testExtraProductID)
            });
        });
    });

    describe('Queries', () => {
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

        const CREATE_EXTRA = gql`
            mutation CreateExtraMutation($createExtraExtra: createExtraInput) {
                createExtra(extra: $createExtraExtra) {
                    productID
                    priceID
                    title
                    description
                    photoURL
                    pretaxPrice
                    proteinWeight
                    fatWeight
                    carbs
                    calories
                }
            }
        `;

        it('Seed with meal', async () => {
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
        });

        it('Retrieve all meals', async () => {
            const RETRIEVE_ALL_MEALS = gql`
                query Query {
                    retrieveAllMeals {
                        productID
                        title
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_ALL_MEALS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveAllMeals[result.data.retrieveAllMeals.length-1].productID).to.equal(seedMealProductID)
        });

        describe('Retrieve specific meal', async () => {
            const RETRIEVE_MEAL = gql`
                query Query($retrieveMealMeal: String) {
                    retrieveMeal(meal: $retrieveMealMeal) {
                        productID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_MEAL,
                variables: {
                    "retrieveMealMeal": seedMealProductID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveMeal[0].productID).to.equal(seedMealProductID)
        });

        describe('Retrieve all extras', async () => {
            const RETRIEVE_ALL_EXTRAS = gql`
                query Query {
                    retrieveAllExtras {
                        productID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_ALL_EXTRAS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveAllExtras[0].productID).to.equal(seedExtraProductID)
        });

        describe('retrieve specific extra', async () => {
            const RETRIEVE_EXTRA = gql`
                query Query($retrieveExtraExtra: String) {
                    retrieveExtra(extra: $retrieveExtraExtra) {
                        productID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_EXTRA,
                variables: {
                    "retrieveExtraExtra": seedExtraProductID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveExtra[0].productID).to.equal(seedExtraProductID)
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

export default {}