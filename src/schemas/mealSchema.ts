// @ts-ignore
const {gql} = require('apollo-server-express');

const mealSchema = gql`
    extend type Query {
        retrieveAllMeals: [Meal]
    }
    
    extend type Mutation {
        #Creates a new meal and adds it to the database
        createMeal(meal: createMealInput): Boolean

        #Using the ID from a meal, delete it.
        deleteMeal(productID: String): String
    },

    input createMealInput {
        title: String
        vegetables: [String]
        description: String
        photoURL: String
        pretaxPrice: String
        proteinWeight: String
        fatWeight: String
        carbs: String
        calories: String
    },

    type Meal {
        productID: String
        priceID: String
        title: String
        vegetables: [String]
        description: String
        photoURL: String
        pretaxPrice: Float
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
    },
`;

module.exports = mealSchema;