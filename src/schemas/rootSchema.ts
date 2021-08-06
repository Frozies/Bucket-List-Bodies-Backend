const orderSchema = require('./orderSchema');
const customerSchema = require( './customerSchema');
const utilSchema = require('./utilSchema');
import {gql} from "apollo-server-express";
const mealSchema = require('./mealSchema')

export const rootSchema = gql`
    type Query {
        helloWorld: String
    }

`;

/*
    type Query
    type Mutation

    ${utilSchema}
    ${mealSchema}
    ${orderSchema}
    ${customerSchema
    */