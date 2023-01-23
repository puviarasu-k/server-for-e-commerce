const mongoose = require('mongoose')

var productschema = new mongoose.Schema({
    productname: { type: String },
    description: { type: String},
    status : { type: String},
    rejectReason : { type: String},
    totalquantity: { type: Number },
    sellerid: {type : String },
    variant: [{
        variantName: String,
        quantity: Number,
        price: Number,
        varianttype: String
    }]
});


const products = mongoose.model('product', productschema);
module.exports = products


