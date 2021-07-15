const OrderResolvers = {
    Query: {
        getAllOrders(parent, args, context, info){},

        getOneOrder(parent, args, context, info){},

        getAllActiveOrders(parent, args, context, info){},

        getAllActiveOrdersByDate(parent, args, context, info){},

        getOrdersByStatus(parent, args, context, info){},

        getOrdersByProtein(parent, args, context, info){},

        getOrdersByVegetable(parent, args, context, info){},

        getOrdersByCarb(parent, args, context, info){},

        getOrdersBySauce(parent, args, context, info){},

        getOrdersByDonut(parent, args, context, info){},

        getOrdersByDelDate(parent, args, context, info){},

        getOrdersByMealStatus(parent, args, context, info){},
    },

    Mutation: {
        createOrder(parent, args, context, info){},

        updateMealStatus(parent, args, context, info){},

        updateOrderStatus(parent, args, context, info){},
    },
};

module.exports = OrderResolvers;
