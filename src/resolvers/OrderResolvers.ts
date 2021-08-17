export const OrderResolvers = {
    Query: {
/*        getAllOrders(parent, args, context, info){},

        getOneOrder(parent, args, context, info){},

        getAllActiveOrders(parent, args, context, info){},

        getAllActiveOrdersByDate(parent, args, context, info){},

        getOrdersByFood(parent, args, context, info){},

        getOrdersByDelDate(parent, args, context, info){},

        getOrdersByMealStatus(parent, args, context, info){},*/
    },

    Mutation: {
        createOrder(parent: any, args: any, context: any, info: any){
            //calculate total price
            console.table(args.customer)

            /*TODO: The args.customer is undefined... i believe the data is all there, but its not getting passed properly
            *  After that, send the data to the database.*/

            //save to db
        },

        /*updateMealStatus(parent, args, context, info){},

        updateOrderStatus(parent, args, context, info){},*/
    },
};

module.exports = OrderResolvers;
