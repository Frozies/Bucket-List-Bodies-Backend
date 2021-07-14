const {gql} = require("apollo-server");

const typeDef = gql`
    type Meal {
        id: ID
        protein: String
        veggie: String
        carb: String
        sauce: String
        timeMate: Date
        status: String
        parentOrder: Order
        priceID: String
    }
    
    type Food {
        name: String
        index: Int
    }
    
    input FoodInput {
        name: String,
        index: Int
    }

    extend type Query {
        getProteins: [Food]
        getVegetables: [Food]
        getCarbs: [Food]
        getSauces: [Food]
        getDonuts: [Food]
        getExtras: [Food]
    }

    extend type Mutation {
        #Add or remove food items offered. there should be a generic for this
        createProtein(food: String): Boolean
        createVegetable(food: String): Boolean
        createCarb(food: String): Boolean
        createSauce(food: String): Boolean
        createDonut(food: String): Boolean
        createExtra(food: String): Boolean

        #taking an index delete the food. there should be a generic for this
        deleteProtein(food: FoodInput): Boolean
        deleteVegetable(food: FoodInput): Boolean
        deleteCarb(food: FoodInput): Boolean
        deleteSauce(food: FoodInput): Boolean
        deleteDonut(food: FoodInput): Boolean
        deleteExtra(food: FoodInput): Boolean
    }
`;

module.exports = typeDef;