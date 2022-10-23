const express = require("express")
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const multer=require("multer")
const route = require("./routes/route")
const app = express()

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.use(multer().any())


mongoose.connect("mongodb+srv://BiswajitSwain:EtERzBKu3NLVQlzp@cluster0.xf1eq.mongodb.net/group-31-E-COMMERCE",
{usenewUrlParser : true})
.then(()=>console.log("MongoDB is connected"))
.catch((err)=>console.log(err.message))

app.use("/",route)

app.listen(3000,()=>{
    console.log("Express is running on port "+ 3000)
})

