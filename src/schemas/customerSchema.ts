// @ts-ignore
const {gql} = require('apollo-server-express');

const customerSchema = gql`
        extend type Query {
            #Get one single customer by ID
            getCustomer(id: String): Customer

            #Retrieves all customers
            getAllCustomers(id: String): [Customer]
            
#            #Using an order ID, get the customer's information.
#            getCustomerFromOrder(id: ID): Customer
#            
#            #Retrieves all customers that do have a current subscription or order that has yet been completed.
#            getAllActiveCustomers: [Customer]
#
#            #Retrieves all customers that do not have a current subscription
#            getAllInactiveCustomers: [Customer]
#            
#            #Retrieves all the orders from a specified customer
#            getSingleCustomerOrders(id: ID): [Order]
        }

    extend type Mutation {
        #Create a new customer to add it to stripe
        createCustomer(customer: createNewCustomerInput): Customer

        #Deletes a customer from stripe. This is commented out as I believe it is not needed at the moment.
        #deleteCustomer(customerID: String): Boolean

        #Updates a customer in stripe.
        updateCustomer(customer: updateCustomerInput): Customer
    }

    input createNewCustomerInput {
        name: String!
        email: String!
        phone: String!
        address: AddressInput!
        shipping: ShippingInput
        notes: String
    }

    input updateCustomerInput{
        id: String!
        name: String
        email: String
        phone: String
        address: AddressInput
        shipping: ShippingInput
        notes: String
    }

    type Customer {
        id: String
        name: String
        email: String
        phone: String
        address: Address
        shipping: Shipping
        default_source: String
        orders: [Order]
        notes: String
    }
`;

module.exports = customerSchema;