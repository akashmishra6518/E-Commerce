const mongoose = require("mongoose")
const aws = require("../utilities/aws")
const productModel = require("../models/productModel")
const {isValidInputBody,isValidInputValue, isValidStreet, isValidPrice, isValidAddress, isValidInstallments, isValidProfile } = require("../utilities/validator")

const createProduct = async function (req, res) {
    try {

        let reqbody = req.body
        let files = req.files

        if (Object.keys(reqbody).length == 0)
            return res.
                status(400).
                send({ status: false, message: "Data is required inside request body" })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, ...a } = reqbody

        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry inside the request body" })

        if (!title)
            return res.
                status(400).
                send({ status: false, message: "title is required" })

        if (!isValidStreet(title))
            return res.
                status(400).
                send({ status: false, message: "title is not valid" })

        if (!description)
            return res.
                status(400).
                send({ status: false, message: "description is required" })

        if (!isValidStreet(description))
            return res.
                status(400).
                send({ status: false, message: "description is not valid" })

        if (!price)
            return res.
                status(400).
                send({ status: false, message: "price is required" })

        if (!isValidPrice(price))
            return res.
                status(400).
                send({ status: false, message: "price is not valid" })

        if (currencyId) {
            if (currencyId != "INR")
                return res.
                    status(400).
                    send({ status: false, message: "currencyId must be INR" })
        }

        if (currencyFormat) {
            if (currencyFormat != 'Rs')
                return res.
                    status(400).
                    send({ status: false, message: "currencyformate must be 'Rs' formate" })
        }
        if (isFreeShipping) {
            if (!(isFreeShipping ==false.toString() || isFreeShipping == true.toString()))
                return res.
                    status(400).
                    send({ status: false, message: "isfreeshipping contain only boolean value" })
        }
        if (files && files.length > 0) {
            req.link = await aws.uploadFile(files[0])
        } else
            return res.
                status(400).
                send({ status: false, message: "profile image is required" })
        if (!isValidProfile(files[0].originalname))
            return res.
                status(400).
                send({ status: false, msg: "plz provide profileImage in (jpg|png|jpeg) formate" })
        if (!style)
            return res.
                status(400).
                send({ status: false, message: "style is missing" })

        if (!isValidStreet(style))
            return res.
                status(400).
                send({ status: false, message: "style is invalid" })

        if (!availableSizes)
            return res.
                status(400).
                send({ status: false, message: "availableSizes is missing" })
        if (!isValidStreet(availableSizes))
            availableSizes = JSON.parse(availableSizes)
        if (!isValidAddress((availableSizes)))
            return res.
                status(400).
                send({ status: false, message: "availabelSizes contains Array of String value" })

        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i = 0; i < availableSizes.length; i++) {
            if (availableSizes[i] == ",")
                continue
            else {
                if (!arr.includes(availableSizes[i]))
                    return res.
                        status(400).
                        send({ status: false, message: `availableSizes can contain only these value [${arr}]` })
            }
        }

        if (!installments)
            return res.
                status(400).
                send({ status: false, message: "installments is missing" })

        if (!isValidInstallments(installments))
            return res.
                status(400).
                send({ status: false, message: "installment is not valid" })

        let data = await productModel.findOne({ title: title })
        if (data != null)
            return res.
                status(409).
                send({ status: false, message: "this title is already present" })

        let obj = {
            title: reqbody.title,
            description: description,
            price: price,
            currencyId: reqbody.currencyId ? currencyId : "INR",
            currencyFormat: reqbody.currencyFormat ? currencyFormat : "rs",
            isFreeShipping: isFreeShipping ? isFreeShipping : false,
            productImage: req.link,
            style: style,
            availableSizes: availableSizes,
            installments: installments
        }
        let result = await productModel.create(obj)
        res.
            status(201).
            send({ status: true, message: "Success", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const getProductDetails = async function (req, res) {
    try {
        let reqquery = req.query
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];

        let { size, name, priceGreaterThan, priceLessThan, priceSort } = reqquery

        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1))
                return res.
                    status(400).
                    send({ status: false, message: "pricesort can contain only 1 0r -1" })
        }

        if (size) {

            let sizeArr = size.replace(/\s+/g, "").split(",").map(String);

            var uniqueSize = sizeArr.filter(function (item, i, ar) {
                return ar.indexOf(item) === i;
            });
            for (let i = 0; i < uniqueSize.length; i++) {
                if (!arr.includes(uniqueSize[i]))
                    return res.status(400).send({
                        status: false,
                        data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
                    });
            }
        }

        if (name) {
            if (!isValidName(name))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the name in valid formate" })
        } else
            name = ""

        if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the priceGratterThen in valid formate" })
        } else
            priceGreaterThan = 0

        if (priceLessThan) {
            if (!isValidPrice(priceLessThan))
                return res.
                    status(400).
                    send({ status: false, message: "plz give the priceLowerThen in the valid formate" })
        } else
            priceLessThan = 2 ** 32 - 1

        if (size != undefined) {
            let result = await productModel.find({ "title": { $regex: `${name}` }, "price": { "$gte": `${priceGreaterThan}`, "$lte": `${priceLessThan}` }, "availableSizes": { $in: `${size}` }, isDeleted: false })
            if (priceSort == 1)
                result.sort((a, b) => (a.price) - (b.price))
            else if (priceSort == -1)
                result.sort((a, b) => (b.price) - (a.price))
            return res.
                status(200).
                send({ status: true, data: result })
        } else {
            let result = await productModel.find({ "title": { $regex: `${name}` }, "price": { "$gte": `${priceGreaterThan}`, "$lte": `${priceLessThan}` }, isDeleted: false })
            if (priceSort == 1)
                result.sort((a, b) => (a.price) - (b.price))
            else if (priceSort == -1)
                result.sort((a, b) => (b.price) - (a.price))
            return res.
                status(200).
                send({ status: true,message:"Success", data: result })
        }
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const getProductById = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!productId) {
            return res.
                status(400).
                send({ status: false, message: "please give productId in requesst params" })
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.
                status(400).
                send({ status: false, message: "please enter productId in valid format" })
        }
        let findData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findData) {
            return res.
                status(404).
                send({ status: false, message: `product not found by this [${productId}] productId` })
        }
        return res.
            status(200).
            send({ status: true, message: "Success", data: findData })

    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const updateProductDetails = async function (req, res) {
    try {
        const queryParams = req.query;
        const requestBody = req.body;
        const productId = req.params.productId;
        const image = req.files;

        // no data is required from query params
        if (isValidInputBody(queryParams)) {
            return res
                .status(404)
                .send({ status: false, message: "Page not found" });
        }
        // checking product exist with product ID
        const productByProductId = await productModel.findOne({
            _id: productId,
            isDeleted: false,
            deletedAt: null,
        });

        if (!productByProductId) {
            return res
                .status(404)
                .send({ status: false, message: "No product found by product id" });
        }

        if (!isValidInputBody(requestBody) && typeof image === undefined) {
            return res
                .status(400)
                .send({ status: false, message: "Update related product data required" });
        }

        let { title, description, price, isFreeShipping, style, availableSizes, installments, } = requestBody;

        // creating an empty object 
        const updates = { $set: {} };


        // if request body has key name "title" then after validating its value, same is added to updates object
        if (title) {
            if (!isValidInputValue(title)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid title" });
            }

            const notUniqueTitle = await productModel.findOne({
                title: title,
            });

            if (notUniqueTitle) {
                return res
                    .status(400)
                    .send({ status: false, message: "Product title already exist" });
            }

            updates["$set"]["title"] = title.trim();
        }
        // if request body has key name "description" then after validating its value, same is added to updates object
        if (description) {
            if (!isValidInputValue(description)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid description" });
            }
            updates["$set"]["description"] = description.trim();
        }

        // if request body has key name "price" then after validating its value, same is added to updates object
        if (price) {
            if (!isValidPrice(price)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid price" });
            }
            updates["$set"]["price"] = price;
        }

        // if request body has key name "isFreeShipping" then after validating its value, same is added to updates object
        if (isFreeShipping) {
            if (["true", "false"].includes(isFreeShipping) === false) {
                return res
                    .status(400)
                    .send({ status: false, message: "isFreeShipping should be boolean" });
            }
            updates["$set"]["isFreeShipping"] = isFreeShipping;
        }

        // if request body has key name "style" then after validating its value, same is added to updates object
        if (style) {
            if (!isValidInputValue(style)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid style" });
            }
            updates["$set"]["style"] = style;
        }

        // if request body has key name "availableSizes" then after validating its value, same is added to updates object

        if (availableSizes) {

            if (!isValidInputValue(availableSizes)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid format of availableSizes" });
            }

            availableSizes = JSON.parse(availableSizes);

            if (Array.isArray(availableSizes) && availableSizes.length > 0) {
                for (let i = 0; i < availableSizes.length; i++) {
                    const element = availableSizes[i];

                    if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(element)) {
                        return res
                            .status(400)
                            .send({ status: false, message: `available sizes should be from:  S, XS, M, X, L, XXL, XL` });
                    }
                }

                updates["$set"]["availableSizes"] = availableSizes;
            } else {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid available Sizes" });
            }
        }

        // if request body has key name "installments" then after validating its value, same is added to updates object

        if (installments) {
            if (!isValidNumber(installments)) {
                return res
                    .status(400)
                    .send({ status: false, message: "invalid installments" });
            }
            updates["$set"]["installments"] = Number(installments);
        }

        // if request body has key name "image" then after validating its value, same is added to updates object

        if (typeof image !== undefined) {
            if (image && image.length > 0) {
                if (!isValidImageType(image[0].mimetype)) {
                    return res
                        .status(400)
                        .send({ status: false, message: "Only images can be uploaded (jpeg/jpg/png)" });
                }

                const productImageUrl = await AWS.uploadFile(image[0]);
                updates["$set"]["productImage"] = productImageUrl;
            }
        }

        if (Object.keys(updates["$set"]).length === 0) {
            return res.json("nothing is updated");
        }

        // updating product data of given ID by passing updates object

        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updates, { new: true });

        res
            .status(200)
            .send({ status: true, message: "Product data updated successfully", data: updatedProduct });

    } catch (error) {

        res.status(500).send({ error: error.message });

    }
};

const deleteProductById = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!productId) {
            return res.
                status(400).
                send({ status: false, message: "please give productId in requesst params" })
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.
                status(400).
                send({ status: false, message: "please enter productId in valid format" })
        }
        let findData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() },{ returnOriginal: false })
        if (!findData) {
            return res.
                status(200).
                send({ status: true, message: `product not found by this [${productId}] productId` })
        }
        return res.
            status(200).
            send({ status: false, message: "data deleted successfully" ,data:findData})

    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

module.exports = { createProduct, getProductDetails, getProductById, deleteProductById, updateProductDetails }