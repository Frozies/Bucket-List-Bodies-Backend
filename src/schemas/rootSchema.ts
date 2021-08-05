const orderSchema = require('./orderSchema');
const customerSchema = require( './customerSchema');
const utilSchema = require('./utilSchema');
import {gql} from "apollo-server";
const mealSchema = require('./mealSchema')

export const rootSchema = gql`
    type Query
    type Mutation

    ${utilSchema}
    ${mealSchema}
    ${orderSchema}
    ${customerSchema}
`;

module.exports = rootSchema;