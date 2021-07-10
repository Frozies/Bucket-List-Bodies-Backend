const productModel  = require('./productModel');
const {forEach} = require("iterall");
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language') ;


const resolvers = {
    Query: {
        orders: () => orders,
    },

    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
};
module.exports = resolvers;
