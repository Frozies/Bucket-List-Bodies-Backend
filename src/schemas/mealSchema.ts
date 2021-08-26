// @ts-ignore
const {gql} = require('apollo-server-express');

const mealSchema = gql`
    extend type Query {
        retrieveAllMeals: [Meal]
    }
    
    extend type Mutation {
        #Creates a new meal and adds it to the database
        createMeal(meal: createMealInput): Meal

        #Using the ID from a meal, delete it.
        deleteMeal(productID: String): String
        
        #Using the ID from a meal, update it.
        updateMeal(meal: updateMealInput): Meal
        
        #Create a new price in stripe and disable the old one.
        updateMealPrice(meal: updateMealPriceInput): Meal
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
    
    input updateMealInput {
        productID: String!
        title: String
        vegetables: [String]
        description: String
        photoURL: String
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        active: Boolean
    }
    
    input updateMealPriceInput {
        pretaxPrice: String
        priceID: String
        productID: String
    }
`;

module.exports = mealSchema;