// @ts-ignore
const {gql} = require('apollo-server-express');

const customerSchema = gql`
        extend type Query {
            #Get one single customer by ID
            getCustomer(id: String): Customer

            #Retrieves all customers
            getAllCustomers(id: String): [Customer]
            
#            #Retrieves all customers that do have a current subscription or order that has yet been completed.
#            getAllActiveCustomers: [Customer]
#
#            #Retrieves all customers that do not have a current subscription
#            getAllInactiveCustomers: [Customer]
#
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
        #todo allergies => CustomerResolvers.ts line 128 too
    }

    input updateCustomerInput{
        id: String!
        name: String
        email: String
        phone: String
        address: AddressInput
        shipping: ShippingInput
        notes: String
        #todo allergies
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