const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const { isValidRemoveProduct } = require("../utilities/validator")

const createCart = async function (req, res) {
    try {
        let user_id = req.params.userId
        let reqbody = req.body
        const { cartId, productId, ...a } = reqbody
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid request in requestBody" })
        if (productId) {
            if (!mongoose.isValidObjectId(productId))
                return res.
                    status(400).
                    send({ status: false, message: "productId is not valid" })
            let data = await productModel.findOne({ _id: productId, isDeleted: false })
            if (data == null)
                return res.
                    status(404).
                    send({ status: false, message: "product is not exist" })
        }
        if (cartId) {
            if (!mongoose.isValidObjectId(cartId))
                return res.
                    status(400).
                    send({ status: false, message: "cart_id is not valid" })
            let data = await cartModel.findOne({ _id: cartId })
            if (data == null)
                return res.
                    status(400).
                    send({ status: false, message: "cart is not exist" })
        }

        if (cartId == "undefined" || !cartId) {

            let result = await cartModel.findOne({ userId: user_id })

            if (result == null) {

                if (productId == "undefined" || !productId) {

                    let obj = new Object()
                    obj.userId = user_id
                    obj.totalPrice = 0
                    obj.totalItems = 0
                    let data = await cartModel.create(obj)
                    return res.
                        status(201).
                        send({ status: true, message: "Success", data: data })
                } else {

                    let obj = new Object()
                    let price = await productModel.findById(productId).select({ _id: 0, price: 1, productImage: 1, title: 1 })
                    let total = price.price
                    obj.userId = user_id
                    let d = {}
                    d.productId = productId
                    d.quantity = 1
                    d.productImage = price.productImage
                    d.title = price.title
                    obj.items = d
                    obj.totalPrice = total
                    obj.totalItems = 1
                    let data = await cartModel.create(obj)
                    return res.
                        status(201).
                        send({ status: true, message: "Success", data: data })
                }
            } else {

                if (productId == "undefined" || !productId) {
                    let result = await cartModel.find({ userId: user_id })
                    return res.
                        status(201).
                        send({ status: true, message: "Success", data: result })
                }
                let flag = false
                let total = await productModel.findById(productId).select({ _id: 0, price: 1, productImage: 1, title: 1 })
                let data = await cartModel.findOne({ userId: user_id }).select({ _id: 0, items: 1, totalPrice: 1 })
                let a = data.items
                let price = data.totalPrice
                for (let i = 0; i < a.length; i++) {
                    if (a[i].productId == productId) {
                        a[i].quantity++
                        price += total.price
                        flag = true
                    }
                }
                if (flag == false) {
                    let d = {}
                    d.productId = productId
                    d.quantity = 1
                    d.productImage = total.productImage
                    d.title = total.title
                    a.push(d)
                    price += total.price
                }
                let result = await cartModel.findOneAndUpdate({ userId: user_id }, { $set: { items: a, totalPrice: price, totalItems: a.length } }, { returnOriginal: false })
                return res.
                    status(201).
                    send({ status: true, message: "Success", data: result })
            }
        } else {

            let c = await cartModel.findById(cartId).select({ _id: 0, userId: 1 })
            if (c.userId != user_id)
                return res.
                    status(400).
                    send({ status: false, message: "You can not Add the product in this cart" })
            if (productId == undefined || !productId)
                return res.
                    status(400).
                    send({ status: false, message: "productID is missing for adding into the cart" })
            let flag = false
            let total = await productModel.findById(productId).select({ _id: 0, price: 1, productImage: 1, title: 1 })
            let data = await cartModel.findOne({ _id: cartId }).select({ _id: 0, items: 1, totalPrice: 1 })
            let a = data.items
            let price = data.totalPrice
            for (let i = 0; i < a.length; i++) {
                if (a[i].productId == productId) {
                    a[i].quantity++
                    price += total.price
                    flag = true
                }
            }
            if (flag == false) {
                let d = {}
                d.productId = productId
                d.quantity = 1
                d.productImage = total.productImage
                d.title = total.title
                a.push(d)
                price += total.price
            }
            let result = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { items: a, totalPrice: price, totalItems: a.length } }, { returnOriginal: false })
            return res.
                status(201).
                send({ status: true, message: "Success", data: result })
        }
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const updateCart = async function (req, res) {
    try {

        let user_id = req.params.userId
        let reqbody = req.body
        const { cartId, productId, removeProduct, ...a } = reqbody
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry inside request body" })
        if (!removeProduct)
            return res.
                status(400).
                send({ status: false, message: "removeProduct is missing" })
        if (!isValidRemoveProduct(removeProduct))
            return res.
                status(400).
                send({ status: false, message: "removeProduct can contain values  between 0-1 only" })
        if (productId) {
            if (!mongoose.isValidObjectId(productId))
                return res.
                    status(400).
                    send({ status: false, message: "productid is not valid" })
            let result = await productModel.findOne({ _id: productId, isDeleted: false })
            if (result == null)
                return res.
                    status(400).
                    send({ status: false, message: "product is not exist" })

        }
        if (cartId) {
            if (!mongoose.isValidObjectId(cartId))
                return res.
                    status(400).
                    send({ status: false, message: "cart_id is not valid" })
            let data = await cartModel.findById(cartId).select({ _id: 1, items: 1, totalPrice: 1, totalItems: 1, userId: 1 })
            let total = await productModel.findById(productId).select({ _id: 0, price: 1 })
            
            if (data == null)
                return res.
                    status(400).
                    send({ status: false, message: "cart is not exist" })
            
            if (productId == "undefined" || !productId)
                return res.
                    status(400).
                    send({ status: false, message: "provide the productId , on which product u want to update" })
            
            if(user_id!=data.userId)
                return res.
                    status(403).
                        send({status:false,message:"You are not Authorised for updating this cart"})
            let a = data.items
            let price = data.totalPrice
            let flag = false, inside = true
            for (let i = 0; i < a.length; i++) {
                inside = false
                if (a[i].productId == productId) {
                    if (removeProduct == 1) {
                        a[i].quantity--
                        price -= total.price
                        flag = true
                        if (a[i].quantity == 0)
                            a.splice(i, 1)

                    } else {
                        let count = a[i].quantity
                        a.splice(i, 1)
                        price -= (total.price) * count
                        flag = true
                    }
                }
            }
            if (flag == false && inside == false)
                return res.
                    status(400).
                    send({ status: false, message: "This product is not in your Cart", data: data })
            if (inside == true)
                return res.
                    status(400).
                    send({ status: false, message: "Cart is not containging any product", data: data })
            let result1 = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { items: a, totalPrice: price, totalItems: a.length } }, { returnOriginal: false })
            return res.
                status(200).
                send({ status: true, message: "Success", data: result1 })
        } else
            return res.
                status(400).
                send({ status: false, message: "Cart_id is required" })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const getCartDeatils = async function (req, res) {
    try {
        let user_id = req.params.userId
        if (!mongoose.isValidObjectId(user_id))
            return res.
                status(400).
                send({ status: false, message: "id is not valid" })
        let data = await userModel.findById(user_id)
        if (!data)
            return res.
                status(404).
                send({ status: false, message: `${user_id} this User does not exist` })
        let result = await cartModel.findOne({ userId: user_id })
        if (!result)
            return res.
                status(404).
                send({ status: false, message: `cart does not exist for this ${user_id} user` })
        res.
            status(200).
            send({ status: true, message: "Success", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const delCart = async function (req, res) {
    try {
        let user_id = req.params.userId
        let a = []
        if (!mongoose.isValidObjectId(user_id))
            return res.
                status(400).
                send({ status: false, message: `${user_id} is not valid` })
        let result = await cartModel.findOne({ userId: user_id })
        if (!result)
            return res.
                status(404).
                send({ status: false, message: `cart is not  exist for this ${user_id} user` })
        let data = await cartModel.findOneAndUpdate({ userId: user_id }, { $set: { items: a, totalPrice: 0, totalItems: 0 } }, { returnOriginal: false })
        res.
            status(204).
            send({ status: true, message: "Cart deleted Successfully", data: data })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

module.exports = { createCart, getCartDeatils, delCart, updateCart }