// @ts-ignore
const {gql} = require('apollo-server-express');

const orderSchema = gql`
    extend type Query {
        #Get every order ever
        getAllOrders: [Order]

        #Get one order by its ID
        getOneOrder(id: ID): Order

        #Get all active orders that have yet to be delivered.
        getAllActiveOrders: [Order]

        #Retrieve the orders by a specified date.
        getAllActiveOrdersByDate(date: Date): [Order]

        #Finds an ORDER by its status of whether or not its been seen, preped, or delivered.
        getOrdersByStatus(status: String): [Order]

        #finds orders by their listed Food Type
#        getOrdersByFood(food: FoodInput): [Order] //TODO: By Meal
        
        #Finds orders that have specified delivery dates
        getOrdersByDelDate(date: Date): [Order]

        #Iterates through each meal in each order to search for the designated meal status
        getOrdersByMealStatus(status: String): [Order]     
        
        #Finds orders based on the Customer
        getAllSingleCustomerOrders(customer: ID): [Order]
    },

    extend type Mutation {
        #On the administration dashboard, create a new order manually.
        manualOrderCreation(order: manualOrderCreationInput): Order
        
        #Updates a specific meal if it has been made
        updateMealStatus(status: String): Boolean
        
        #Updates an entire order to if it has been finished being made or if it has been delivered.
        updateOrderStatus(status: String): Boolean
    },

    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Order {
        id: String!
        customer: Customer!
        products: orderedProducts!
        status: String!
        pretaxPrice: Float!
        postTaxPrice: Float
        coupon: String
        notes: String
        deliveredDate: Date
        creationDate: Date!
    },
    
    type orderedProducts {
        meals: [orderedMeal!]!
        extras: [orderedExtra]
    },
    
    type orderedMeal {
        proteinID: String!
        vegetable: String!
        carbohydrate: String!
        sauce: String!
    },

    type orderedExtra {
        extraID: String!
    },

    input manualOrderCreationInput {
        customerID: String!
        products: manualOrderedProductsInput!
        pretaxPrice: Float!
        coupon: String
        notes: String
    },

    input manualOrderedProductsInput {
        meals: [manualOrderedMealInput!]!
        extras: [manualOrderedExtraInput]
    },

    input manualOrderedMealInput {
        proteinID: String!
        vegetable: String!
        carbohydrate: String!
        sauce: String!
    },

    input manualOrderedExtraInput {
        extraID: String!
    },

`;

module.exports = orderSchema;