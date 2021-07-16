const {gql} = require("apollo-server");

const typeDef = gql`
    scalar Date
    scalar FoodTypes #TODO: fill in the resolver for the scalar to list the different food types from file

    type Address {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
    
    type Food {
        foodType: FoodTypes
        name: String
    }
    
    input FoodInput {
        foodType: FoodTypes
        name: String
    }
    
    extend type Query {
        #Input a food type (Protein, carb, etc) and get a list of its children foods
        getListOfFoodsFromType(foodType: FoodTypes): [Food]
    }
    
    extend type Query {
        addFoodToType(name: String, foodType: String): Boolean
        
        removeFoodFromType(name: String): Boolean
    }

    #TODO: Stripe Queries
    #TODO: Mutations
    #TODO: Find existing customer for stripe
`;

module.exports = typeDef;