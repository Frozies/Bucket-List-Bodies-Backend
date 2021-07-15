const {gql} = require("apollo-server");

const typeDef = gql`
    type Customer {
        id: ID
        name: String
        phone: String
        address: Address
        cards: [String]
        orders: [Order]
        notes: String
    }

    #TODO: Fill out
    input CustomerInput {
        id: String
    }

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
`;

module.exports = typeDef;