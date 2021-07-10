/**
 * This is the mongoose model for any and all products in the webapp. The productSchema is used as a root for all
 * products, while the tagsSchema includes any metadata for specific products. This includes better data for searching
 * for any products. IE colors and flowers for bouquets, size and occasion for teddy bears, color and occasion for
 * balloons, etc.
 *
 * NOTE: The tagsSchema needs to be initiated BEFORE the root productSchema.
 * */

const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
    size: 'string',
    colors: ['string'],
    occasions: ['string'],
    flowers: ['string'],
});

const productSchema = new mongoose.Schema({
    productID: 'string',
    title: 'string',
    price: 'number',
    priceID: 'string',
    priceURL: 'string',
    photoURL: 'string',
    description: 'string',
    tags: tagsSchema
});

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel ;