// @ts-ignore
const {gql} = require('apollo-server-express');

const customerSchema = gql`
    extend type Query {
        #Using an order ID, get the customer's information.
        getCustomerFromOrder(id: ID): Customer

        #Get one single customer by ID
        getOneCustomer(id: ID): Customer

        #Retrieves all customers that do have a current subscription or order that has yet been completed.
        getAllActiveCustomers: [Customer]

        #Retrieves all customers that do not have a current subscription
        getAllInactiveCustomers: [Customer]

        #Retrieves all customers
        getAllCustomers(id: ID): [Customer]

        #Retrieves all the orders from a specified customer
        getSingleCustomerOrders(id: ID): [Order]
    }

    extend type Mutation {
        #Create a new customer to add it to the DB returns true if successful
        createCustomer(customer: CustomerInput): Boolean
    }

    input CustomerInput {
        id: String
        name: String!
        email: String
        phone: String
        address: AddressInput!
        notes: String
        #        TODO: Need to put allergies here...
    }

    type Customer {
        id: ID
        name: String
        email: String
        phone: String
        address: Address
        cards: [String]
        orders: [Order]
        notes: String
        #        TODO: Need to put allergies here...

    }
`;

module.exports = customerSchema;