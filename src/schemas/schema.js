const Order = require('./OrderSchemas');
const Food = require('./FoodSchema');
const Customer = require( './CustomerSchema');
const Util = require('./UtilitySchemas');
const {gql} = require("apollo-server");

const typeDefs = gql`
    type Query{
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    ${Order}
    ${Food}
    ${Customer}
    ${Util}
`;

module.exports = typeDefs