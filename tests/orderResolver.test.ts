import {expect} from "chai";
import { gql } from "apollo-server-express";

const mockDB = require('./mockDB');


describe('Order Resolvers Unit Testing', () => {
    describe('Mutations', () => {
        describe('createOrder', () => {
            const CREATE_ORDER = gql`
                mutation Mutation($createOrderOrder: createOrderInput) {
                    createOrder(order: $createOrderOrder) {
                        invoiceID
                        invoiceItemIDs
                        customer {
                            customerId
                        }
                        products {
                            meals {
                                status
                                sauce
                                carbohydrate
                                vegetable
                                proteinID
                            }
                            extras {
                                status
                                extraID
                            }
                        }
                        status
                        pretaxPrice
                        coupon
                        notes
                        deliveredDate
                        creationDate
                    }
                }
            `

            it('Successfully create order', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_ORDER,
                    variables: {
                        "createOrderOrder": {
                            "customerID": null,
                            "products": {
                                "extras": [
                                    {
                                        "extraID": null,
                                        "extrasPriceID": null
                                    }
                                ],
                                "meals": [
                                    {
                                        "proteinID": null,
                                        "priceID": null,
                                        "vegetable": null,
                                        "carbohydrate": null,
                                        "sauce": null
                                    }
                                ]
                            },
                            "notes": null,
                            "coupon": null
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

            });
        });

        describe('updateOrder', () => {
            let UPDATE_ORDER: any;

            it('Successfully update all parameters of a meal', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_ORDER,
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
    });

    describe('Queries', () => {
        let seedMealProductID: any;
        let RETRIEVE_ALL_ORDERS: any;
        let RETRIEVE_ORDER: any;

        it('Retrieve all orders', async () => {
            const result = await mockDB.executeOperation({
                query: RETRIEVE_ALL_ORDERS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            console.log(result.data.retrieveAllMeals)
            console.log("seedMeal: " + seedMealProductID)

            expect(result.data.retrieveAllMeals[0].productID).to.equal(seedMealProductID)
        });

        it('Retrieve specific order', async () => {
            const result = await mockDB.executeOperation({
                query: RETRIEVE_ORDER,
                variables: {
                    "retrieveMealMeal": seedMealProductID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.retrieveMeal[0].productID).to.equal(seedMealProductID)
        });
    });

});