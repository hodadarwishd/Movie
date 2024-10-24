// intialize express app #############

const express = require('express'); // express is module 
const app= express()

// intialize global middleware ########

app.use(express.json()) // to can access json that are in body of request in postman 
app.use(express.json()) // to can access url in request body 
app.use(express.static("upload")) // to can access images that are in fie upload 
const cors=require("cors")
app.use(cors()) //allow http request interact localhosts

//required modules ########
const auth=require("./routes/Auth")
const movies=require("./routes/Movies")


// run the app #######
app.listen(4000,"localhost",()=>{
    console.log("server is runing ")
})

// api routes (endpoints) ##########
app.use("/auth",auth)
app.use("/movies",movies)


