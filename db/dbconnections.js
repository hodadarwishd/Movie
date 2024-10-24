const mysql=require("mysql")
const connection= mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"demo_back_node",
    port:"3306"
})

connection.connect((err)=>{
    if(err) throw err;
    console.log("DBconnect ");
});
module.exports=connection
