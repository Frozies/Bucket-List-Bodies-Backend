// @ts-ignore
const {gql} = require('apollo-server-express');

const authSchema = gql`
    directive @hasScope(scopes: [String]) on OBJECT | FIELD_DEFINITION
    directive @hasRole(roles: [Role]) on OBJECT | FIELD_DEFINITION
    directive @isAuthenticated on OBJECT | FIELD_DEFINITION

    enum Role {
        reader
        user
        admin
    }
    
    extend type Query {
#        hello: String
#        bye: String
        users: [Customer] @hasRole(roles: admin)
        me: Customer @isAuthenticated
    }

    extend type Mutation {
        logout: Boolean @isAuthenticated
        revokeRefreshTokenForUser(userID: String): Boolean
        login(email: String, password: String): LoginResponse
        register(email: String, password: String): Boolean
    }
    
    type LoginResponse {
        accessToken: String
        user: Customer
    }
`;

module.exports = authSchema;