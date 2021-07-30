const {gql} = require("apollo-server");

const typeDef = gql`
    scalar Date

    type Address {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
`;

module.exports = typeDef;