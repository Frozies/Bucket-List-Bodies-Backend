// @ts-ignore
const {gql} = require('apollo-server-express');

const mealSchema = gql`
    extend type Query {
        retrieveAllMeals: [Meal]
    }
    
    extend type Mutation {
        #Creates a new meal and adds it to the database
        createMeal(meal: MealInput): Boolean

        #Using the ID from a meal, delete it.
        deleteMeal(meal: MealInput): String
    },

    input MealInput {
        _id: String
        title: String
        sides: String
        description: String
        photoURL: String
        price: String
        carbs: String
        calories: String
        allergies: [String]
    },

    type Meal {
        _id: String
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

module.exports = mealSchema;