import {orderModel} from "../models/OrderModel";

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
        async createOrder(parent: any, args: any, context: any, info: any) {
            /*TODO: Pricing*/
            let total = args.order.meals.length * 9.99


            //Create Mongoose Model
            try {
                await orderModel.create({
                    customer: {
                        name: args.order.customer.name,
                        phone: args.order.customer.phone,
                        address: {
                            city: args.order.customer.address.city,
                            line1: args.order.customer.address.line1,
                            line2: args.order.customer.address.line2,
                            postal: args.order.customer.address.postal,
                            state: args.order.customer.address.state,
                        }
                    },

                    status: "Unmade",
                    total: total,
                    coupon: args.order.coupon,
                    notes: args.order.notes,
                    meals: {...args.order.meals},
                    deliveryDate: args.order.deliveryDate.toDateString()
                })
            } catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }

            //save to db
        },

        /*updateMealStatus(parent, args, context, info){},

        updateOrderStatus(parent, args, context, info){},*/
    },
};

module.exports = OrderResolvers;
