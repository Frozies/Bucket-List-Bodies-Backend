// @ts-ignore
const {gql} = require('apollo-server-express');

const utilitySchema = gql`
    scalar Date
    scalar Upload

    extend type Mutation {
        singleFileUpload(file: Upload!): String
        multipleFileUpload(file: [Upload!]!): String
    }
    
    type Shipping {
        name: String
        address: Address
    }

    input ShippingInput {
        name: String
        address: AddressInput
    }
    
    type Address {
        city: String
        line1: String
        line2: String
        postal_code: String
        state: String
    }
    
    input AddressInput {
        city: String
        line1: String
        line2: String
        postal_code: String
        state: String
    }
`;

module.exports = utilitySchema;