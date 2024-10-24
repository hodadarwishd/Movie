const conn=require("../db/dbconnections")
const util=require("util") // this is helper function to can use async an awit


const authorized=async(req,res,next)=>{
    const query=util.promisify(conn.query).bind(conn)
    const {token}=req.headers;
    const user=await query("select * from users where token = ?",[token])

    if(user[0]){
        res.locals.user=user[0]
        next();
    }
    else{
        res.status(403).json({
            msg:"you are not authorized "
        })
    }

}

module.exports=authorized
