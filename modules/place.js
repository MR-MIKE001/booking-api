const mongoose=require("mongoose")

const placeSchema= new mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    title:String,
    address:String,
    photos:[String],
    description:String,
    perks:[String],
    extrainfor:String,
    checkin:Number,
    checkout:Number,
    maxguest:Number,
    price:Number,

})


const Placemodel= mongoose.model('place',placeSchema)

module.exports=Placemodel