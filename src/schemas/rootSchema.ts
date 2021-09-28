const orderSchema = require('./orderSchema');
const customerSchema = require( './customerSchema');
const utilSchema = require('./utilSchema');
import {gql} from "apollo-server-express";
const productSchema = require('./productSchema')

export const rootSchema = gql`
    type Query
    type Mutation
    
    ${utilSchema}
    ${productSchema}
    ${orderSchema}
    ${customerSchema}
`;