const CustomerResolvers = {
    Query: {
        getCustomerFromOrder(parent, args, context, info){},

        getOneCustomer(parent, args, context, info){},

        getAllActiveCustomers(parent, args, context, info){},

        getAllInactiveCustomers(parent, args, context, info){},

        getAllCustomers(parent, args, context, info){},

        getAllSingleCustomerOrders(parent, args, context, info){},
    },

    Mutation: {
        createCustomer(parent, args, context, info){},
    }
};
module.exports = CustomerResolvers;
