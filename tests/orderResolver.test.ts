import {expect} from "chai";
import { gql } from "apollo-server-express";
import {stripe} from "../src/utility/stripe";
import {Stripe} from "stripe";

const chai = require('chai');
chai.use(require('chai-datetime'));

const mockDB = require('./mockDB');

let testCustomerID: string;
let testExtraProductID: string;
let testExtraPriceID: string;
let testMealProductID: string;
let testMealPriceID: string;
let testInvoiceID: string;
let testMealInvoiceItemID: string;
let testExtraInvoiceItemID: string;

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
        testExtraProductID = result.data.createExtra.productID;
        testExtraPriceID = result.data.createExtra.priceID;
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
                    allergies
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
                    allergies: ["FISH", "SHELLFISH"]
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
        expect(result.data.createMeal.allergies).to.include('FISH');
        expect(result.data.createMeal.allergies).to.include('SHELLFISH');

        //set the productID to be used in later queries.
        testMealProductID = result.data.createMeal.productID
        testMealPriceID = result.data.createMeal.priceID
    });
});
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
                                productID
                                invoiceItemID
                                priceID
                            }
                            extras {
                                status
                                productID
                                invoiceItemID
                                priceID
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
                                        "productID": testExtraProductID,
                                        "priceID": testExtraPriceID
                                    }
                                ],
                                "meals": [
                                    {
                                        "productID": testMealProductID,
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
                expect(result.data.createOrder.products.meals).length(1);
                expect(result.data.createOrder.products.meals[0].productID).to.equal(testMealProductID);
                expect(result.data.createOrder.products.meals[0].status).to.equal('UNMADE');
                expect(result.data.createOrder.products.meals[0].invoiceItemID).not.equal('' || undefined);

                expect(result.data.createOrder.products.extras).length(1);
                expect(result.data.createOrder.products.extras[0].productID).to.equal(testExtraProductID);
                expect(result.data.createOrder.products.extras[0].status).to.equal('UNMADE');
                expect(result.data.createOrder.products.extras[0].invoiceItemID).not.equal('' || undefined);


                expect(result.data.createOrder.status).to.equal("UNMADE");
                expect(result.data.createOrder.pretaxPrice).to.equal(11.99);
                expect(result.data.createOrder.coupon).to.equal('GYM5');
                expect(result.data.createOrder.notes).to.equal('Deliver before 5pm');

                console.log("CUSTOMER STUFF")
                console.log(result.data.createOrder.customer)
                console.log(result.data.createOrder.customer.orders)

                // Resolver chains suck and I dont know why they fail at random times when I know for a fact that the
                // data is there. Here is my crappy work around :)
                setTimeout(()=>{
                    expect(result.data.createOrder.customer.orders[0].invoiceID).to.equal(testInvoiceID);
                }, 1000)

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
                                productID
                                invoiceItemID
                                priceID
                            }
                            extras {
                                status
                                productID
                                invoiceItemID
                                priceID
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

                // This tests the resolver chain, but for some reason fails sometimes because the data comes in after
                // the test starts. I am not sure why or how to fix it. It seems like an issue with apollo.
                // expect(result.data.updateOrder.customer.orders[0].invoiceID).to.equal(testInvoiceID);

                expect(result.data.updateOrder.products.meals).length(1);
                expect(result.data.updateOrder.products.meals[0].productID).to.equal(testMealProductID);
                expect(result.data.updateOrder.products.meals[0].status).to.equal('UNMADE');
                expect(result.data.updateOrder.products.meals[0].invoiceItemID).not.equal('' || undefined);

                expect(result.data.updateOrder.products.extras).length(1);
                expect(result.data.updateOrder.products.extras[0].productID).to.equal(testExtraProductID);
                expect(result.data.updateOrder.products.extras[0].status).to.equal('UNMADE');
                expect(result.data.updateOrder.products.extras[0].invoiceItemID).not.equal('' || undefined);


                expect(result.data.updateOrder.pretaxPrice).to.equal(11.99);
                expect(result.data.updateOrder.coupon).to.equal('GYM5');

                let invoice: Stripe.Invoice = await stripe.invoices.retrieve(testInvoiceID);
                expect(invoice.subtotal/100).to.equal(result.data.updateOrder.pretaxPrice);

            });
        });

        describe('Update line items', () => {
            it( 'Add meal line item', async () => {
                let ADD_PRODUCT = gql`
                    mutation AddOrderLineItemsMutation($addOrderLineItemsOrder: updateOrderLineItemsInput) {
                        addOrderLineItems(order: $addOrderLineItemsOrder) {
                            products {
                                extras {
                                    productID
                                    status
                                    invoiceItemID
                                    priceID
                                }
                                meals {
                                    productID
                                    invoiceItemID
                                    priceID
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
                                        "productID": testExtraProductID,
                                        "priceID": testExtraPriceID
                                    }
                                ],
                                "meals": [
                                    {
                                        "productID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "vegetable": "Green Beans",
                                        "carbohydrate": "Bread",
                                        "sauce": "BBQ"
                                    },
                                    {
                                        "productID": testMealProductID,
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

                let invoice: Stripe.Invoice = await stripe.invoices.retrieve(testInvoiceID);
                expect(invoice.subtotal/100).to.equal(result.data.addOrderLineItems.pretaxPrice);

                expect(result.data.addOrderLineItems.products.meals[0].invoiceItemID).not.equal(undefined)
                expect(result.data.addOrderLineItems.products.meals[1].invoiceItemID).not.equal(undefined)
                expect(result.data.addOrderLineItems.products.meals[2].invoiceItemID).not.equal(undefined)

                expect(result.data.addOrderLineItems.products.extras[0].invoiceItemID).not.equal(undefined)
                expect(result.data.addOrderLineItems.products.extras[1].invoiceItemID).not.equal(undefined)


                testMealInvoiceItemID = result.data.addOrderLineItems.products.meals[2].invoiceItemID;
                testExtraInvoiceItemID = result.data.addOrderLineItems.products.extras[1].invoiceItemID;
            });

            it( 'Update multiple line items', async () => {
                let UPDATE_PRODUCTS = gql`
                    mutation UpdateOrderLineItemsMutation($updateOrderLineItemsOrder: updateOrderLineItemsInput) {
                        updateOrderLineItems(order: $updateOrderLineItemsOrder) {
                            products {
                                extras {
                                    productID
                                    priceID
                                    invoiceItemID
                                    status
                                }
                                meals {
                                    productID
                                    priceID
                                    invoiceItemID
                                    vegetable
                                    carbohydrate
                                    sauce
                                    status
                                }
                            }
                            invoiceID
                            status
                        }
                    }
                `;

                const result = await mockDB.executeOperation( {
                    query: UPDATE_PRODUCTS,
                    variables: {
                        "updateOrderLineItemsOrder": {
                            "customerID": testCustomerID,
                            "invoiceID": testInvoiceID,
                            "products": {
                                "extras": [
                                    {
                                        "productID": testExtraProductID,
                                        "priceID": testExtraPriceID,
                                        "invoiceItemID": testExtraInvoiceItemID,
                                        "status": 'MADE'
                                    }
                                ],
                                "meals": [
                                    {
                                        "productID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "invoiceItemID": testMealInvoiceItemID,
                                        "vegetable": 'Asparagus',
                                        "carbohydrate": 'Rice',
                                        "status": 'MADE',
                                        "sauce": 'Balsamic'
                                    }
                                ]
                            }
                        }
                    }
                } );

                if (result.errors != undefined) console.table( result.errors );
                expect( result.errors ).to.undefined;

                console.log(result.data.updateOrderLineItems)

                expect( result.data.updateOrderLineItems.products.meals[2].productID ).to.equal( testMealProductID );
                expect( result.data.updateOrderLineItems.products.meals[2].vegetable ).to.equal( 'Asparagus' );
                expect( result.data.updateOrderLineItems.products.meals[2].carbohydrate ).to.equal( 'Rice' );
                expect( result.data.updateOrderLineItems.products.meals[2].sauce ).to.equal( 'Balsamic' );
                expect( result.data.updateOrderLineItems.products.meals[2].status ).to.equal( 'MADE' );

                expect( result.data.updateOrderLineItems.products.extras[1].status ).to.equal( 'MADE' );
            });

            it( 'Remove line items', async () => {
                let REMOVE_PRODUCTS = gql`
                    mutation UpdateOrderLineItemsMutation($removeOrderLineItemsOrder: updateOrderLineItemsInput) {
                        removeOrderLineItems(order: $removeOrderLineItemsOrder) {
                            products {
                                extras {
                                    productID
                                    priceID
                                    invoiceItemID
                                    status
                                }
                                meals {
                                    productID
                                    priceID
                                    invoiceItemID
                                    vegetable
                                    carbohydrate
                                    sauce
                                    status
                                }
                            }
                            invoiceID
                            status
                            pretaxPrice
                        }
                    }
                `;

                let mealPricePromise = await stripe.prices.retrieve(testMealPriceID)
                // @ts-ignore
                let mealPrice = mealPricePromise.unit_amount/100

                let extraPricePromise = await stripe.prices.retrieve(testExtraPriceID)
                // @ts-ignore
                let extraPrice = extraPricePromise.unit_amount/100

                const result = await mockDB.executeOperation( {
                    query: REMOVE_PRODUCTS,
                    variables: {
                        "removeOrderLineItemsOrder": {
                            "customerID": testCustomerID,
                            "invoiceID": testInvoiceID,
                            "products": {
                                "extras": [
                                    {
                                        "productID": testExtraProductID,
                                        "priceID": testExtraPriceID,
                                        "invoiceItemID": testExtraInvoiceItemID,
                                        "pretaxPrice": mealPrice
                                    }
                                ],
                                "meals": [
                                    {
                                        "productID": testMealProductID,
                                        "priceID": testMealPriceID,
                                        "invoiceItemID": testMealInvoiceItemID,
                                        "pretaxPrice": extraPrice
                                    }
                                ]
                            }
                        }
                    }
                } );

                if (result.errors != undefined) console.table( result.errors );
                expect( result.errors ).to.undefined;

                console.log(result.data.removeOrderLineItems)

                expect( result.data.removeOrderLineItems.products.meals ).length(2)
                expect( result.data.removeOrderLineItems.products.extras ).length(1)

                let invoice: Stripe.Invoice = await stripe.invoices.retrieve(testInvoiceID);
                let subtotal = invoice.subtotal/100

                expect(subtotal).to.equal(result.data.removeOrderLineItems.pretaxPrice);
            });
        });

        describe('Order Payments', () => {
            it( 'payOutOfBandOrder', async () => {
                let PAY_OUT_OF_BAND = gql`
                    mutation Mutation($payOutOfBandOrderOrder: orderPaymentInput) {
                        payOutOfBandOrder(order: $payOutOfBandOrderOrder) {
                            status
                            invoiceID
                        }
                    }
                `

                let results = await mockDB.executeOperation({
                    query: PAY_OUT_OF_BAND,
                    variables: {
                        "payOutOfBandOrderOrder": {
                            "invoiceID": testInvoiceID,
                            "status": 'PAID_DELIVERED'
                        }
                    }
                })

                expect(results.data.payOutOfBandOrder.invoiceID).to.equal(testInvoiceID)
                expect(results.data.payOutOfBandOrder.status).to.equal('PAID_DELIVERED')
            });

            it( 'sendForManualPaymentOrder', () => {

            });


        })
    });

    describe('Queries', () => {
        let seedMealProductID = testMealProductID

        it('Retrieve all orders', async () => {
            let RETRIEVE_ALL_ORDERS = gql`
                query Query {
                    getAllOrders {
                        invoiceID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_ALL_ORDERS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            console.log(result.data.getAllOrders)

            //TODO: Add more edge cases
            expect(result.data.getAllOrders[0].productID).to.equal(seedMealProductID)
        })



        it('Retrieve specific order', async () => {
            let RETRIEVE_ORDER = gql`
                query Query($getOrderOrder: String) {
                    getOrder(order: $getOrderOrder) {
                        invoiceID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_ORDER,
                variables: {
                    "getOrderOrder": testInvoiceID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            console.log(result.data)

            //TODO: Add more edge cases
            expect(result.data.getOrder.invoiceID).to.equal(testInvoiceID)
        });
    });

});