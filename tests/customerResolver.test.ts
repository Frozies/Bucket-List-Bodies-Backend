import {expect} from "chai";
import { gql } from "apollo-server-express";
import {before} from "mocha";

const mockDB = require('./mockDB');


let testStripeID: string;

//Connect to the mock database before testing
before(async () => {
    await mockDB.connect()
    // mealModel = mongoose.model("Meal", mealSchema)
});

describe('Customer Resolvers Unit Testing', () => {
    describe('Mutations', () => {
        describe('createCustomer', () => {

            const CREATE_CUSTOMER = gql`
                mutation Mutation($createCustomerCustomer: createNewCustomerInput) {
                    createCustomer(customer: $createCustomerCustomer) {
                        notes
                        stripeID
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

            it('Successfully create customer', async () => {
                const result = await mockDB.executeOperation({
                    query: CREATE_CUSTOMER,
                    variables: {
                        "createCustomerCustomer": {
                            "allergies": ['Nuts', 'Tomatoes'],
                            "notes": 'This is a simple note',
                            "phone": '202-456-1111',
                            "email": 'JoeBiden@whitehouse.gov',
                            "name": 'Joe Biden',
                            "address": {
                                "city": 'Washington',
                                "line1": '1600 Pennsylvania Avenue NW',
                                "line2": '',
                                "postal_code": '20500',
                                "state": 'DC'
                            },
                            "shipping": {
                                "address": {
                                    "city": 'Washington',
                                    "line1": '1600 Pennsylvania Avenue NW',
                                    "line2": '',
                                    "postal_code": '20500',
                                    "state": 'DC'
                                },
                                "name": 'Joe Biden'
                            }
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.createCustomer.stripeID).not.equal('' || undefined || null);

                expect(result.data.createCustomer.allergies).to.members(['Nuts', 'Tomatoes']);
                expect(result.data.createCustomer.notes).to.equal('This is a simple note');
                expect(result.data.createCustomer.phone).to.equal('202-456-1111');
                expect(result.data.createCustomer.email).to.equal('JoeBiden@whitehouse.gov');
                expect(result.data.createCustomer.name).to.equal('Joe Biden');

                expect(result.data.createCustomer.address.city).to.equal('Washington');
                expect(result.data.createCustomer.address.line1).to.equal('1600 Pennsylvania Avenue NW');
                expect(result.data.createCustomer.address.line2).to.equal('');
                expect(result.data.createCustomer.address.postal_code).to.equal('20500');
                expect(result.data.createCustomer.address.state).to.equal('DC');

                expect(result.data.createCustomer.shipping.address.city).to.equal('Washington');
                expect(result.data.createCustomer.shipping.address.line1).to.equal('1600 Pennsylvania Avenue NW');
                expect(result.data.createCustomer.shipping.address.line2).to.equal('');
                expect(result.data.createCustomer.shipping.address.postal_code).to.equal('20500');
                expect(result.data.createCustomer.shipping.address.state).to.equal('DC');
                expect(result.data.createCustomer.shipping.name).to.equal('Joe Biden');

                testStripeID = result.data.createCustomer.stripeID;
            });
        });

        describe('updateCustomer', () => {

            const UPDATE_CUSTOMER = gql`
                mutation Mutation($updateCustomerCustomer: updateCustomerInput) {
                    updateCustomer(customer: $updateCustomerCustomer) {
                        stripeID
                        name
                        email
                        phone
                        address {
                            state
                            postal_code
                            line2
                            line1
                            city
                        }
                        shipping {
                            address {
                                city
                                line1
                                line2
                                postal_code
                                state
                            }
                            name
                        }
                        default_source
                        notes
                        allergies
                    }
                }
            `;

            /**This is an example of changing the shipping and delivery information to a spouse without changing address.
             * */
            it('Successfully update parameters of a customer', async () => {
                const result = await mockDB.executeOperation({
                    query: UPDATE_CUSTOMER,
                    variables: {
                        "updateCustomerCustomer": {
                            "stripeID": testStripeID,
                            "name": 'Kamala Harris',
                            "email": 'KamalaHarrise@whitehouse.gov',
                            "phone": '202-111-2292',
                            "shipping": {
                                "name": 'Kamala Harris',
                            },
                            "notes": 'This is a change to a simple note.',
                            "allergies": ['Nuts', 'Tomatoes', 'Eggs']
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.updateCustomer.allergies).to.members(['Nuts', 'Tomatoes', 'Eggs']);
                expect(result.data.updateCustomer.notes).to.equal('This is a change to a simple note.');
                expect(result.data.updateCustomer.phone).to.equal('202-111-2292');
                expect(result.data.updateCustomer.email).to.equal('KamalaHarrise@whitehouse.gov');
                expect(result.data.updateCustomer.name).to.equal('Kamala Harris');

                expect(result.data.updateCustomer.address.city).to.equal('Washington');
                expect(result.data.updateCustomer.address.line1).to.equal('1600 Pennsylvania Avenue NW');
                expect(result.data.updateCustomer.address.line2).to.equal('');
                expect(result.data.updateCustomer.address.postal_code).to.equal('20500');
                expect(result.data.updateCustomer.address.state).to.equal('DC');

                expect(result.data.updateCustomer.shipping.address.city).to.equal('Washington');
                expect(result.data.updateCustomer.shipping.address.line1).to.equal('1600 Pennsylvania Avenue NW');
                expect(result.data.updateCustomer.shipping.address.line2).to.equal('');
                expect(result.data.updateCustomer.shipping.address.postal_code).to.equal('20500');
                expect(result.data.updateCustomer.shipping.address.state).to.equal('DC');
                expect(result.data.updateCustomer.shipping.name).to.equal('Kamala Harris');
            });
        });
    });

    describe('Queries', () => {

        it('Retrieve all customers', async () => {
            const GET_ALL_CUSTOMERS = gql`
                query Query {
                    getAllCustomers {
                        stripeID
                    }
                }
            `

            const result = await mockDB.executeOperation({
                query: GET_ALL_CUSTOMERS
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;


            expect(result.data.getAllCustomers[result.data.getAllCustomers.length-1].stripeID).to.equal(testStripeID)
        });

        it('Retrieve specific customer', async () => {
            const RETRIEVE_CUSTOMER = gql`
                query Query($getstripeID: String) {
                    getCustomer(id: $getstripeID) {
                        stripeID
                    }
                }
            `;

            const result = await mockDB.executeOperation({
                query: RETRIEVE_CUSTOMER,
                variables: {
                    "getstripeID": testStripeID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.getCustomer.stripeID).to.equal(testStripeID)
        });
    });

    describe('deleteCustomer', () => {

        const DELETE_CUSTOMER = gql`
            mutation Mutation($deleteCustomerstripeID: String) {
                deleteCustomer(stripeID: $deleteCustomerstripeID)
            }
        `;

        it('Successfully delete customer', async () => {
            const result = await mockDB.executeOperation({
                query: DELETE_CUSTOMER,
                variables: {
                    "deleteCustomerstripeID": testStripeID
                }
            });
            if (result.errors != undefined) console.log(result.errors);
            expect(result.errors).to.undefined;

            expect(result.data.deleteCustomer).to.equal(true)
        });
    });

});