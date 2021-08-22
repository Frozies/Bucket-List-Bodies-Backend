import {stripe} from "../index";
import {Stripe} from "stripe";


export const CustomerResolvers = {
    Query: {
        /*        getCustomerFromOrder(parent, args, context, info) {},

                getOneCustomer(parent, args, context, info){},

                getAllActiveCustomers(parent, args, context, info){},

                getAllInactiveCustomers(parent, args, context, info){},

                getAllCustomers(parent, args, context, info){},

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
                                    if (!args.customer.shippingAddress) {
                                        args.customer.shippingAddress = args.customer.billingAddress;
                                    }

                                    const params: Stripe.CustomerCreateParams = {
                                        address: {
                                            city: args.customer.billingAddress.city,
                                            country: "US",
                                            line1: args.customer.billingAddress.line1,
                                            line2: args.customer.billingAddress.line2,
                                            postal_code: args.customer.billingAddress.postal,
                                            state: args.customer.billingAddress.state,
                                        },
                                        description: args.customer.notes,
                                        email: args.customer.email,
                                        name: args.customer.firstName + " " + args.customer.lastName,
                                        phone: args.customer.phone,
                                        shipping: {
                                            name: args.customer.firstName + " " + args.customer.lastName,
                                            address: {
                                                city: args.customer.shippingAddress.city,
                                                country: "US",
                                                line1: args.customer.shippingAddress.line1,
                                                line2: args.customer.shippingAddress.line2,
                                                postal_code: args.customer.shippingAddress.postal,
                                                state: args.customer.shippingAddress.state,
                                            },
                                        }
                                    };

                                    const customer: Stripe.Customer = await stripe.customers.create(params);

                                    customerID = customer.id
                                    console.log("Created a new customer: " + customer.id)
                                };

                                await createCustomer();
                            } catch (err) {
                                console.log(err)
                                return "Error createCustomer: " + err;
                            }
                        })
                    }
                    catch (err) {
                        return "Error findCustomerByEmail: " + err
                    }
                    finally {
                        /* If customerID has been returned by stripe then return that data*/
                        if (customerID != '') return {...args.customer, id: customerID}
                    }
                },

    }
};

module.exports = CustomerResolvers;
