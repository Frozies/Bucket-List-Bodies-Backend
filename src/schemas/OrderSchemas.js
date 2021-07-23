const {gql} = require("apollo-server");

const typeDef = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Order {
        id: ID!,
        customer: Customer!
        meals: [Meal!]!
        status: String!
        total: Float
        coupon: String
        notes: String
        deliveryDate: Date
    },

    type Meal {
        id: ID    
    },
    

    #TODO: Fill out
    input OrderInput {
        id: String
    },

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
        getOrdersByFood(food: FoodInput): [Order]
        
        #Finds orders that have specified delivery dates
        getOrdersByDelDate(date: Date): [Order]

        #Iterates through each meal in each order to search for the designated meal status
        getOrdersByMealStatus(status: String): [Order]        
        getAllSingleCustomerOrders(customer: ID): [Order]
    },

    extend type Mutation {
        #Create an order and return its order# input customer and order details
        createOrder(order: OrderInput, customer: CustomerInput): String
        
        updateMealStatus(status: String): Boolean
        updateOrderStatus(status: String): Boolean
    },
`;

module.exports = typeDef;