const mongoose=require('mongoose')

const sechma = new mongoose.Schema({
    userId:{
        type:String,
    },
    Name: {
        type: String,
    },
    Email: {
        type: String,
    },
    IsVerify:{
       type:Boolean,
    },
    Role:{
        type:String,
    },
    Password:{
        type:String,
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    Carts:[{ProductId:String,ProductPrice:String,ProductQuantity:Number}]
});

const Users = mongoose.model('Users', sechma);
module.exports = Users;
