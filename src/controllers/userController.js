const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const aws = require("../utilities/aws")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { isValidEmail, isValidProfile, isValidName, isValidPhone, isValidPassword, isValidPincode, isValidAddress, isValidInputValue, isValidStreet, isValidObjectId, isValidInputBody, isValidCity } = require("../utilities/validator")

const registerUser = async function (req, res) {
    try {
        let reqbody = req.body
        let files = req.files
        if (files && files.length > 0) {
            req.uplodeLink = await aws.uploadFile(files[0])
        } else
            return res.
                status(400).
                send({ status: false, msg: "invalid request" })
        if (Object.keys(reqbody).length == 0)
            return res.
                status(400).
                send({ status: false, message: "data is required" })

        let { fname, lname, email, phone, password, address, ...rest } = reqbody

        if (Object.keys(rest).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry" })

        if (!fname)
            return res.
                status(400).
                send({ status: false, message: "fname is required" })

        if (!isValidName(fname))
            return res.
                status(400).
                send({ status: false, message: "fname is invalid or empty" })

        if (!lname)
            return res.
                status(400).
                send({ status: false, message: "lname is required" })

        if (!isValidName(lname))
            return res.
                status(400).
                send({ status: false, message: "lname is invalid or empty" })

        if (!email)
            return res.
                status(400).
                send({ status: false, message: "email is required" })

        if (!isValidEmail(email))
            return res.
                status(400).
                send({ status: false, message: "email is empty or invalid" })

        /**************************** Unickness of Email Checking ******************/

        let em = await userModel.findOne({ email: email })
        if (em != null)
            return res.
                status(409).
                send({ status: false, message: `This ${em.email} is already exist` })

        if (!files[0].mimetype)
            return res.
                status(400).
                send({ status: false, message: "profileImage is required" })

        if (!isValidProfile(files[0].originalname))
            return res.
                status(400).
                send({ status: false, msg: "plz provide profileImage in (jpg|png|jpeg) formate" })

        if (!phone)
            return res.
                status(400).
                send({ status: false, message: "phone is required" })

        if (!isValidPhone(phone))
            return res.
                status(400).
                send({ status: false, message: "phone no is not valid" })

        /********************* UNickness of Phone Checking ********************/

        let ph = await userModel.findOne({ phone: phone })
        if (ph != null)
            return res.
                status(409).
                send({ status: false, message: `this ${ph.phone} is already exist` })

        if (!password)
            return res.
                status(400).
                send({ status: false, message: "password is required" })

        if (!isValidPassword(password))
            return res.
                status(400).
                send({ status: false, message: "invalid password" })

        if (!address)
            return res.
                status(400).
                send({ status: false, message: "address is required" })

        if (!isValidAddress(JSON.parse(address)))
            return res.
                status(400).
                send({ status: false, message: "address object must be contain Shipping and Billing object" })

        /************************ Destructering *************************************/

        const { shipping, billing } = JSON.parse(address)

        if (Object.keys(shipping).length == 0)
            return res.
                status(400).
                send({ status: false, message: "shiping object is required inside Address" })

        if (!isValidAddress(shipping))
            return res.
                status(400).
                send({ status: false, message: "shipping object must contain street,city and pincode" })

        if (!(shipping.street && shipping.city && shipping.pincode))
            return res.
                status(400).
                send({ status: false, message: "somthing is missing either street,city or pincode inside shipping object" })

        if (!isValidStreet(shipping.street))
            return res.
                status(400).
                send({ status: false, message: "street is not valid" })

        if (!isValidCity(shipping.city))
            return res.
                status(400).send({ status: false, message: "city value is invalid" })

        if (!isValidPincode(shipping.pincode))
            return res.
                status(400).
                send({ status: false, message: "pincode is invalid" })

        if (Object.keys(billing).length == 0)
            return res.
                status(400).
                send({ status: false, message: "Billing object is required inside Address" })

        if (!isValidAddress(billing))
            return res.
                status(400).
                send({ status: false, message: "billing object must contain street,city and pincode" })

        if (!(billing.street && billing.city && billing.pincode))
            return res.
                status(400).
                send({ status: false, message: "somthing is missing either street,city or pincode inside billing object" })

        if (!isValidStreet(billing.street))
            return res.
                status(400).
                send({ status: false, message: "street is not valid" })

        if (!isValidCity(billing.city))
            return res.
                status(400).send({ status: false, message: "city value is invalid" })

        if (!isValidPincode(billing.pincode))
            return res.
                status(400).
                send({ status: false, message: "pincode is invalid" })

        /**************** Password Encryption ********************************/

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        let obj = {
            fname: reqbody.fname,
            lname: lname,
            email: email,
            profileImage: req.uplodeLink,
            phone: phone,
            password: encryptedPassword,
            address: JSON.parse(address)
        }
        let result = await userModel.create(obj)
        return res.
            status(201).
            send({ status: true, message: "succesefully created", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, msg: error.message })
    }
}

//******************************USER LOGIN**************************************

const userLogin = async function (req, res) {

    try {

        const queryParams = req.query;
        const requestBody = req.body;

        // ************no data is required from query params **********

        if (isValidInputBody(queryParams)) {
            return res.
                status(404).
                send({ status: false, message: "Page not found" });
        }

        if (!isValidInputBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "User data is required for login",
            });
        }

        const userName = requestBody.email;
        const password = requestBody.password;

        if (!isValidInputValue(userName) || !isValidEmail(userName)) {
            return res
                .status(400)
                .send({ status: false, message: "email is required and should be a valid email" });
        }

        if (!isValidInputValue(password) || !isValidPassword(password)) {
            return res
                .status(400)
                .send({ status: false, message: "password is required and should contain 8 to 15 characters and must contain one letter and digit" });
        }

        //****************  finding user by given email ******************
        const userDetails = await userModel.findOne({ email: userName });

        if (!userDetails) {
            return res
                .status(404)
                .send({ status: false, message: "No user found by email" });
        }

        //***********  comparing hashed password and login password ****************

        const isPasswordMatching = await bcrypt.compare(
            password,
            userDetails.password
        );

        if (!isPasswordMatching) {
            return res
                .status(400)
                .send({ status: false, message: "incorrect password" });
        }

        //************  creating JWT token **********************
        const payload = { userId: userDetails._id };
        const expiry = { expiresIn: "4000s" };
        const secretKey = "group31project5";

        const token = jwt.sign(payload, secretKey, expiry);

        // setting bearer token in response header
        res.header("Authorization", "Bearer " + token);

        const data = { userId: userDetails._id, token: token };

        res
            .status(200)
            .send({ status: true, message: "login successful", data: data });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

const userDetails = async function (req, res) {
    try {
        let user_id = req.params.userId
        if (!mongoose.isValidObjectId(user_id))
            return res.
                status(400).
                send({ status: false, message: "user_id is not valid" })
        let result = await userModel.findById(user_id)
        if (!result)
            return res.
                status(404).
                send({ status: false, message: "User not exist" })
        res.
            status(200).
            send({ status: true, message: "Successfully Fetched UserDetails", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

const userUpdate = async function (req, res) {
    try {
        let reqbody = req.body
        let files = req.files
        let user_id = req.params.userId
        let update = {}
        const { fname, lname, email, profileImage, phone, password, address } = reqbody

        if (fname) {
            if (!isValidName(fname))
                return res.
                    status(400).
                    send({ status: false, message: "fname is invalid" })
            update.fname = fname
        }
        if (lname) {
            if (!isValidName(lname))
                return res.
                    status(400).
                    send({ status: false, message: "fname is invalid" })
            update.lname = lname
        }
        if (email) {
            if (!isValidEmail(email))
                return res.
                    status(400).
                    send({ status: false, message: "email is invalid" })
            let data = await userModel.findOne({ email: email })
            if (data != null)
                return res.
                    status(409).
                    send({ status: false, message: `this ${data.email} is already present` })
            update.email = email
        }
        if (files.length > 0) {
            if (!isValidProfile(files[0].originalname))
                return res.
                    status(400).
                    send({ status: false, msg: "plz provide profileImage in (jpg|png|jpeg) formate" })
            req.Link = await aws.uploadFile(files[0])
            update.profileImage = req.Link
        }
        if (phone) {
            if (!isValidPhone(phone))
                return res.
                    status(400).
                    send({ status: false, message: "phone no is invalid" })
            let data = await userModel.findOne({ phone: phone })
            if (data != null)
                return res.
                    status(409).
                    send({ status: false, message: `this ${data.phone} is already present` })
            update.phone = phone
        }
        if (password) {
            if (!isValidPassword(password))
                return res.
                    status(400).
                    send({ status: false, message: "password is not valid" })
            update.password = password
        }
        if (address) {

            if (!isValidAddress(JSON.parse(address)))
                return res.
                    status(400).
                    send({ status: false, message: "address object must be containt things that u want to be update" })

            let data = await userModel.findById(user_id)
            req.address = data.address

            const { shipping, billing } = JSON.parse(address)

            if (isValidAddress(shipping)) {
                if (shipping.street) {
                    if (!isValidStreet(shipping.street))
                        return res.
                            status(400).
                            send({ status: false, message: "street is invalid" })
                    req.address.shipping.street = shipping.street
                } if (shipping.city) {
                    if (!isValidCity(shipping.city))
                        return res.
                            status(400).
                            send({ status: false, message: "city is invalid" })
                    req.address.shipping.city = shipping.city

                } if (shipping.pincode) {
                    if (!isValidPincode(shipping.pincode))
                        return res.
                            status(400).
                            send({ status: false, message: "pincode is invalid" })
                    req.address.shipping.pincode = shipping.pincode
                }
            }

            if (isValidAddress(billing)) {

                if (billing.street) {
                    if (!isValidStreet(billing.street))
                        return res.
                            status(400).
                            send({ status: false, message: "street is invalid" })
                    req.address.billing.street = billing.street
                } if (billing.city) {
                    if (!isValidCity(billing.city))
                        return res.
                            status(400).
                            send({ status: false, message: "city is invalid" })
                    req.address.billing.city = billing.city
                } if (billing.pincode) {
                    if (!isValidPincode(billing.pincode))
                        return res.
                            status(400).
                            send({ status: false, message: "pincode is invalid" })
                    req.address.billing.pincode = billing.pincode
                }
            }
            update.address = req.address
        }
        let result = await userModel.findByIdAndUpdate({ _id: user_id }, update, { new: true })
        return res.
            status(200).
            send({ status: true, message: "updated details", data: result })
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}

module.exports = { registerUser, userLogin, userUpdate, userDetails }