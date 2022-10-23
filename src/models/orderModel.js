const mongoose=require("mongoose")
const objectId=mongoose.Schema.Types.ObjectId

const orderModel=new mongoose.Schema({
    userId:{
        type:objectId,
        ref:"User",
        require:true
    },
    items:[{
        productId:{
            type:objectId,
            ref:"Product",
            require:true
        },
        quantity:{
            type:Number,
            require:true
        },
        productImge:{
            type:String
        },
        title:{
            type:String
        }
    }],
    totalPrice:{
        type:Number,
        require:[true,"Holds total price of all the items in the cart"]
    },
    totalItems:{
        type:Number,
        require:[true,"Holds total number of items in the cart"]
    },
    totalQuantity:{
        type:Number,
        require:[true,"Holds total number of quantity in the cart"]
    },
    cancellable:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        default:"pending",
        enum:["pending", "completed", "cancled"]
    },
    deletedAt: {
        type: Date,
        default: null
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    },
},{timestamps:true})


module.exports=mongoose.model("Order",orderModel)