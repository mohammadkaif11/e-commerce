const mongoose=require('mongoose')

const sechma = new mongoose.Schema({
    ProductName:String,
    ProductPrice:String,
    ProductDescription:String,
    ImageUrl:String,
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
});

const Products = mongoose.model('Products', sechma);
module.exports = Products;
