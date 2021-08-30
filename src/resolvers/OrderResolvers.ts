
import {stripe} from "../index";
import {Stripe} from "stripe";
const orderModel = require('../models/OrderModel');

export const OrderResolvers = {
    Query: {
        getAllOrders(){
            return orderModel.find()
        },

        getOrder(args: any){
            const order = orderModel.findOne({invoiceID: args.order});
            return order
        },


        /*
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

            let invoiceItemIDs: any = [];

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
                    invoiceItemIDs.push(invoiceItem.id)
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


            } catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }

            console.log("Sent order to DB")

            const order = await orderModel.create({
                invoiceID: invoiceID,
                invoiceItemIDs: invoiceItemIDs,
                customerID: args.order.customerID,
                products: {
                    ...args.order.products,
                    meals: {
                        status: "UNMADE"
                    },
                    extras: {
                        status: "UNMADE"
                    }
                },
                status: "UNMADE",
                pretaxPrice: args.order.pretaxPrice,
                coupon: args.order.coupon,
                notes: args.order.notes,
                // deliveryDate: args.order.deliveryDate.toDateString, //TODO Fix date input
                deliveryDate: new Date(),
                creationDate: new Date(),
            })
            return orderModel.findOne({invoiceID: invoiceID})
        },

        /*updateMealStatus(parent, args, context, info){},

        updateOrderStatus(parent, args, context, info){},*/
    },


    Order: {
        async customer(parent: any, args: any, context: any, info: any) {
            console.log("Retrieving Customer Data: " + parent.customerID)
            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(parent.customerID)
            return {
                id:  customer.id,
                name: "name" in customer ? customer.name : undefined,
                email: "email" in customer ? customer.email : undefined,
                phone: "phone" in customer ? customer.email : undefined,
                address: "address" in customer ? customer.address : undefined,
                shipping: "shipping" in customer ? customer.shipping : undefined,
                default_source: "default_source" in customer ? customer.default_source : undefined,
                //todo: ORDERS
                notes: "description" in customer ? customer.description : undefined
            }
        },

        //Retrieve the productIDs inside an order for the meals.
        async products(parent: any) {
            console.log("Retrieving Products")
            let meals: any[] = []
            let extras: any[] = []

            //make an array of meals
            parent.products.meals.forEach((meal: any) => {
                meals.push({
                    proteinID: meal.proteinID,
                    vegetable: meal.vegetable,
                    carbohydrate: meal.carbohydrate,
                    sauce: meal.sauce,
                    priceID: meal.priceID,
                })
            })

            //make an array of extras
            parent.products.extras.forEach((extra: any) => {
                extra.push({
                    extraID: extra.extraID,
                })
            })

            return {
                meals: meals,
                extras: extras
            }
        }
    }
};

module.exports = OrderResolvers;
