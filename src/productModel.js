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