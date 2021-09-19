
import {stripe} from "../utility/stripe";
import {Stripe} from "stripe";
import _, {forEach} from "lodash";
const orderModel = require('../models/OrderModel');
const customerModel = require('../models/CustomerModel')


/**Add each line item to the invoice
 * For each item in products (meals or extras) create a stripe parameter, push to stripe, and add the
 * invoiceItemIDs that are returned from stripe to an array. then calculate the price out for later.
 */
let createMeals = async (inputMeals: any, inputCustomerID: string, invoiceID: string | undefined = undefined) => {
    let meals: any = [];
    let total: number = 0;

    try {
        for (let meal in inputMeals) {
            const params: Stripe.InvoiceItemCreateParams = {
                customer: inputCustomerID,
                price: inputMeals[meal].priceID,
                quantity: 1,
                invoice: invoiceID ? invoiceID : undefined
            }

            const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create( params );
            console.log( "Adding invoice item Meal to invoice: " + invoiceItem.id )
            console.log( "Price: " + <number>invoiceItem.price?.unit_amount )
            total += <number>invoiceItem.price?.unit_amount;

            meals.push({
                productID: inputMeals[meal].productID,
                priceID: inputMeals[meal].priceID,
                invoiceItemID: invoiceItem.id,
                vegetable: inputMeals[meal].vegetable,
                carbohydrate: inputMeals[meal].carbohydrate,
                sauce: inputMeals[meal].sauce,
                status: 'UNMADE',
            })
        }
    }
    catch (err) {
        console.log("Error creating meal invoice item: " + err);
        throw new Error("Error creating meal invoice item: " + err);
    }



    return {meals, total};
}

