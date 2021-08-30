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
        deleteMeal(productID: String): String

        #Using the ID from a meal, update it.
        updateMeal(meal: updateMealInput): Meal

        #Create a new price in stripe and disable the old one.
        updateMealPrice(meal: updatePriceInput): Meal


        #Creates a new Extra and adds it to the database
        createExtra(Extra: createExtraInput): Extra

        #Using the ID from a Extra, delete it.
        deleteExtra(productID: String): String

        #Using the ID from a Extra, update it.
        updateExtra(Extra: updateExtraInput): Extra

        #Create a new price in stripe and disable the old one.
        updateExtraPrice(Extra: updatePriceInput): Extra
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
    },

    input updatePriceInput {
        pretaxPrice: String
        priceID: String
        productID: String
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
    },

    input createExtraInput {
        title: String
        description: String
        photoURL: String
        pretaxPrice: String
        proteinWeight: String
        fatWeight: String
        carbs: String
        calories: String
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
    },
`;

module.exports = productSchema;