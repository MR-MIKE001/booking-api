const mongoose=require("mongoose")
const{Schema}=require("mongoose")


const UserSchema=new Schema({
    name:String,
    email:{type:String,unique:true},
    password:String

})

const userModel=mongoose.model("user",UserSchema)

module.exports=userModel;