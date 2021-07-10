const {gql} = require("apollo-server");

const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    scalar Date

    type Order {
        id: ID!,
        customer: Customer!
        meals: [Meal!]!
        status: String!
        total: Float
        coupon: String
        notes: String
    }
    
    type Meal {
        id: ID
        protein: String
        veggie: String
        carb: String
        sauce: String
        deliveryDate: Date
        dateTimeMade: Date
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
        orders: [Order]
    }
`;

module.exports = typeDefs;