const mongoose =require("mongoose")

const bookingSchema=new mongoose.Schema({
    place:{type:mongoose.Schema.Types.ObjectId, required:true,ref:'place'},
    user:{type:mongoose.Schema.Types.ObjectId, required:true},
    checkin:{type:Date,required:true},
    checkout:{type:Date,required:true},
   name:{type:String, required:true},
   phone:{type:String, required:true},
   price:Number,
   numberofguest:Number,
})

const bookingModel=mongoose.model('booking',bookingSchema)

module.exports=bookingModel