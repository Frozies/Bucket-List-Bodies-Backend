import {expect} from "chai";
import { gql } from "apollo-server-express";
import exp = require("constants");

const mockDB = require('./mockDB');

let testCustomerID: string;
let testExtraProductID: string;
let testExtraPriceID: string;
let testMealProductID: string;
let testMealPriceID: string;

describe('Create test data for an order', () => {
    it('Successfully create customer', async () => {
        const CREATE_CUSTOMER = gql`
            mutation Mutation($createCustomerCustomer: createNewCustomerInput) {
                createCustomer(customer: $createCustomerCustomer) {
                    notes
                    customerId
                    name
                    email
                    phone
                    address {
                        line1
                        city
                        line2
                        postal_code
                        state
                    }
                    shipping {
                        name
                        address {
                            city
                            line1
                            line2
                            postal_code
                            state
                        }
                    }
                    allergies
                }
            }
        `

        const result = await mockDB.executeOperation({
            query: CREATE_CUSTOMER,
            variables: {
                "createCustomerCustomer": {
                    "allergies": ['Fish', 'Nuts'],
                    "notes": 'Likes extra seasoning on his meals.',
                    "phone": '206-266-1000',
                    "email": 'jeff@amazon.com',
                    "name": 'Jeff Bezos',
                    "address": {
                        "city": 'Seattle',
                        "line1": 'Amazon Headquarters',
                        "line2": ' 410 Terry Ave. N',
                        "postal_code": '98109',
                        "state": 'WA'
                    },
                    "shipping": {
                        "address": {
                            "city": 'Seattle',
                            "line1": 'Amazon Headquarters',
                            "line2": ' 410 Terry Ave. N',
                            "postal_code": '98109',
                            "state": 'WA'
                        },
                        "name": 'Jeff Bezos'
                    }
                }
            }
        });
        if (result.errors != undefined) console.log(result.errors);
        expect(result.errors).to.undefined;

        expect(result.data.createCustomer.customerId).not.equal('' || undefined || null);

        //Limited Testing as this should work in the main test for customers.
        expect(result.data.createCustomer.allergies).to.members(['Fish', 'Nuts']);
        expect(result.data.createCustomer.notes).to.equal('Likes extra seasoning on his meals.');
        expect(result.data.createCustomer.phone).to.equal('206-266-1000');
        expect(result.data.createCustomer.email).to.equal('jeff@amazon.com');
        expect(result.data.createCustomer.name).to.equal('Jeff Bezos');

        testCustomerID = result.data.createCustomer.customerId;
    });

    it('Successfully create extra', async () => {
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

        const result = await mockDB.executeOperation({
            query: CREATE_EXTRA,
            variables: {
                "createExtraExtra": {
                    "title": "Egg White Bites - ORDER TESTING",
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
        expect(result.data.createExtra.title).to.equal("Egg White Bites - ORDER TESTING");
        expect(result.data.createExtra.description).to.equal('Delicious egg white bites!');

        //set the productID to be used in later queries.
        testExtraProductID = result.data.createExtra.productID
        testExtraPriceID = result.data.createExtra.priceID
    });

    it('Successfully Create a meal', async () => {
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
                    title: "Blackened Chicken - ORDER TESTING",
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
        expect(result.data.createMeal.title).to.equal("Blackened Chicken - ORDER TESTING");
        expect(result.data.createMeal.vegetables).to.members(['Broccoli', 'Green Beans'])
        expect(result.data.createMeal.description).to.equal('A fresh cooked chicken and veggie.');

        //set the productID to be used in later queries.
        testMealProductID = result.data.createMeal.productID
        testMealPriceID = result.data.createMeal.priceID
    });
})
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
                            "customerID": testCustomerID,
                            "products": {
                                "extras": [
                                    {
                                        "extraID": testExtraProductID,
                                        "extrasPriceID": testExtraPriceID
                                    }
                                ],
                                "meals": [
                                    {
                                        "proteinID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "vegetable": "Green Beans",
                                        "carbohydrate": "Bread",
                                        "sauce": "BBQ"
                                    }
                                ]
                            },
                            "notes": "Deliver before 5pm",
                            "coupon": "GYM5"
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                console.log("Overall")
                console.table(result.data.createOrder)

                console.log("meals")
                console.table(result.data.createOrder.products.meals)

                console.log("extras")
                console.table(result.data.createOrder.products.extras)
                console.log("Creation date: " + result.data.createOrder.creationDate)

                expect(result.data.createOrder.invoiceID).not.equal('' || undefined);

                //check to see if both items were added to the invoice.
                expect(result.data.createOrder.invoiceItemIDs).length(2);

                //Check if both items are in the invoice as items directly
                expect(result.data.createOrder.invoiceItemIDs[1].productID).to.equal(testMealProductID); //invoice items not product ids
                expect(result.data.createOrder.invoiceItemIDs[0].productID).to.equal(testExtraProductID);


                expect(result.data.createOrder.customer.customerId).to.equal(testCustomerID);
                expect(result.data.createOrder.products.meals).length(1);
                expect(result.data.createOrder.products.meals[0].priceID).to.equal(testMealPriceID); //todo fix invoiceID not price id?
                expect(result.data.createOrder.products.meals[0].status).to.equal('UNMADE');

                expect(result.data.createOrder.products.extras).length(1);
                expect(result.data.createOrder.products.extras[0].priceID).to.equal(testExtraPriceID);//todo fix
                expect(result.data.createOrder.products.extras[0].status).to.equal('UNMADE');

                expect(result.data.createOrder.status).to.equal("UNMADE");
                expect(result.data.createOrder.pretaxPrice).to.equal(11.99);
                expect(result.data.createOrder.coupon).to.equal('GYM5');
                expect(result.data.createOrder.notes).to.equal('Deliver before 5pm');

                expect(result.data.createOrder.creationDate).approximately(0,0) //TODO: Fix time

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

        describe('FinalizeOrder', () => {
            it( 'successfully finalize an order', () => {
                expect(0).to.equal(1); // Fail because no logic implementation
            } );
        })
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