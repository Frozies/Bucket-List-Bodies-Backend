import {expect} from "chai";
import { gql } from "apollo-server-express";

const chai = require('chai');
chai.use(require('chai-datetime'));

const mockDB = require('./mockDB');

let testCustomerID: string;
let testExtraProductID: string;
let testExtraPriceID: string;
let testMealProductID: string;
let testMealPriceID: string;
let testInvoiceID: string;

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
                        customer {
                            customerId
                            orders {
                                invoiceID
                            }
                        }
                        products {
                            meals {
                                status
                                sauce
                                carbohydrate
                                vegetable
                                proteinID
                                invoiceItemID
                                priceID
                            }
                            extras {
                                status
                                extraID
                                invoiceItemID
                                extraPriceID
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
                                        "extraPriceID": testExtraPriceID
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


                expect(result.data.createOrder.invoiceID).not.equal('' || undefined);

                testInvoiceID = result.data.createOrder.invoiceID;

                expect(result.data.createOrder.customer.customerId).to.equal(testCustomerID);
                expect(result.data.createOrder.customer.orders[0].invoiceID).to.equal(testInvoiceID);
                expect(result.data.createOrder.products.meals).length(1);
                expect(result.data.createOrder.products.meals[0].proteinID).to.equal(testMealProductID);
                expect(result.data.createOrder.products.meals[0].status).to.equal('UNMADE');
                expect(result.data.createOrder.products.meals[0].invoiceItemID).not.equal('' || undefined);

                expect(result.data.createOrder.products.extras).length(1);
                expect(result.data.createOrder.products.extras[0].extraID).to.equal(testExtraProductID);
                expect(result.data.createOrder.products.extras[0].status).to.equal('UNMADE');
                expect(result.data.createOrder.products.extras[0].invoiceItemID).not.equal('' || undefined);


                expect(result.data.createOrder.status).to.equal("UNMADE");
                expect(result.data.createOrder.pretaxPrice).to.equal(11.99);
                expect(result.data.createOrder.coupon).to.equal('GYM5');
                expect(result.data.createOrder.notes).to.equal('Deliver before 5pm');

                expect(result.data.createOrder.creationDate).to.closeToTime(new Date(), 10)


            });
        });

        describe('updateOrder', () => {
            let UPDATE_ORDER = gql`
                mutation Mutation($updateOrderOrder: orderUpdateInput) {
                    updateOrder(order: $updateOrderOrder) {
                        invoiceID
                        customer {
                            customerId
                            orders {
                                invoiceID
                            }
                        }
                        products {
                            meals {
                                status
                                sauce
                                carbohydrate
                                vegetable
                                proteinID
                                invoiceItemID
                                priceID
                            }
                            extras {
                                status
                                extraID
                                invoiceItemID
                                extraPriceID
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
            `;

            it('Successfully update all parameters of an Order', async () => {
                const deliveryDate = new Date()

                const result = await mockDB.executeOperation({
                    query: UPDATE_ORDER,
                    variables: {
                        "updateOrderOrder": {
                            "invoiceID": testInvoiceID,
                            "status": "DELIVERED",
                            "notes": "First time customer. Loved the order!",
                            "deliveredDate": deliveryDate,
                        }
                    }
                });
                if (result.errors != undefined) console.table(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateOrder.invoiceID).to.equal(testInvoiceID);


                expect(result.data.updateOrder.status).to.equal('DELIVERED');
                expect(result.data.updateOrder.notes).to.equal('First time customer. Loved the order!');
                expect(result.data.updateOrder.deliveredDate).to.closeToTime(deliveryDate, 10)
                
                expect(result.data.updateOrder.customer.customerId).to.equal(testCustomerID);
                expect(result.data.updateOrder.customer.orders[0].invoiceID).to.equal(testInvoiceID);
                expect(result.data.updateOrder.products.meals).length(1);
                expect(result.data.updateOrder.products.meals[0].proteinID).to.equal(testMealProductID);
                expect(result.data.updateOrder.products.meals[0].status).to.equal('UNMADE');
                expect(result.data.updateOrder.products.meals[0].invoiceItemID).not.equal('' || undefined);

                expect(result.data.updateOrder.products.extras).length(1);
                expect(result.data.updateOrder.products.extras[0].extraID).to.equal(testExtraProductID);
                expect(result.data.updateOrder.products.extras[0].status).to.equal('UNMADE');
                expect(result.data.updateOrder.products.extras[0].invoiceItemID).not.equal('' || undefined);


                expect(result.data.updateOrder.pretaxPrice).to.equal(11.99);
                expect(result.data.updateOrder.coupon).to.equal('GYM5');

            });
        });

        describe('Update line items', () => {
            it( 'Add meal line item', async () => {
                let ADD_PRODUCT = gql`
                    mutation AddOrderLineItemsMutation($addOrderLineItemsOrder: updateOrderLineItemsInput) {
                        addOrderLineItems(order: $addOrderLineItemsOrder) {
                            products {
                                extras {
                                    extraID
                                    status
                                }
                                meals {
                                    proteinID
                                    vegetable
                                    carbohydrate
                                    sauce
                                    status
                                }
                            }
                            customer{
                                customerId
                            }
                            invoiceID
                            pretaxPrice
                        }
                    }
                `;

                const result = await mockDB.executeOperation({
                    query: ADD_PRODUCT,
                    variables: {
                        "addOrderLineItemsOrder": {
                            "invoiceID": testInvoiceID,
                            "customerID": testCustomerID,
                            "products": {
                                "extras": [
                                    {
                                        "extraID": testExtraProductID,
                                        "extraPriceID": testExtraPriceID
                                    }
                                ],
                                "meals": [
                                    {
                                        "proteinID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "vegetable": "Green Beans",
                                        "carbohydrate": "Bread",
                                        "sauce": "BBQ"
                                    },
                                    {
                                        "proteinID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "vegetable": "Broccoli",
                                        "carbohydrate": "Chips",
                                        "sauce": "Ketchup"
                                    }
                                ]
                            },
                        }
                    }
                });
                if (result.errors != undefined) console.table(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.addOrderLineItems.customer.customerId).to.equal(testCustomerID)
                expect(result.data.addOrderLineItems.invoiceID).to.equal(testInvoiceID)

                expect(result.data.addOrderLineItems.pretaxPrice).to.equal(33.97)
                expect(result.data.addOrderLineItems.products.meals).length(3)
                expect(result.data.addOrderLineItems.products.extras).length(2)
                expect(result.data.addOrderLineItems.invoiceItemIDs).length(5)
            });

            it( 'Update Meal line item', () => {
                let results: any;

                expect(results.data.updateOrderLineItem.proteinID).to.equal(testMealProductID)
                expect(results.data.updateOrderLineItem.vegetable).to.equal('Asparagus')
                expect(results.data.updateOrderLineItem.carbohydrate).to.equal('Rice')
                expect(results.data.updateOrderLineItem.sauce).to.equal('Balsamic')
                expect(results.data.updateOrderLineItem.status).to.equal('COOKED')
            });

            it( 'Remove Meal line item', () => {
                expect(0).to.equal(1)
            });

            it( 'Update extra line item', () => {
                let results: any;
                expect(results.data.updateExtraLineItem.status).to.equal('COOKED')
            });

            it( 'Remove extra line item', () => {
                expect(0).to.equal(1)
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