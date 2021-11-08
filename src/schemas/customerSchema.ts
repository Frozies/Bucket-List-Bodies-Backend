// @ts-ignore
const {gql} = require('apollo-server-express');

const customerSchema = gql`
    
    extend type Query {
        #Get one single customer by ID
        getCustomer(id: String): Customer @hasRole(roles: admin)

        #Retrieves all customers
        getAllCustomers: [Customer] @hasRole(roles: admin)
        
         #Retrieves all customers that do have a current subscription or order that has yet been completed.
         getAllActiveCustomers: [Customer] @hasRole(roles: admin)
    
         #Retrieves all customers that do not have a current subscription
         getAllInactiveCustomers: [Customer] @hasRole(roles: admin)
        
    }

    extend type Mutation {
        #takes a registered user and updates the information to reflect a customer with stripe information.
        createCustomer(customer: createNewCustomerInput): Customer @hasRole(roles: admin)
    
        #Deletes a customer from stripe. This is commented out as I believe it is not needed at the moment.
        deleteCustomer(stripeID: String): Boolean @hasRole(roles: admin)
    
        #Updates a customer in stripe.
        updateCustomer(customer: updateCustomerInput): Customer @hasRole(roles: admin)
        
        #Intakes a customer's email & sends back the email and a bool
        resetPassword(email: String): resetCustomer @hasRole(roles: admin)
    }
    
    input createNewCustomerInput {
        name: String!
        email: String!
        phone: String!
        address: AddressInput!
        shipping: ShippingInput
        notes: String
        allergies: [String]
    }
    
    input updateCustomerInput{
        stripeID: String!
        name: String
        email: String
        phone: String
        address: AddressInput
        shipping: ShippingInput
        notes: String
        allergies: [String]
    }
    
    type Customer {
        stripeID: String!
        name: String!
        phone: String!
        address: Address!
        shipping: Shipping
        default_source: String
        orders: [Order]
        notes: String
        allergies: [String]
        id: String!
        email: String!
        password: String
        tokenVersion: Int!
        roles: [Role]
    }
    
    type resetCustomer {
        email: String
        success: Boolean
    }
`;

module.exports = customerSchema;