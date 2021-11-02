// @ts-ignore
const {gql} = require('apollo-server-express');

const authSchema = gql`
    extend type Query {
#        hello: String
#        bye: String
        users: [User]
        me: User
    }

    extend type Mutation {
        logout: Boolean
        revokeRefreshTokenForUser(userID: String): Boolean
        login(email: String, password: String): LoginResponse
        register(email: String, password: String): Boolean
    }
    
    type LoginResponse {
        accessToken: String
        user: User
    }
    
    type User {
        id: String
        email: String
        password: String
        tokenVersion: Int
    }
`;

module.exports = authSchema;