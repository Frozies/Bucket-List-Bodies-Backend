const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
                async createCustomer(parent: any, args: any, context: any, info: any) {
                    let customerID = '';
                    // Create a customer in stripe
                    try {
                        const customer = await stripe.customer.create({
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
                        });

                        customerID = customer.id
                        console.log("Created a new customer: " + customer.id)

                    } catch (err) {
                        return "Error creating customer in stripe: " + err;
                    }

                    // send the general information from stripe to the database
                    //
                }
    }
};

module.exports = CustomerResolvers;
