// @ts-ignore
const {gql} = require('apollo-server-express');

const orderSchema = gql`
    extend type Query {
        #Get every order ever
        getAllOrders: [Order]

        getOrder(order: String): Order

        #        #Get one order by its ID
        #        getOneOrder(id: ID): Order
        #
        #        #Get all active orders that have yet to be delivered.
        #        getAllActiveOrders: [Order]
        #
        #        #Retrieve the orders by a specified date.
        #        getAllActiveOrdersByDate(date: Date): [Order]
        #
        #        #Finds an ORDER by its status of whether or not its been seen, preped, or delivered.
        #        getOrdersByStatus(status: String): [Order]
        #
        #        #finds orders by their listed Food Type
        ##        getOrdersByFood(food: FoodInput): [Order] //TODO: By Meal
        #        
        #        #Finds orders that have specified delivery dates
        #        getOrdersByDelDate(date: Date): [Order]
        #
        #        #Iterates through each meal in each order to search for the designated meal status
        #        getOrdersByMealStatus(status: String): [Order]     
        #        
        #        #Finds orders based on the Customer
        #        getAllSingleCustomerOrders(customer: ID): [Order]
    },

    extend type Mutation {
        #On the administration dashboard, create a new order manually.
        createOrder(order: createOrderInput): Order

        #Update an order's information.
        #        updateOrder(order: orderUpdateInput): Order

        #        #Updates a specific meal if it has been made
        #        updateMealStatus(status: String): Boolean
        #        
        #        #Updates an entire order to if it has been finished being made or if it has been delivered.
        #        updateOrderStatus(status: String): Boolean
    },

    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Order {
        invoiceID: String!
        invoiceItemIDs: [String!]!
        customer: Customer!
        products: orderedProducts!
        status: String!
        pretaxPrice: Float!
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
        status: StatusCode!
    },

    type orderedExtra {
        extraID: String!
        status: StatusCode!
    },

    input createOrderInput {
        customerID: String!
        products: orderedProductsInput!
        coupon: String
        notes: String
    },

    input orderedProductsInput {
        meals: [orderedMealInput!]!
        extras: [orderedExtraInput]
    },

    input orderedMealInput {
        proteinID: String!
        priceID: String!
        vegetable: String!
        carbohydrate: String!
        sauce: String!
    },

    input orderedExtraInput {
        extraID: String!
        extrasPriceID: String!
    },

        input orderUpdateInput {
            invoiceID: String!
            products: orderedProductsUpdateInput
            status: String
            pretaxPrice: Float
            notes: String
            deliveredDate: Date
        },
        
        input orderedProductsUpdateInput {
            meals: [orderedMealUpdateInput]
            extras: [orderedExtraUpdateInput]
        },

        input orderedMealUpdateInput {
            proteinID: String!
            priceID: String
            vegetable: String
            carbohydrate: String
            sauce: String
        },

        input orderedExtraUpdateInput {
            extraID: String!
            extrasPriceID: String
        },

`;

module.exports = orderSchema;