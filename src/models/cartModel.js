const mongoose=require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId

const createCart=new mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:"User",
        require:true,
        unique:true
    },
    items:[{
        productId: {
            type:ObjectId, 
            ref:"Product",
            require:true
        },
        quantity:{
            type:Number,
            require:true,
            min:1
        },
        productImage:{
            type:String
        },
        title:{
            type:String
        }
    }],
    totalPrice:{
       type: Number, 
       require:[true, "Holds total price of all the items in the cart"]
    },
    totalItems:{
        type:Number,
        require:[true, "Holds total number of items in the cart"]
    }
},{timestamps:true})



module.exports=mongoose.model("Cart",createCart)