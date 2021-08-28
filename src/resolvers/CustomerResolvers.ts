import {stripe} from "../index";
import {Stripe} from "stripe";
import {customerModel} from "../models/CustomerModel";

export const CustomerResolvers = {
    Query: {
        async getCustomer(parent: any, args: any, context: any, info: any) {
            let customer;
            try {
                const getCustomer = async () => {
                    const customer: Stripe.Customer | Stripe.DeletedCustomer = await stripe.customers.retrieve(args.id);

                    console.log("Retrieved customer: " + customer.id)
                    return customer
                };

                customer = await getCustomer();
                return customer;
            } catch (err) {
                console.log("Error getCustomer: " + err)
            }
            finally {
                return {
                    ...customer
                }
            }
        },

        async getAllCustomers(parent: any, args: any, context: any, info: any) {
            let retrievedCustomers;
            try {
                const getAllCustomers = async () => {
                    const params: Stripe.CustomerListParams = {
                        limit: 10,
                    }

                    const customers = await stripe.customers.list(params);
                    retrievedCustomers = customers.data
                };

                await getAllCustomers()
            } catch (err) {
                console.log( "Error getCustomer: " + err )
            }
            finally {
                return retrievedCustomers
            }
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

            // Search stripe for a customer with that email
            try {
                const findCustomerByEmail = async () => {
                    const params: Stripe.CustomerListParams = {
                        email: args.customer.email,
                        limit: 1
                    }
                    const customers = await stripe.customers.list(params);

                    if (customers.data.length >= 1) throw "There is a customer with that email already!"
                }


                await findCustomerByEmail().then(async () => {

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

                        await createCustomer().then(async () => {
                            //Send customer data to DB.
                            const customer = await customerModel.create({
                                id: customerID,
                                name: args.customer.name,
                                notes: args.customer.notes,
                            })
                        });
                    } catch (err) {
                        console.log(err)
                        return "Error createCustomer: " + err;
                    }
                })
            } catch (err) {
                return "Error findCustomerByEmail: " + err
            } finally {
                /* If customerID has been returned by stripe then return that data*/
                if (customerID != '') return {...args.customer, id: customerID}
            }
        },

        /**
         * Update a customer in stripe using it's ID.
         * */
        async updateCustomer(parent: any, args: any, context: any, info: any) {
            try {
                const updateCustomer = async () => {

                    // If the parameter was sent by the client then update it. otherwise leave undefined.
                    const params: Stripe.CustomerUpdateParams = {
                        address: args.customer.billingAddress ? {...args.customer.billingAddress, country: 'US'} : undefined,
                        description: args.customer.notes ? args.customer.notes : undefined,
                        email: args.customer.email ? args.customer.email : undefined,
                        name: args.customer.name ? args.customer.name : undefined,
                        phone: args.customer.phone ? args.customer.phone : undefined,
                        shipping: {
                            name: args.customer.name ? args.customer.name : undefined,
                            address: args.customer.shippingAddress ? {...args.customer.shippingAddress, country: 'US'} : undefined,
                        }
                    }

                    const customer: Stripe.Customer = await stripe.customers.update(args.customer.id, params);

                    console.log("Updated customer: " + customer.id)
                };

                await updateCustomer();
            }
            catch (err) {
                console.log("Error updateCustomer: " + err)
            }
            finally {
                return {...args.customer}
            }
        },
    },

    Customer: {
        async orders(parent: any) {
            let retrievedOrders;
            try {
                const orders = await stripe.orders.list({
                    limit: 3,
                    customer: parent.id //todo check this ID
                });

                retrievedOrders = orders.data
            }
            catch (err) {
                return "Error retrieving orders: " + err
            }
            finally {
                return retrievedOrders
            }
        }

        //Eventually ill need to put cards and stuff for the user side to edit their profile.
    },
};

module.exports = CustomerResolvers;
