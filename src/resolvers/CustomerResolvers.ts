import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import _ from "lodash";

const {customerModel} = require('../models/CustomerModel')
const orderModel = require("../models/OrderModel");
const {customerID} = require('../utility/stripe');


export const CustomerResolvers = {
    Query: {
        getCustomer(parent: any, args: any, context: any, info: any) {
            return customerModel.findOne({stripeID: args.id})
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
            let stripeID = '';
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

                    stripeID = customer.id
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
                    stripeID: stripeID,
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
                console.log("stripeID: " + args.customer.stripeID)
                const updateCustomer = async () => {
                    let oldCustomer: any;
                    await stripe.customers.retrieve(args.customer.stripeID).then((doc: any) => {
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

                    const customer: Stripe.Customer = await stripe.customers.update(args.customer.stripeID, params);

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
                    stripeID: args.customer.stripeID
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
                await stripe.customers.del(args.stripeID);
                console.log("Deleted customer: " + args.stripeID)
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
                    customer: parent.stripeID
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
            console.log("PARENT")
            console.log(parent)
            let stripeID = customerID(parent)
            console.log("Retrieving Customer email: " + stripeID)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(stripeID)
            return "email" in customer ? customer.email : undefined
        },

        async phone(parent: any) {
            let stripeID = customerID(parent)
            console.log("Retrieving Customer phone: " + stripeID)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(stripeID)
            return "phone" in customer ? customer.phone : undefined
        },

        async address(parent: any) {
            let stripeID = customerID(parent)
            console.log("Retrieving Customer address: " + stripeID)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(stripeID)
            return "address" in customer ? customer.address : undefined
        },

        async shipping(parent: any) {
            let stripeID = customerID(parent)
            console.log("Retrieving Customer shipping: " + stripeID)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(stripeID)
            return "shipping" in customer ? customer.shipping : undefined
        },

        async default_source(parent: any) {
            let stripeID = customerID(parent)
            console.log("Retrieving Customer default_source: " + stripeID)

            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(stripeID)
            return "default_source" in customer ? customer.default_source : undefined
        },
    },
};

module.exports = CustomerResolvers;
