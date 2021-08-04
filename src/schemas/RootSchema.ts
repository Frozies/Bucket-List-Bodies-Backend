const Order = require('./OrderSchemas');
const Customer = require( './CustomerSchema');
const Util = require('./UtilitySchemas');
import {gql} from "apollo-server";
const Meals = require('./MealSchema')

export const typeDefs = gql`
    type Query
    type Mutation

    ${Util}
    ${Meals}
    ${Order}
    ${Customer}
`;

module.exports = typeDefs