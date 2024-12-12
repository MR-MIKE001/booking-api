const express = require("express");
const router=express.Router()
router.get("/test",(req,res)=>{
    res.json({
        message:"hello world"
    })
})

export default router