let createExtras = async (inputExtras: any, inputCustomerID: string, invoiceID: string | undefined = undefined) => {
    let extras: any = [];
    let total: number = 0;

    try {
        for (let extra in inputExtras) {
            const params: Stripe.InvoiceItemCreateParams = {
                customer: inputCustomerID,
                price: inputExtras[extra].priceID,
                quantity: 1,
                invoice: invoiceID ? invoiceID : undefined
            }

            const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create( params );
            console.log( "Adding invoice item Extra to invoice: " + invoiceItem.id )
            console.log( "Price: " + <number>invoiceItem.price?.unit_amount )
            total += <number>invoiceItem.price?.unit_amount;

            extras.push({
                productID: inputExtras[extra].productID,
                priceID: inputExtras[extra].priceID,
                invoiceItemID: invoiceItem.id,
                status: 'UNMADE',
            })
        }
    }
    catch (err) {
        console.log("Error creating extra invoice item: " + err);
        throw new Error("Error creating extra invoice item: " + err);
    }

    return {extras, total}
}

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

            let totalUnitAmount = 0;
            let invoiceID: any;

            let meals = await createMeals(args.order.products.meals, args.order.customerID);
            let extras = await createExtras(args.order.products.extras, args.order.customerID);

            totalUnitAmount = meals.total + extras.total;

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
                console.log("Error creating invoice: " + err);
                throw new Error("Error creating invoice: " + err);
            }

            console.log("Sending order to DB")
            /**Create Mongoose Model
             * First create an object of all of the meals/extras with a new property 'status'. Then create a order model
             * to push to the Database. note the spreading of the objects in the products object.
             */

            try {

                const order = await orderModel.create({
                    invoiceID: invoiceID,
                    customerId: args.order.customerID,

                    products: {
                        meals: meals.meals,
                        extras: extras.extras
                    },

                    status: "UNMADE",
                    pretaxPrice: totalUnitAmount/100,
                    coupon: args.order.coupon,
                    notes: args.order.notes,
                    deliveryDate: args.order.deliveryDate,
                    creationDate: new Date(),
                })
            } catch (err) {
                console.log("Error pushing meal to MongoDB: " + err);
                throw new Error("Error pushing meal to MongoDB: " + err);
            }


            /**
             * Add order to customer ledger.
             * This simply takes the invoiceID and pushes it to the customer database for the specified customer by its
             * ID.
             */
            try {
                console.log("Adding order to Customer's order ledger.")
                await customerModel.findOneAndUpdate(
                    {customerId: args.order.customerID},
                    {
                        $push: {
                            orders: invoiceID
                        }
                    });
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
            const invoiceID = args.order.invoiceID;

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
                            productID: doc.productID,
                            priceID: doc.priceID,
                            invoiceItemID: doc.invoiceItemID,
                            vegetable: doc.vegetable,
                            carbohydrate: doc.carbohydrate,
                            sauce: doc.sauce,
                            status: doc.status
                        })
                    });

                    doc.products.extras.forEach((doc: any)=> {
                        newExtras.push({
                            productID: doc.productID,
                            invoiceItemID: doc.invoiceItemID,
                            priceID: doc.priceID,
                            status: doc.status
                        })
                    });
                })

                console.log("OLD PRODUCTS")
                console.table(newMeals)
                console.table(newExtras)

                let meals = await createMeals(args.order.products.meals, args.order.customerID, invoiceID);
                newMeals.push(
                    ...meals.meals
                )
                pretaxPrice += meals.total / 100

                let extras = await createExtras(args.order.products.extras, args.order.customerID, invoiceID);
                newExtras.push(
                    ...extras.extras
                )
                pretaxPrice += extras.total / 100

                console.log("NEW PRODUCTS")
                console.table(meals.meals)
                console.table(extras.extras)

                console.log("ALL PRODUCTS")
                console.table(newMeals)
                console.table(newExtras)


                const order = await orderModel.findOneAndUpdate({invoiceID: invoiceID}, {
                    products: {
                        meals: newMeals,
                        extras: newExtras
                    },
                    pretaxPrice: pretaxPrice
                })


            } catch (err) {
                console.log("Error pushing meal to MongoDB: " + err);
                throw new Error("Error pushing meal to MongoDB: " + err);
            }

            return orderModel.findOne({invoiceID: invoiceID})
        },

        async updateOrderLineItems(parent: any, args: any) {
            const filter = {invoiceID: args.order.invoiceID}
            //change meal veggy, carb, sauce, status & change extra status

            //update meals in db
            try {
                let update: any = [];

                for(let meal in args.order.products.meals) {
                    let item = {
                        invoiceItemID: args.order.products.meals[meal].invoiceItemID,
                        priceID: args.order.products.meals[meal].priceID,
                        productID: args.order.products.meals[meal].productID,
                        vegetable: args.order.products.meals[meal].vegetable ? args.order.products.meals[meal].vegetable : undefined,
                        carbohydrate: args.order.products.meals[meal].carbohydrate ? args.order.products.meals[meal].carbohydrate : undefined,
                        sauce: args.order.products.meals[meal].sauce ? args.order.products.meals[meal].sauce : undefined,
                        status: args.order.products.meals[meal].status ? args.order.products.meals[meal].status : undefined,
                    }
                    update.push(item)
                }

                for(let extra in args.order.products.extras) {
                    let item = {
                        productID: args.order.products.extras[extra].productID,
                        priceID: args.order.products.extras[extra].priceID,
                        invoiceItemID: args.order.products.extras[extra].invoiceItemID,
                        status: args.order.products.extras[extra].status ? args.order.products.extras[extra].status : undefined,
                    }
                    update.push(item)
                }

                console.log('UPDATE: ')
                console.table(update)

                const order = orderModel.findOne(filter, (err: any, doc: any) => {
                    if (err) {
                        console.log("Error finding order: " + err);
                        throw new Error("Error finding order: " + err);
                    }
                    if (doc) {
                        console.log("DOC: ")
                        console.log(doc._doc.products.meals)

                        
                    }
                })

            }
            catch (err) {
                console.log("Error updating line items: " + err);
                throw new Error("Error updating line items: " + err);
            }

            return orderModel.findOne(filter)
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
                    productID: meal.productID,
                    vegetable: meal.vegetable,
                    carbohydrate: meal.carbohydrate,
                    sauce: meal.sauce,
                    priceID: meal.priceID,
                    invoiceItemID: meal.invoiceItemID,
                    status: meal.status
                })
            })
            return meals
        },

        async extras(parent: any) {
            console.log("Retrieving extras from order chain.")
            let extras: any[] = []

            //make an array of extras
            parent.extras.forEach((extra: any) => {
                extras.push({
                    invoiceItemID: extra.invoiceItemID,
                    priceID: extra.priceID,
                    productID: extra.productID,
                    status: extra.status,
                })
            })

            return extras
        }
    }
};

module.exports = OrderResolvers;
