const MealResolvers = {
    Query: {

    },

    Mutation: {
        createMeal(parent, args, context, info){
            //Check if meal name already exists
            //check if mead ID already exists
            //Create Stripe Price
            //Create Mongoose Model
        },
    }
}
module.exports = MealResolvers;