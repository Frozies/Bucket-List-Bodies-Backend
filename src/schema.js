const {gql} = require("apollo-server");

const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Order {
        id: ID!,
        customer: Customer!
        meals: [Meal!]!
        status: String!
        total: Float
        coupon: String
        notes: String
        deliveryEpoch: Int
    }
    
    type Meal {
        id: ID
        protein: String
        veggie: String
        carb: String
        sauce: String
        timeMadeEpoch: Int
        status: String
        parentOrder: Order
        priceID: String
    }
    
    type Customer {
        id: ID
        name: String
        phone: String
        address: Address
        cards: [String]
        orders: [Order]
        notes: String
    }
    
    type Address {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
    
    type Query {
        #Get every order ever
        getAllOrders: [Order]
        
        #Get one order by its ID
        getOneOrder(id: ID): Order
        
        #Get all active orders that have yet to be delivered.
        getAllActiveOrders: [Order]
        
        #Retrieve the orders by a specified date. TODO: Scalar date type
        getAllActiveOrdersByDate(date: Int): [Order]
        
        #Using an order ID, get the customer's information.
        getCustomerFromOrder(id: ID): Customer
        
        #Get one single customer by ID
        getOneCustomer(id: ID): Customer
        
        #Retrieves all customers that do have a current subscription or order that has yet been completed.
        getAllActiveCustomers: [Customer]
        
        #Retrieves all customers that do not have a current subscription
        getAllUnactiveCustomers: [Customer]
        
        #Retrieves all customers
        getAllCustomers(id: ID): [Customer]
        
        #Retrieves all the orders from a specified customer
        getCustomerOrders(id: ID): [Order]
        
        #Finds an ORDER by its status of whether or not its been seen, preped, or delivered.
        getOrdersByStatus(status: String): [Order]
        
        #finds orders by their listed proteins
        getOrdersByProtein(food: String): [Order]
        
        #Finds orders by their listed veggies.
        getOrdersByVegetable(food: String): [Order]
        
        #Finds orders with specified carbs
        getOrdersByCarb(food: String): [Order]
        
        #Finds orders with specified sauces
        getOrdersBySauce(food: String): [Order]

        #Finds orders with specified Donut
        getOrdersByDonut(food: String): [Order]
        
        #Finds orders that have specified delivery dates
        getOrdersByDelDate(date: String): [Order]
        
        #Iterates through each meal in each order to search for the designated meal status
        getOrdersByMealStatus(status: String): [Order]
        
        #TODO: Stripe Queries
        #TODO: Mutations
    }
`;

module.exports = typeDefs;