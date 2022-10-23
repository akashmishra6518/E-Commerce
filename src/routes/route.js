const express = require("express")
const router = express.Router()
const UserController=require("../controllers/userController")
const ProductController=require("../controllers/productController")
const CartController=require("../controllers/cartController")
const OrderControler=require("../controllers/orderController")
const Auth=require("../middleWares/auth")

//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})


//************USER API***************** */
router.post('/register', UserController.registerUser)
router.post('/login', UserController.userLogin)
router.get('/user/:userId/profile',  UserController.userDetails)
router.put('/user/:userId/profile', Auth.authentication, UserController.userUpdate)

//************PRODUCT API***************** */
router.post('/products', ProductController.createProduct)
router.get('/products', ProductController.getProductDetails)
router.get('/products/:productId', ProductController.getProductById)
router.put('/products/:productId', ProductController.updateProductDetails)
router.delete('/products/:productId', ProductController.deleteProductById)


//************CART API****************** */
router.post('/users/:userId/cart',Auth.authentication,Auth.authorization,  CartController.createCart)
router.put('/users/:userId/cart', Auth.authentication, Auth.authorization, CartController.updateCart)
router.get('/users/:userId/cart', Auth.authentication, CartController.getCartDeatils)
router.delete('/users/:userId/cart', Auth.authentication, CartController.delCart)

//************ORDER API****************** */
router.post('/users/:userId/orders', Auth.authentication, OrderControler.createOrder)
router.put('/users/:userId/orders', Auth.authentication, Auth.authorization, OrderControler.updateOrder)


router.all("/*", function (req, res) {
    res.status(400).send({ status: false, message: "invalid http request" });
  });


module.exports=router
