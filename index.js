const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")
const user=require("./modules/users");
const cookieParser=require("cookie-parser")
const imageDownloader =require('image-downloader')
const molter=require('multer')
const fs=require('fs')
const place=require('./modules/place')
const booking= require('./modules/booking');




require("dotenv").config();
const app=express()
mongoose.connect(process.env.MONGO_URL).then(()=>console.log('good'))
.catch(e=>console.log(e))
    


    

app.use(express.json())
app.use(cookieParser())
app.use(express.static(__dirname+'/uploads'))
app.use('/uploads', express.static(__dirname+'/uploads'))

const secret=bcrypt.genSaltSync(10)
const jwtsecret="kdjdhdhmnkldiddsvdb"


app.use(cors({
    
    origin:process.env.LOCATION,
    credentials: true

}))



app.get("/test",(req,res)=>{
   res.send("test ok")
})
app.post("/register",async(req,res)=>{
  const{name,email,password}=req.body
try{
    const User = await user.create({
        name,
        email,
        password:bcrypt.hashSync(password,secret)
      })
      res.json(User);
} catch(e){
    res.status(422).json(e)
}
  
  
})



app.post("/login",async(req,res)=>{
    
    const{email,password}=req.body

   const userdoc=await user.findOne({email})
   if(userdoc){
    
const passwordok=bcrypt.compareSync(password, userdoc.password)
   
if(passwordok){
    
jwt.sign({email:userdoc.email, id:userdoc._id,name:userdoc.name},jwtsecret,(err,token)=>{
    
    if(err) throw err;

    res.cookie("active",token).json(userdoc)
    
        })
        
    }else{
        res.status(422).json('pass not ok' )
    }
   }else{
    console.log("we no see am")
   }
})

app.get('/profile',(req,res)=>{
    const {active}=req.cookies;
   if(active){
  jwt.verify(active, jwtsecret, {}, (err,user)=>{
    if(err) throw err;
    res.json(user)
  })
   }else{
    res.json(null)
   }

    

})

app.post('/logout',(req,res)=>{

res.cookie('active',"").json(true)    
})

app.post('/upload-by-link',async(req,res)=>{
    const {link}=req.body
    const newName='photo'+Date.now()+'.jpg';
 
    imageDownloader.image({
        url:link,
        dest: __dirname+'/uploads/' +newName
    })
   
    res.json(newName)
})

const photosMiddleWare=molter({dest:'uploads'})
app.post('/upload',photosMiddleWare.array('photos',100) ,(req,res)=>{
   const uploadedFile=[]
    for(let i=0; i<req.files.length; i++){
    const {path, originalname}=req.files[i]
    const parts=originalname.split('.')
    const ext=parts[parts.length-1]

    const newPath=path+'.'+ext;

    fs.renameSync(path,newPath)
    uploadedFile.push(newPath.replace("uploads\\",""))
   
}
    res.json(uploadedFile)
} )

app.post('/places', (req,res)=>{
    const {active}=req.cookies;
    const{
        title,address,addPhotos,description,price,
        perks,extraInfo,checkin,checkout,maxGuest
    }=req.body;

    jwt.verify(active, jwtsecret, {}, async(err,user)=>{
        if(err) throw err;
      const placeDoc= await place.create({
         owner:user.id,price,
         title,address,photos:addPhotos,description,
        perks,extrainfor:extraInfo,checkin,checkout,
        maxguest:maxGuest


        })
       res.json(placeDoc)
      })
})

app.get('/user-places',(req,res)=>{
    const {active}=req.cookies;
    jwt.verify(active, jwtsecret, {}, async(err,user)=>{
        const {id}=user;
        res.json(await place.find({owner:id}))
    })

})

app.get('/place/:id',async (req,res)=>{
    const {id}=req.params
    res.json(await place.findById(id))
})
app.put('/places',async(req,res)=>{
    const {active}=req.cookies;
    
    const{
        id,
        price,title,address,addPhotos,description,
        perks,extraInfo,checkin,checkout,maxGuest
    }=req.body;
    
    jwt.verify(active, jwtsecret, {}, async(err,user)=>{
        const placeDoc= await place.findById(id)
        if(user.id===placeDoc.owner.toString()){
            placeDoc.set({
         title,address,photos:addPhotos,description,price,
        perks,extrainfor:extraInfo,checkin,checkout,maxguest:maxGuest
            })
            await placeDoc.save()
            res.json("ok")
        }
    })
})
app.get('/places',async(req,res)=>{
    res.json(await place.find())
})

app.post('/booking',async (req,res)=>{
    const userData= await jwt.verify(req.cookies.active, jwtsecret, {}, async(err,user)=>{
        if(err) throw err;
        return user
    })
   
    const {place,checkin,
        checkout,numberofguest
        ,name,phone,price}=req.body
await booking.create({place,checkin,
        checkout,numberofguest,user:userData.id
        ,name,phone,price}).then((doc)=>{
            res.json(doc)
        }).catch(err=>console.log(err))
})

app.get('/bookings',async (req,res)=>{
    const userData=await jwt.verify(req.cookies.active, jwtsecret, {}, async(err,user)=>{
        if(err) throw err;
        return user
    })
    
   res.json(await booking.find({user:userData.id}).populate('place'))
})

app.listen(4000,()=>{console.log("its worlking")})
