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
            let invoiceID;
            //Create invoice on customer in stripe
            try {
                const params: Stripe.InvoiceCreateParams = {
                    customer: args.order.customerID,
                    collection_method: "send_invoice",
                }

                const invoice: Stripe.Invoice = await stripe.invoices.create(params)
                let invoiceID = invoice.id

                console.log("Created invoice: " + invoiceID)
            }
            catch (err) {
                console.log("Error creating invoice: " + err)
            }

            /*//add line items to the invoice
            try {
                for (let item in args.order.products.meals) {
                    const priceParams: Stripe.PriceListParams = {
                        product: item.proteinID,
                        limit: 1,
                    }

                    let price = await stripe.prices.list(priceParams)

                    const invoiceItemParams: Stripe.InvoiceItemCreateParams = {
                        customer: args.order.customer.id,
                        currency: "us",
                        invoice: invoiceID,
                        quantity: 1,
                        price: price.data[0].id,
                    }

                    const invoiceItem: Stripe.InvoiceItem = await stripe.invoiceItems.create(invoiceItemParams);

                    console.log("Adding line_item to invoice: " + invoiceItem.id)
                }
            }
            catch (err) {
                return "Error adding invoice item: " + err
            }*/



            //TODO: This model is not complete. This will crash as it does not match the schema...
            //Create Mongoose Model
           /* try {
                await orderModel.create({
                    /!*customer: {
                        name: args.order.customer.name,
                        phone: args.order.customer.phone,
                        address: {
                            city: args.order.customer.address.city,
                            line1: args.order.customer.address.line1,
                            line2: args.order.customer.address.line2,
                            postal: args.order.customer.address.postal,
                            state: args.order.customer.address.state,
                        }
                    },*!/
/!*
                    status: "Unmade",
                    total: total,
                    coupon: args.order.coupon,
                    notes: args.order.notes,
                    meals: {...args.order.meals},
                    deliveryDate: args.order.deliveryDate.toDateString()*!/

                })
            } catch (err) {
                return "Error pushing meal to MongoDB: " + err;
            }*/

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
        }
    }
};

module.exports = OrderResolvers;
