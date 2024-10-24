const router= require("express").Router()
const { body, validationResult } = require('express-validator');

const authorized=require("../middleware/authorize")
const admin=require("../middleware/admin")
const upload=require("../middleware/uploadimages")
const util=require("util") // this is helper function to can use async an awit
const fs=require("fs")
// because i will interact with mysql i should import db 
const conn=require("../db/dbconnections")
router.post("/create",authorized,admin,
   upload.single("image"),
    body("name").isString().isLength({min:5,max:20}).withMessage("enter valid name"),
    body("description").isString().isLength({min:10}).withMessage("enter valid description"),
    async(req,res)=>{
  try{ 
         const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({errors:errors.array()});
          }
          //validate the image upoad 
        if(!req.file){
            
                res.status(400).json({
                    "errors": [
                        {
                            msg:"file not uploaded"
                        }
                    ]
                })
            
        }

        //prepare object to store in database 

        const movieData={
            name:req.body.name,
            description:req.body.description,
            image_url:req.file.filename
            
        }
        
        // insert object in db
        const query=util.promisify(conn.query).bind(conn)

        await query("insert into movies set ? ",movieData)
       
        res.status(200).json(movieData)
        }
   
   
   catch(err){
    res.status(500).json(err)
   }
}
)
router.put("/update/:id",authorized,admin,
    upload.single("image"),
     body("name").isString().isLength({min:5,max:20}).withMessage("enter valid name"),
     body("description").isString().isLength({min:5}).withMessage("enter valid description"),
   async(req,res)=>{
   try{ 
          const errors = validationResult(req);
           if (!errors.isEmpty()) {
             return res.status(400).json({errors:errors.array()});
           }
           const query=util.promisify(conn.query).bind(conn)

           //validate if movie exist or not 
           const movieexist=await query("select * from movies where id = ?",[req.params.id])
           if(!movieexist[0]){
            res.status(404).json({msg:"movie not found "})
           }
           //validate the image upoad 
         if(!req.file){
             
                 res.status(400).json({
                     "errors": [
                         {
                             msg:"file not uploaded"
                         }
                     ]
                 })
             
         }
 
         //prepare object to store in database 
         const movieData={
             name:req.body.name,
             description:req.body.description,
             
         }
         if(req.file){
            movieData.image_url=req.file.filename
            //delete the old image 
            fs.unlinkSync("./upload/"+ movieexist[0].image_url)
         }
         // update object in db
 
         await query("update movies set ? where id =? ",movieData,movieexist[0].id)
        
         res.status(200).json({
            msg:"movie updated"
         })
         }
    
    
    catch(err){
     res.status(500).json(err)
    }
 }
 )
 
 router.delete("/delete/:id",authorized,admin,
    
   async(req,res)=>{
   try{ 
          
           const query=util.promisify(conn.query).bind(conn)

           //validate if movie exist or not 
           const movieexist=await query("select * from movies where id = ?",[req.params.id])
           if(!movieexist[0]){
            res.status(404).json({msg:"movie not found "})
           }
      
            //delete the old image 
            fs.unlinkSync("./upload/"+ movieexist[0].image_url)
         
         // delete object in db
 
         await query("delete from movies where id =? ",movieexist[0].id)
        
         res.status(200).json({
            msg:"movie deleted"
         })
         }
    
    
    catch(err){
     res.status(500).json(err)
    }
 }
 )
 
router.get("/get_movies",async(req,res)=>{
    const query=util.promisify(conn.query).bind(conn)
    const movies=await query("select * from movies")
    movies.map((movie)=>{
        movie.image_url="http://"+req.hostname + ":4000/"+movie.image_url
    })
    res.status(200).json(movies)
}
)

router.get("/get_movies/:id",async(req,res)=>{
    const query=util.promisify(conn.query).bind(conn)
    const movie=await query("select * from movies where id = ?",[req.params.id])
    if(!movie[0]){
     res.status(404).json({msg:"movie not found "})
    }
  
        movie[0].image_url="http://"+req.hostname + ":4000/"+movie[0].image_url
        movie[0].reviews=await query("select * from user_movie_review where movie_id =?",movie[0].id) 
    res.status(200).json(movie[0])
}
)

// search for a movie 
router.get("/search",async(req,res)=>{
    const query=util.promisify(conn.query).bind(conn)
    let search=""
    if(req.query.search){
        search=`where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%' `
    }
    const movies=await query(`select * from movies ${search}`)
    movies.map((movie)=>{
        movie.image_url="http://"+req.hostname + ":4000/"+movie.image_url
    })
    res.status(200).json(movies)
}
)
router.post("/movie-review",authorized,
     body("movie_id").isNumeric().withMessage("enter valid movie id "),
     body("review").isString().isLength({min:10}).withMessage("enter valid review"),
async(req,res)=>{
    try{ 
        const errors = validationResult(req);
         if (!errors.isEmpty()) {
           return res.status(400).json({errors:errors.array()});
         }
         const query=util.promisify(conn.query).bind(conn)

         //validate if movie exist or not 
         const movie=await query("select * from movies where id = ?",[req.body.movie_id])
         if(!movie[0]){
          res.status(404).json({msg:"movie not found "})
         }
       //prepare object to store in database 

       const reviewobj={
           user_id:res.locals.user.id,
           movie_id:movie[0].id,
           review:req.body.review
           
       }
       
       // insert object in db

       await query("insert into user_movie_review set ? ",reviewobj)
      
       res.status(200).json({
        msg:"review added "
       })
       }
  
  
  catch(err){
   res.status(500).json(err)
  }
}
)
module.exports=router
