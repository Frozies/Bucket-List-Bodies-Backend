const productModel  = require('./productModel');
const orders = require("./testData");
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*const utilityResolvers = {
    Date: GraphQLDateTime
}

const orderResolvers = {

}

const customerResolvers = {

}

const foodResolvers = {

}*/

const resolvers = {
    Query: {
        orders: () => orders,

        order(parent, args, context, info) {
            return orders.find(order => order.id === args.id);
        },

        //TODO: Search customer database
        customer(parent, args, context, info) {
            return orders.find(order => order.customer.id === args.id)
        }
    },
};
module.exports = resolvers;
