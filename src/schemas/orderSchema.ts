// @ts-ignore
const {gql} = require('apollo-server-express');

const orderSchema = gql`
    extend type Query {
        #Get every order ever
        getAllOrders: [Order] @hasRole(roles: admin)

        #using the invoice ID as an input, retrieve that specific order.
        getOrder(order: String): Order @hasRole(roles: admin)
        
        #
        #        #Get all active orders that have yet to be delivered.
        #        getAllActiveOrders: [Order] @hasRole(roles: admin)
        #
        #        #Retrieve the orders by a specified date.
        #        getAllActiveOrdersByDate(date: Date): [Order] @hasRole(roles: admin)
        #
        #        #Finds an ORDER by its status of whether or not its been seen, prepped, or delivered.
        #        getOrdersByStatus(status: String): [Order] @hasRole(roles: admin)
        #
        #        #finds orders by their listed Food Type
        ##        getOrdersByFood(food: FoodInput): [Order] @hasRole(roles: admin) //TODO: By Meal
        #        
        #        #Finds orders that have specified delivery dates
        #        getOrdersByDelDate(date: Date): [Order] @hasRole(roles: admin)
        #
        #        #Iterates through each meal in each order to search for the designated meal status
        #        getOrdersByMealStatus(status: String): [Order] @hasRole(roles: admin)   
        #        
        #        #Finds orders based on the Customer
        #        getAllSingleCustomerOrders(customer: ID): [Order] @hasRole(roles: admin)
    },

    extend type Mutation {
        #On the administration dashboard, create a new order manually.
        createOrder(order: createOrderInput): Order @hasRole(roles: admin)
        
        #Update an order's basic information. This does not affect pricing or invoice items.
        updateOrder(order: orderUpdateInput): Order @hasRole(roles: admin)
        
        #Add the line items and pricing for an invoice.
        addOrderLineItems(order: updateOrderLineItemsInput): Order @hasRole(roles: admin)
        
        #Remove the line items from an order.
        removeOrderLineItems(order: updateOrderLineItemsInput): Order @hasRole(roles: admin)

        #Update the attributes of products (ie products, status, sides of meals)
        updateOrderLineItems(order: updateOrderLineItemsInput): Order @hasRole(roles: admin)
        
        payOutOfBandOrder(order: orderPaymentInput): Order @hasRole(roles: admin)
        
        sendForManualPaymentOrder(order: orderUpdateInput): Order @hasRole(roles: admin)
        

        #Update an order's information.
        #        

        #        #Updates a specific meal if it has been made
        #        updateMealStatus(status: String): Boolean @hasRole(roles: admin)
        #        
        #        #Updates an entire order to if it has been finished being made or if it has been delivered.
        #        updateOrderStatus(status: String): Boolean @hasRole(roles: admin)
    },

    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Order {
        invoiceID: String!
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
        productID: String!
        priceID: String!
        invoiceItemID: String!
        vegetable: String!
        carbohydrate: String!
        sauce: String!
        status: StatusCode!
        pretaxPrice: Float!
    },

    type orderedExtra {
        productID: String!
        priceID: String!
        invoiceItemID: String!
        status: StatusCode!
        pretaxPrice: Float!
    },

    input createOrderInput {
        stripeID: String!
        products: orderedProductsInput!
        coupon: String
        notes: String
    },
    
    input updateOrderLineItemsInput {
        invoiceID: String!
        stripeID: String!
        products: orderedProductsInput
    }

    input orderedProductsInput {
        meals: [orderedMealInput!]
        extras: [orderedExtraInput!]
    },

    input orderedMealInput {
        productID: String!
        priceID: String!
        invoiceItemID: String
        vegetable: String
        carbohydrate: String
        sauce: String
        status: String
        pretaxPrice: Float
    },

    input orderedExtraInput {
        productID: String!
        priceID: String!
        invoiceItemID: String
        status: String
        pretaxPrice: Float
    },

    input orderUpdateInput {
        invoiceID: String!
        status: String
        notes: String
        deliveredDate: Date
    },
    
    input updateInvoiceLineItems {
        products: orderedProductsUpdateInput
    }
    
    input orderedProductsUpdateInput {
        meals: [orderedMealUpdateInput]
        extras: [orderedExtraUpdateInput]
    },

    input orderedMealUpdateInput {
        invoiceItemID: String!
        productID: String!
        priceID: String!
        vegetable: String
        carbohydrate: String
        sauce: String
        status: String
    },

    input orderedExtraUpdateInput {
        productID: String!
        priceID: String!
        invoiceItemID: String!
        status: String
    },
    
    input orderPaymentInput {
        invoiceID: String!
        status: String!
    }

`;

module.exports = orderSchema;