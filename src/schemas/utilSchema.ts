// @ts-ignore
const {gql} = require('apollo-server-express');

const utilitySchema = gql`
    scalar Date
    scalar Upload
    
    extend type Query {
        users: [User]
        user: User
    }

    extend type Mutation {
        singleFileUpload(file: Upload!): String
        multipleFileUpload(file: [Upload!]!): String
        login(
            email: String!
            password: String!
        ): AuthenticationResult
        signup(
            firstName: String!
            lastName: String!
            email: String!
            password: String!
        ): AuthenticationResult
        updateUserRole(role: String!): UserUpdateResult
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
    
    enum StatusCode {
        UNMADE
        MADE
        DELIVERED
        CANCELED
        REFUNDED
    }
    
    enum Allergies {
        FISH,
        SHELLFISH,
        NUT,
        DAIRY,
        EGGS,
        SOY,
        WHEAT,
        OTHER,
        NONE
    }

    type User {
        _id: ID!
        firstName: String!
        lastName: String!
        email: String!
        role: String!
        avatar: String
        bio: String
    }

    type AuthenticationResult {
        message: String!
        userInfo: User!
        token: String!
        expiresAt: String!
    }

    type UserUpdateResult {
        message: String!
        user: User!
    }
`;

module.exports = utilitySchema;