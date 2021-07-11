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
        orders: [Order]
    }
`;

module.exports = typeDefs;