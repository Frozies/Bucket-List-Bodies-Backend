const orders = require("../testData");
const CustomerResolvers = {
    Query: {
        getCustomerFromOrder(parent, args, context, info) {
            return true
        },

        getOneCustomer(parent, args, context, info){
            return true
        },

        getAllActiveCustomers(parent, args, context, info){
            return true
        },

        getAllInactiveCustomers(parent, args, context, info){
            return true
        },

        getAllCustomers(parent, args, context, info){
            return true
        },

        getAllSingleCustomerOrders(parent, args, context, info){
            return true
        },
    },

    Mutation: {
        createCustomer(parent, args, context, info){
            return true
        },
    }
};

function findCustomerFromOrder(orderID) {

}

module.exports = CustomerResolvers;
