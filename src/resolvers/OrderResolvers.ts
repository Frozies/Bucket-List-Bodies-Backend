
import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import {forEach, map} from "lodash";
const orderModel = require('../models/OrderModel');
const customerModel = require('../models/CustomerModel')
const {customerID} = require('../utility/stripe');



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
        async createOrder(parent: any, args: any, context: any, info: any) {
            // Note to self: It might be a smart move to pull the first item out of the order,
            //  create one line item, then create the invoice, then add the rest of the line
            // items to the invoice. or something similar.

            //I dont think i need to store the entire array in memory...
            //let invoiceItems: Array<Stripe.InvoiceItem> = [];

            let invoiceItemIDs: Array<string> = [];
            let totalUnitAmount = 0;
            let invoiceID: any;


            //Add each line item to the invoice
            try {
                for (const meal of args.order.products.meals) {
                    const params: Stripe.InvoiceItemCreateParams = {
                        customer: args.order.customerID,
                        price: meal.priceID,
                        quantity: 1,
                    }

                    const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create(params);
                    console.log("Adding invoice item Meal to invoice: " + invoiceItem.id)
                    invoiceItemIDs.push(invoiceItem.id)
                    console.log("Price: " + <number>invoiceItem.price?.unit_amount)
                    totalUnitAmount += <number>invoiceItem.price?.unit_amount;
                }

                //todo: DUPLICATE CODE make some generics
                for (const extra of args.order.products.extras) {
                    const params: Stripe.InvoiceItemCreateParams = {
                        customer: args.order.customerID,
                        price: extra.extrasPriceID,
                        quantity: 1,
                    }

                    const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create(params);
                    console.log("Adding invoice item Extra to invoice: " + invoiceItem.id)
                    invoiceItemIDs.push(invoiceItem.id)
                    console.log("Price: " + <number>invoiceItem.price?.unit_amount)
                    totalUnitAmount += <number>invoiceItem.price?.unit_amount;
                }
            }
            catch (err) {
                console.log("Error creating invoice item: " + err);
                return ("Error creating invoice item: " + err);
            }

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

            console.log("Sending order to DB")
            //Create Mongoose Model
            try {
                //insert status into each product

                let meals = () => {
                    for(let meal in args.order.products.meals) {
                        return {
                            ...args.order.products.meals[meal],
                            status: 'UNMADE',
                        }
                    }
                }
                let extras = () => {
                    for(let extra in args.order.products.extras) {
                        return {
                            ...args.order.products.extras[extra],
                            status: 'UNMADE',
                        }
                    }
                }



                const order = await orderModel.create({
                    invoiceID: invoiceID,
                    invoiceItemIDs: invoiceItemIDs,
                    customerId: args.order.customerID,

                    products: {
                        meals: {
                            ...meals()
                        },
                        extras: {
                            ...extras()
                        }
                    },

                    status: "UNMADE",
                    pretaxPrice: totalUnitAmount/100    ,
                    coupon: args.order.coupon,
                    notes: args.order.notes,
                    deliveryDate: args.order.deliveryDate,
                    creationDate: new Date(),
                })
            } catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }


            console.log("Adding order to Customer's order ledger.")
            //Add order to customer ledger.
            try {
                await customerModel.findOneAndUpdate({id: args.order.customerID}, {
                    $push: {
                        orders: invoiceID
                    }
                })
            }
            catch (err) {
                console.log("Error adding order to customer ledger: " + err);
                return ("Error adding order to customer ledger: " + err);
            }

            const updatedOrder = orderModel.findOne({invoiceID: invoiceID})
            return updatedOrder
        },

        async updateOrder(args: any) {
            /* *
            invoiceID: String!
            products: orderedProductsUpdateInput
            status: String
            pretaxPrice: Float
            notes: String
            deliveredDate: Date
            * */
            //using the stripe invoice id, update order information. do not finalize any pricing

        },

        updateProductStatus(args: any){},

        addInvoiceItem(args: any) {},

        removeInvoiceItem(args: any) {},


        updateOrderStatus(args: any){},

    },

    /** Resolver Chains **/

    Order: {
        async customer(parent: any, args: any, context: any, info: any) {

            let customerId = await stripe.invoices.retrieve(parent.invoiceID).then((invoice: any) => {return invoice.customer})
            console.log("Retrieving Customer Data: " + customerId)
            const customer: Stripe.Customer | Stripe.DeletedCustomer  = await stripe.customers.retrieve(customerId)

            return {
                customerId:  customer.id,
                name: "name" in customer ? customer.name : undefined,
                email: "email" in customer ? customer.email : undefined,
                phone: "phone" in customer ? customer.email : undefined,
                address: "address" in customer ? customer.address : undefined,
                shipping: "shipping" in customer ? customer.shipping : undefined,
                default_source: "default_source" in customer ? customer.default_source : undefined,
                notes: "description" in customer ? customer.description : undefined
            }
        },
    },
    orderedProducts: {
        //Retrieve the productIDs inside an order for the meals.
        async meals(parent: any) {
            console.log("Retrieving meals from order chain.")
            let meals: any[] = []

            //make an array of meals
            parent.meals.forEach((meal: any) => {
                meals.push({
                    proteinID: meal.proteinID,
                    vegetable: meal.vegetable,
                    carbohydrate: meal.carbohydrate,
                    sauce: meal.sauce,
                    priceID: meal.priceID,
                    status: meal.status
                })
            })
            return meals
        },

        async extras(parent: any) {
            console.log("Retrieving extas from order chain.")
            let extras: any[] = []

            //make an array of extras
            parent.extras.forEach((extra: any) => {
                extras.push({
                    extraID: extra.extraID,
                    status: extra.status,
                })
            })

            return extras
        }
    }
};

module.exports = OrderResolvers;
