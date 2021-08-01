const {gql} = require("apollo-server");

const typeDef = gql`
    type Meal {
        id: ID
    },
    
    input MealInput {
      id: ID  
    },
    
    extend type Query {
        
    }
    
    extend type Mutation {
        #Creates a new meal and adds it to the database
        createNewMeal(meal: MealInput): Boolean
    },
`;

module.exports = typeDef;