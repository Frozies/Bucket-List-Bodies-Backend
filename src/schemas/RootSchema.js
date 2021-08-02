const Order = require('./OrderSchemas');
const Customer = require( './CustomerSchema');
const Util = require('./UtilitySchemas');
const {gql} = require("apollo-server");
const Meals = require('./MealSchema')

const typeDefs = gql`
    type Query
    type Mutation

    ${Util}
    ${Meals}
    ${Order}
    ${Customer}
`;

module.exports = typeDefs