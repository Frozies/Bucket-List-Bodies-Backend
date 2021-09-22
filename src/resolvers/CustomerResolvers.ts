import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import _ from "lodash";

const customerModel = require('../models/CustomerModel')
const orderModel = require("../models/OrderModel");
const {customerID} = require('../utility/stripe');


export const CustomerResolvers = {
    Query: {
        getCustomer(parent: any, args: any, context: any, info: any) {
            return customerModel.findOne({customerId: args.id})
        },

        getAllCustomers(parent: any, args: any, context: any, info: any) {
            return customerModel.find()
        },


        /*      getCustomerFromOrder(parent, args, context, info) {},

                getAllActiveCustomers(parent, args, context, info){},

                getAllInactiveCustomers(parent, args, context, info){},

                getAllSingleCustomerOrders(parent, args, context, info){},*/
    },

    Mutation: {
        /**
         * Search through stripe for a customer by their email. If they DO NOT already exist, then create
         * a new customer with ID.
         * */
        async createCustomer(parent: any, args: any, context: any, info: any) {
            let customerID = '';
            let newCustomer;

            //todo: Commented out for testing reasons :) note: make a failcase for this.
            /*// Search stripe for a customer with that email
            try {
                const findCustomerByEmail = async () => {
                    const params: Stripe.CustomerListParams = {
                        email: args.customer.email,
                        limit: 1
                    }
                    const customers = await stripe.customers.list(params);

                    if (customers.data.length > 0) throw "There is a customer with that email already!"
                }
                await findCustomerByEmail()
            } catch (err) {
                console.log("Error findCustomerByEmail: " + err)
                throw new Error("Error findCustomerByEmail: " + err);
            }*/

            // Create a customer in stripe
            try {
                const createCustomer = async () => {
                    //Check if the shipping address has been supplied. if false => use billing address
                    if (!args.customer.shipping.address) {
                        args.customer.shipping.address = args.customer.address;
                    }

                    const params: Stripe.CustomerCreateParams = {
                        address: {
                            city: args.customer.address.city,
                            country: "US",
                            line1: args.customer.address.line1,
                            line2: args.customer.address.line2,
                            postal_code: args.customer.address.postal_code,
                            state: args.customer.address.state,
                        },
                        description: args.customer.notes,
                        email: args.customer.email,
                        name: args.customer.name,
                        phone: args.customer.phone,
                        shipping: {
                            name: args.customer.name,
                            address: {
                                city: args.customer.shipping.address.city,
                                country: "US",
                                line1: args.customer.shipping.address.line1,
                                line2: args.customer.shipping.address.line2,
                                postal_code: args.customer.shipping.address.postal_code,
                                state: args.customer.shipping.address.state,
                            },
                        }
                    };

                    const customer: Stripe.Customer = await stripe.customers.create(params);

                    customerID = customer.id
                    console.log("Created a new customer: " + customer.id)
                };
                await createCustomer()
            }
            catch (err) {
                console.log("Error creatingCustomer in stripe: " + err)
                throw new Error("Error creatingCustomer in stripe: " + err);
            }

            try {
                console.log("Adding new customer to DB.")
                //Send customer data to DB.
                newCustomer = await customerModel.create({
                    customerId: customerID,
                    name: args.customer.name,
                    notes: args.customer.notes,
                    allergies: args.customer.allergies,
                })
            }
            catch (err) {
                console.log("Error creatingCustomer in database: " + err)
                throw new Error("Error creatingCustomer in database: " + err);
            }

            return newCustomer;
        },

        /**
         * Update a customer in stripe using it's ID.
         * */
        async updateCustomer(parent: any, args: any, context: any, info: any) {
            let updatedCustomer;

            try {
                console.log("customerId: " + args.customer.customerId)
                const updateCustomer = async () => {
                    let oldCustomer: any;
                    await stripe.customers.retrieve(args.customer.customerId).then((doc: any) => {
                        oldCustomer = doc;
                    })

                    // If the parameter was sent by the client then update it. otherwise leave undefined.
                    const params: Stripe.CustomerUpdateParams = {
                        address: args.customer.address ? {...args.customer.address, country: 'US'} : undefined,
                        description: args.customer.notes ? args.customer.notes : undefined,
                        email: args.customer.email ? args.customer.email : undefined,
                        name: args.customer.name ? args.customer.name : undefined,
                        phone: args.customer.phone ? args.customer.phone : undefined,
                        shipping: {
                            name: args.customer.name ? args.customer.name : undefined,
                            address: args.customer.shipping.address ? {...args.customer.shipping.address, country: 'US'} : {...oldCustomer.shipping.address},
                        }
                    }

                    const customer: Stripe.Customer = await stripe.customers.update(args.customer.customerId, params);

                    console.log("Updated customer: " + customer.id)
                };

                await updateCustomer();
            }
            catch (err) {
                console.log("Error updateCustomer in stripe: " + err)
                throw new Error("Error updateCustomer in stripe: " + err);
            }

            try {
                const filter = {
                    customerId: args.customer.customerId
                }

                const update = {
                    name: args.customer.name ? args.customer.name : undefined,
                    notes: args.customer.notes ? args.customer.notes : undefined,
                    allergies: args.customer.allergies ? args.customer.allergies : undefined,
                }

                await customerModel.updateOne(filter, _.pickBy(update, (param: any) => {
                    if (param !== undefined) return param
                }))

                updatedCustomer = customerModel.findOne(filter)
            }
            catch (err) {
                console.log("Error updateCustomer in DB: " + err);
                throw new Error("Error updateCustomer in DB: " + err);
            }

            return updatedCustomer;
        },

        /**
         * Delete a customer in stripe using it's ID.
         * */
        async deleteCustomer(parent: any, args: any, context: any, info: any) {
            try {
                await stripe.customers.del(args.customerId);
                console.log("Deleted customer: " + args.customerId)
            }
            catch (err) {
                console.log("Error deleteCustomer: " + err)
                throw new Error("Error deleteCustomer: " + err);
            }
            return true;
        },
    },

    Customer: {
        async orders(parent: any) {
            let retrievedOrders;
            let invoices: any = [];

            try {
                console.log("Retrieving orders from customer information.")
                const orders = await stripe.invoices.list({
                    customer: parent.customerId
                });

                retrievedOrders = orders.data
            }
            catch (err) {
                console.log("Error retrieving stripe orders: " + err);
                throw new Error("Error retrieving stripe orders: " + err);
            }

            try {
                for await (let invoice of retrievedOrders) {
                    const orders = await orderModel.findOne({invoiceID: invoice.id},
                        (err: any, doc: any) => {
                        console.log("Found invoice: " + doc.invoiceID);
                        invoices.push(doc);
                    })
                }
            }
            catch (err) {
                console.log("Error retrieving database orders: " + err);
                throw new Error("Error retrieving database orders: " + err);
            }

            return await invoices;
        },

        async email(parent: any, context: any) {
            let customerId = customerID(parent)
            console.log("Retrieving Customer email: " + customerId)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)
            return "email" in customer ? customer.email : undefined
        },

        async phone(parent: any) {
            let customerId = customerID(parent)
            console.log("Retrieving Customer phone: " + customerId)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)
            return "phone" in customer ? customer.phone : undefined
        },

        async address(parent: any) {
            let customerId = customerID(parent)
            console.log("Retrieving Customer address: " + customerId)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)
            return "address" in customer ? customer.address : undefined
        },

        async shipping(parent: any) {
            let customerId = customerID(parent)
            console.log("Retrieving Customer shipping: " + customerId)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)
            return "shipping" in customer ? customer.shipping : undefined
        },

        async default_source(parent: any) {
            let customerId = customerID(parent)
            console.log("Retrieving Customer default_source: " + customerId)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)
            return "default_source" in customer ? customer.default_source : undefined
        },
    },
};

module.exports = CustomerResolvers;
