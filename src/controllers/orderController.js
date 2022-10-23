const mongoose = require("mongoose")
const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
const { isValid } = require("../utilities/validator")

const createOrder = async function (req, res) {
    try {
        let user_id = req.params.user_id
        let reqbody = req.body

        const { cart_id, cancellable, status, ...a } = reqbody
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "Only cart_id is required inside request body" })
        if (cancellable) {
            if (!(cancellable == true || cancellable == false))
                return res.
                    status(400).
                    send({ status: false, message: "cancellable can contain only boolean value" })
        }
        if (status) {
            if (!isValid(status))
                return res.
                    status(400).
                    send({ status: false, message: "status can contain only string value" })
            if (!["pending", "completed", "cancled"].includes(status))
                return res.
                    status(400).
                    send({ status: false, message: 'it can contain only [pending, completed, cancled] values ' })
        }
        if (cart_id) {
            if (!mongoose.isValidObjectId(cart_id))
                return res.
                    status(400).
                    send({ status: false, message: "cart_id is not valid" })
            let result = await cartModel.findById(cart_id).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1, userId: 1 })
            if (result == null)
                return res.
                    status(404).
                    send({ status: false, message: "cart is not exist" })
            if(result.items.length==0)
                return res.
                    status(400).
                        send({status:false,message:"Here is no item in the cart , plz add item in the cart bofore going to order"})
            let a = result.items
            let count = 0
            for (let i = 0; i < a.length; i++) {
                count += a[i].quantity
            }
            let obj = {
                userId: result.userId,
                items: result.items,
                totalPrice: result.totalPrice,
                totalItems: result.totalItems,
                totalQuantity: count,
                cancellable: cancellable ? cancellable : true


            }

            let data = await orderModel.create(obj)

            res.
                status(201).
                send({ status: true, message: "Success", data: data })
            await cartModel.findOne({_id:cart_id}).updateOne({ $set: { items: [], totalPrice: 0, totalItems: 0 } })
        } else {
            return res.
                status(400).
                send({ status: false, message: "provide the cart details in request body" })
        }
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let reqbody = req.body
        let user_id = req.params.userId
        const { orderId, status, ...a } = reqbody
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry inside request body" })
        if (!orderId)
            return res.
                status(400).
                send({ status: false, message: "OrderId is missing" })
        if (!mongoose.isValidObjectId(orderId))
            return res.
                status(400).
                send({ status: false, message: "orderId is not valid" })
        if (!status)
            return res.
                status(400).
                send({ status: false, message: "status is missing that u want to update" })
        if (!isValid(status))
            return res.
                status(400).
                send({ status: false, message: "status can contain only string value" })
        if (!["pending", "completed", "cancled"].includes(status))
            return res.
                status(400).
                send({ status: false, message: 'it can contain only [pending, completed, cancled] values ' })
        let data = await orderModel.findOne({ _id: orderId, cancellable: true }).select({ userId: 1, status: 1 })
        if (data == null)
            return res.
                status(404).
                send({ status: false, message: `this ${orderId} is not exist for updation` })
        if (data.status == "completed")
            return res.
                status(400).
                send({ status: false, message: "U can not updated this , bcz its also present in complete stage" })
        if(data.status=="cancled")
            return res.
                status(400).
                    send({status:false,message:"U can no update the status now bcz items is also in cancel stage"})
        if (user_id != data.userId)
            return res.
                status(400).
                send({ status: false, message: "You can not update this Order" })
        let result = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { returnOriginal: false })
        res.
            status(200).
            send({ status: true, message: "Success", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

module.exports = { createOrder, updateOrder }