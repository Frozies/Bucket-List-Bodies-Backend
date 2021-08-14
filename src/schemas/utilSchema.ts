// @ts-ignore
const {gql} = require('apollo-server-express');

const utilitySchema = gql`
    scalar Date
    scalar Upload

    extend type Mutation {
        singleFileUpload(file: Upload!): String
        multipleFileUpload(file: [Upload!]!): String
    }
    
    type Address {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
    
    input AddressInput {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
`;

module.exports = utilitySchema;