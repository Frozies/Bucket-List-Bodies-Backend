import {orderModel} from "../models/OrderModel";
import {stripe} from "../index";
import {Stripe} from "stripe";

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
        async manualOrderCreation(parent: any, args: any, context: any, info: any) {
            // Note to self: It might be a smart move to pull the first item out of the order,
            //  create one line item, then create the invoice, then add the rest of the line
            // items to the invoice. or something similar.

            //Add each line item to the invoice
            try {
                for (const meal of args.order.products.meals) {
                    const params: Stripe.InvoiceItemCreateParams = {
                        customer: args.order.customerID,
                        description: "", //TODO: Set a description
                        price: meal.priceID,
                        quantity: 1,//TODO: Count quantity
                    }

                    const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create(params);
                    console.log("Adding invoice item to invoice: " + invoiceItem.id)
                }
            }
            catch (err) {
                console.log("Error creating invoice item: " + err);
                return ("Error creating invoice item: " + err);
            }

            let invoiceID: any;

            //Create invoice on customer in stripe
            try {
                const params: Stripe.InvoiceCreateParams = {
                    customer: args.order.customerID,
                }

                const invoice: Stripe.Invoice = await stripe.invoices.create(params)

                invoiceID = invoice.id
                console.log("Created invoice: " + invoiceID)
            }
            catch (err) {
                console.log("Error creating invoice: " + err)
            }


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


    Order: {
        async customer(parent: any) {
            let retrievedCustomer;
            try {
                const customer = await stripe.customers.retrieve(parent.customer.id)
                console.table(customer)
                retrievedCustomer = customer
            }
            catch (err) {
                return "Error retrieving customer: " + err
            }
            finally {
                return retrievedCustomer
            }
        },

        //TODO: Check to see if this actually works.
        //Retrieve the productIDs inside an order for the meals.
        async products(parent: any) {
            for(let proteinID in parent.meals) {
                try {
                    console.log("FINDING MEAL: " + proteinID)
                    return await stripe.products.retrieve(proteinID)
                }
                catch (err) {
                    console.log("Error retrieving meal from order: " + err)
                    return ("Error retrieving meal from order: " + err)
                }
            }
        }
    }
};

module.exports = OrderResolvers;
