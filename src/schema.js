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

        getProteins
        getVegetables
        getCarbs
        getSauces
        getDonuts
        getExtras
        
        #TODO: Stripe Queries
        #TODO: Mutations
        #TODO: Find existing customer for stripe
    }
    
    type Mutation {
        #Create an order and return its order# input customer and order details
        createOrder(order: OrderInput, customer: CustomerInput): String
        
        #Create a new customer to add it to the DB returns true if successful
        createCustomer(customer: CustomerInput): Boolean
        
        #Add or remove food items offered. there should be a generic for this
        createProtein(food: String): Boolean
        createVegetable(food: String): Boolean
        createCarb(food: String): Boolean
        createSauce(food: String): Boolean
        createDonut(food: String): Boolean
        createExtra(food: String): Boolean
        
        #taking an index delete the food. there should be a generic for this
        deleteProtein(index: Int): Boolean
        deleteVegetable(index: Int): Boolean
        deleteCarb(index: Int): Boolean
        deleteSauce(index: Int): Boolean
        deleteDonut(index: Int): Boolean
        deleteExtra(index: Int): Boolean
        
        updateMealStatus(status: String): Boolean
        updateOrderStatus(status: String): Boolean
        
    }
    
    #TODO: Fill out
    input OrderInput {
        id: String
    }

    #TODO: Fill out
    input CustomerInput {
        id: String
    }
    
`;

module.exports = typeDefs;