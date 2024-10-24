const router= require("express").Router()
const { body, validationResult } = require('express-validator');
const util=require("util") // this is helper function to can use async an awit
const bcrypt=require("bcrypt") // to can hashing the password 
const crypto=require("crypto")
// because i will interact with mysql i should import db 
const conn=require("../db/dbconnections")

//registeration 

router.post("/register",
     body("email").isEmail().withMessage("enter valid email"),
     body("name").isString().isLength({min:10,max:20}).withMessage("enter valid name"),
     body("password").isString().isLength({min:8,max:12}).withMessage("enter valid password"),
     async(req,res)=>{
    try {
// make validation using 1 from this (manual validation or using package of express-validator )

 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()});
  }

  //check if email is exist in database 
  const query=util.promisify(conn.query).bind(conn)
  const CheckEmailExist=await query("select * from users where email =?",[req.body.email])
  if(CheckEmailExist.length>0){
    res.status(400).json({
        "errors": [
            {
                msg:"emai already exist"
            }
        ]
    })
}

// prepare user to saved 
const userData={
    name:req.body.name,
    email:req.body.email,
    password:await bcrypt.hash(req.body.password,10),
    token:crypto.randomBytes(16).toString("hex")
}

// insert object in db
await query("insert into users set ? ",userData)
delete userData.password
res.status(200).json(userData)
}
    catch(err){
res.status(500).json({err:err})
    }
})

//login 
router.post("/login",
    body("email").isEmail().withMessage("enter valid email"),
    body("password").isString().isLength({min:8,max:12}).withMessage("enter valid password"),
    async(req,res)=>{
   try {
// make validation using 1 from this (manual validation or using package of express-validator )

const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({errors:errors.array()});
 }

 //check if email is exist in database 
 const query=util.promisify(conn.query).bind(conn)
 const user=await query("select * from users where email =?",[req.body.email])
 if(user.length==0){
   res.status(404).json({
       "errors": [
           {
               msg:"email or password not found "
           }
       ]
   })
}

//compare password 
const checkPassword=await bcrypt.compare(req.body.password,user[0].password)
if(checkPassword){
    delete user[0].password
    res.status(200).json(user)
}
else{
    res.status(404).json({
        "errors": [
            {
                msg:"email or password not found "
            }
        ]
    })
}

}
   catch(err){
res.status(500).json({err:err})
   }
})
module.exports=router
