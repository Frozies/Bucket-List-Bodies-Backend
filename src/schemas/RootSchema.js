const Order = require('./OrderSchemas');
const Customer = require( './CustomerSchema');
const Util = require('./UtilitySchemas');
const {gql} = require("apollo-server");

const typeDefs = gql`
    type Query
    type Mutation
    
    ${Order}
    ${Customer}
    ${Util}
`;

module.exports = typeDefs