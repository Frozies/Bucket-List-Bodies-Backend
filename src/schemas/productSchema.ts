// @ts-ignore
const {gql} = require('apollo-server-express');

const productSchema = gql`
    extend type Query {
        retrieveAllMeals: [Meal]

        retrieveMeal(meal: String): Meal

        retrieveExtra(extra: String): Extra

        retrieveAllExtras: [Extra]
    },

    extend type Mutation {
        #Creates a new meal and adds it to the database
        createMeal(meal: createMealInput): Meal

        #Using the ID from a meal, delete it.
        deleteMeal(meal: deleteMealInput): String

        #Using the ID from a meal, update it. Changing allergy array is destructive. Someone remind me to change this later...
        updateMeal(meal: updateMealInput): Meal

        #Create a new price in stripe and disable the old one.
        updateMealPrice(meal: updatePriceInput): Meal


        #Creates a new Extra and adds it to the database
        createExtra(extra: createExtraInput): Extra

        #Using the ID from a Extra, delete it.
        deleteExtra(extra: deleteExtraInput): String

        #Using the ID from a Extra, update it. Changing allergy array is destructive. Someone remind me to change this later...
        updateExtra(extra: updateExtraInput): Extra

        #Create a new price in stripe and disable the old one.
        updateExtraPrice(extra: updatePriceInput): Extra
    },

    input createMealInput {
        title: String!
        vegetables: [String]
        description: String
        photoURL: String!
        pretaxPrice: Float!
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        allergies: [Allergies]
    },

    type Meal {
        productID: String!
        priceID: String!
        title: String!
        vegetables: [String]
        description: String
        photoURL: String
        pretaxPrice: Float!
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        allergies: [Allergies]
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
        allergies: [Allergies]
    },

    input updatePriceInput {
        pretaxPrice: Float!
        priceID: String!
        productID: String!
    },

    type Extra {
        productID: String!
        priceID: String!
        title: String
        description: String
        photoURL: String
        pretaxPrice: Float!
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        allergies: [Allergies]
    },

    input createExtraInput {
        title: String
        description: String
        photoURL: String!
        pretaxPrice: Float!
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        allergies: [Allergies]
    },
    
    input updateExtraInput {
        productID: String!
        title: String
        description: String
        photoURL: String
        proteinWeight: Int
        fatWeight: Int
        carbs: Int
        calories: Int
        active: Boolean
        allergies: [Allergies]
    },

    input deleteMealInput {
        productID: String
    },

    input deleteExtraInput {
        productID: String
    },
`;

module.exports = productSchema;