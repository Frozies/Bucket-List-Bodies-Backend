
import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import _, {forEach, map, update} from "lodash";
const orderModel = require('../models/OrderModel');
const customerModel = require('../models/CustomerModel')



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

            /**Add each line item to the invoice
             * For each item in products (meals or extras) create a stripe parameter, push to stripe, and add the
             * invoiceItemIDs that are returned from stripe to an array. then calculate the price out for later.
             */
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
                        price: extra.extraPriceID,
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
                throw new Error("Error creating invoice item: " + err);
            }

            /**
             * Create invoice on customer in stripe using the customer ID as params.
             */

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
            /**Create Mongoose Model
             * First create an object of all of the meals/extras with a new property 'status'. Then create a order model
             * to push to the Database. note the spreading of the objects in the products object.
             */

            try {
                //insert status into each product

                let meals = () => {
                    for(let meal in args.order.products.meals) {
                        return {
                            proteinID: args.order.products.meals[meal].proteinID,
                            priceID: args.order.products.meals[meal].priceID,
                            vegetable: args.order.products.meals[meal].vegetable,
                            carbohydrate: args.order.products.meals[meal].carbohydrate,
                            sauce: args.order.products.meals[meal].sauce,
                            status: 'UNMADE',
                        }
                    }
                }
                let extras = () => {
                    for(let extra in args.order.products.extras) {
                        return {
                            extraID: args.order.products.extras[extra].extraID,
                            extraPriceID: args.order.products.extras[extra].extraPriceID,
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
                    pretaxPrice: totalUnitAmount/100,
                    coupon: args.order.coupon,
                    notes: args.order.notes,
                    deliveryDate: args.order.deliveryDate,
                    creationDate: new Date(),
                })
            } catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }


            console.log("Adding order to Customer's order ledger.")
            /**
             * Add order to customer ledger.
             * This simply takes the invoiceID and pushes it to the customer database for the specified customer by its
             * ID.
             */
            try {
                await customerModel.findOneAndUpdate({id: args.order.customerID}, {
                    $push: {
                        orders: invoiceID
                    }
                })
            }
            catch (err) {
                console.log("Error adding order to customer ledger: " + err);
                throw new Error("Error adding order to customer ledger: " + err);
            }

            //retrieve the newly updated order and return that to the client.
            return orderModel.findOne({invoiceID: invoiceID})
        },

        async updateOrder(parent: any, args: any,) {
            //using the stripe invoice id, update order information. do not finalize any pricing

            const invoiceID = args.order.invoiceID;
            let updatedOrder;

            console.log("Updating an order: " + invoiceID)

            //update coupon if updated in stripe
            try {
                const params: Stripe.InvoiceUpdateParams = {
                    description: args.order.description ? args.order.description : undefined,
                    //todo: Discount
                }

                const invoice = stripe.invoices.update(invoiceID, params)
            }
            catch (err) {
                console.log("Error updating stripe invoice: " + err);
                throw new Error("Error updating stripe invoice: " + err);
            }

            //update order in database
            try {
                const filter = {
                    invoiceID: args.order.invoiceID
                }

                const update = {
                    status: args.order.status ? args.order.status : undefined,
                    coupon: args.order.coupon ? args.order.coupon : undefined,
                    notes: args.order.notes ? args.order.notes : undefined,
                    deliveredDate: args.order.deliveredDate ? args.order.deliveredDate : undefined,
                }

                await orderModel.updateOne(filter, _.pickBy(update, (param: any) => {
                    if (param !== undefined) return param
                }))

                updatedOrder = orderModel.findOne(filter)
            }
            catch (err) {
                console.log("Error updating database invoice: " + err);
                throw new Error("Error updating database invoice: " + err);
            }

            return updatedOrder;
        },

        async addOrderLineItems(parent: any, args: any) {
            let invoiceItemIDs: Array<string> = [];
            let totalUnitAmount = 0;
            const invoiceID = args.order.invoiceID;

            //Iterate through the line items using some sort of generic....
            /**Add each line item to the invoice
             * For each item in products (meals or extras) create a stripe parameter, push to stripe, and add the
             * invoiceItemIDs that are returned from stripe to an array. then calculate the price out for later.
             */
            try {
                for (const meal of args.order.products.meals) {
                    const params: Stripe.InvoiceItemCreateParams = {
                        invoice: invoiceID,
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
                        invoice: invoiceID,
                        customer: args.order.customerID,
                        price: extra.extraPriceID,
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
                throw new Error("Error creating invoice item: " + err);
            }
            
            console.log("Sending order to DB")
            /**Update Mongoose Model
             * First create an object of all of the meals/extras with a new property 'status'. Then add the new products
             * to the model provided.
             */
            try {
                let newMeals: any = [];
                let newExtras: any = [];
                let pretaxPrice = 0;

                //Push old products into a temporary array
                await orderModel.findOne({invoiceID: invoiceID}, (err: any, doc: any)=>{

                    pretaxPrice = doc.pretaxPrice

                    doc.products.meals.forEach((doc: any)=> {
                        newMeals.push({
                            proteinID: doc.proteinID,
                            priceID: doc.priceID,
                            vegetable: doc.vegetable,
                            carbohydrate: doc.carbohydrate,
                            sauce: doc.sauce,
                            status: doc.status
                        })
                    });

                    doc.products.extras.forEach((doc: any)=> {
                        newExtras.push({
                            extraID: doc.extraID,
                            extraPriceID: doc.extraPriceID,
                            status: doc.status
                        })
                    });

                    doc.invoiceItemIDs.forEach((doc: any)=> {
                        invoiceItemIDs.push(doc)
                    });
                })

                //push new products into the temporary array
                for(let meal in args.order.products.meals) {
                    const priceID = args.order.products.meals[meal].priceID
                    newMeals.push(
                        {
                            proteinID: args.order.products.meals[meal].proteinID,
                            priceID: priceID,
                            vegetable: args.order.products.meals[meal].vegetable,
                            carbohydrate: args.order.products.meals[meal].carbohydrate,
                            sauce: args.order.products.meals[meal].sauce,
                            status: 'UNMADE',
                        }
                    )
                    const price = await stripe.prices.retrieve( priceID )
                    pretaxPrice += price.unit_amount ? (price.unit_amount/100) : 0;
                }

                for(let extra in args.order.products.extras) {
                    const priceID = args.order.products.extras[extra].extraPriceID;
                    newExtras.push(
                        {
                            extraID: args.order.products.extras[extra].extraID,
                            extraPriceID: priceID,
                            status: 'UNMADE',
                        }
                    )

                    const price = await stripe.prices.retrieve( priceID )
                    pretaxPrice += price.unit_amount ? (price.unit_amount/100) : 0;
                }

                console.table(newMeals)
                console.table(invoiceItemIDs)
                
                const order = await orderModel.findOneAndUpdate({invoiceID: invoiceID}, {
                    products: {
                        meals: newMeals,
                        extras: newExtras
                    },
                    invoiceItemIDs: invoiceItemIDs,
                    pretaxPrice: pretaxPrice
                })


            } catch (err) {
                console.log("Error pushing meal to MongoDB: " + err);
                throw new Error("Error pushing meal to MongoDB: " + err);
            }

            return orderModel.findOne({invoiceID: invoiceID})
        },
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
