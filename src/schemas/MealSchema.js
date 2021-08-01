const {gql} = require("apollo-server");

const typeDef = gql`
    
    extend type Mutation {
        #Creates a new meal and adds it to the database
        createMeal(meal: MealInput): Boolean
    },

    input MealInput {
        title: String
        sides: String
        description: String
        photoURL: String
        price: Float
        carbs: Int
        calories: Int
        allergies: [String]
    },

    type Meal {
        productID: String
        priceID: String
        title: String
        sides: String
        description: String
        photoURL: String
        price: Float
        carbs: Int
        calories: Int
        allergies: [String]
    },
`;

module.exports = typeDef;