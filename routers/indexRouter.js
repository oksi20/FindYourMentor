const router = require('express').Router();
const bcrypt = require('bcrypt');
// if (process.env.Node_Env!=="production"){
  require('dotenv').config();
// }

const {sessionChecker}=require('../middleware/auth');
const Tag = require('../models/tag.model');
const User=require('../models/user.model')
const multer=require('multer');
const {storage}=require('../cloudinary');
const Request = require('../models/request.model');
const upload=multer({storage})

router.get('/',(req, res) => {
  res.redirect('/home');
});

router.get('/home',async (req, res) => {
  try {
    const mentors = await User.find().populate('tags');
    res.render('home', {mentors});
  } catch(error){
    next(error)
  }
    
});

router
  .route('/login')
  .get(sessionChecker, (req, res)=>{
    res.render('login');
  })

  .post(async (req, res)=>{
    const {username, password}=req.body;
    try{
    const user = await User.findOne({username});
    if (user && (await bcrypt.compare(password, user.password))){
      req.session.user ={id:user._id, name:user.username};
      res.redirect(`/${user.username}`);
    } else {
      res.redirect('/login')
    }
  } catch(error){
    next(error)
  }
  })

router
  .route('/signup')
  .get(sessionChecker, async (req, res) => {
    try{
    const tags = await Tag.find()
    res.render('signup', { tags });
  } catch(error){
    next(error)
  }
    
  })

  .post(upload.single('image'), async (req, res, next) => {
    try {
      const image=req.file;
      const user= req.body;
            user.password = await bcrypt.hash(user.password, Number(process.env.SALT_ROUNDS));
           if (image){
            user.image={url:image.path, filename:image.filename}
           }
      const newuser = new User(user);
      await newuser.save();
      req.session.user ={id:newuser._id, name:newuser.username};
      res.redirect(`/${newuser.username}`); 
    } catch (error) {
      res.render('signup',{error});
    }
  });

  router.get('/logout', async (req, res, next) => {
    if (req.session.user) {
      try {
        await req.session.destroy();
        res.clearCookie("user_sid");
        res.redirect("/");
      } catch (error) {
        next(error);
      }
    } else {
      res.redirect("/login");
    }
  });

  router
    .route('/search')
    .post(async (req,res) => {

      const search = req.body.search.split(',')
    
      let searchId =[]
      let mentors = []

      let searchArr = search.map(el => {
          let arrSplit= el.trim().toLowerCase().split('')
          arrSplit[0] = arrSplit[0].toUpperCase()
          return arrSplit.join('')
        })
      
      for (let i=0;i<searchArr.length;i++) {
       
        const tagId = await Tag.findOne({tag:searchArr[i]})
        if (tagId)
      {
        searchId.push(tagId._id)
      }
        
      }
      if (searchId.length>0){
        for (let el of searchId) {
       
          const mentor = await User.find({tags:el}).populate('tags')
        
          mentors.push(mentor)
          }
  
          mentors = mentors.flat()
          mentors = mentors.map(el => JSON.stringify(el))
          let result= [...new Set(mentors)]
          result = result.map(el => JSON.parse(el))
          res.render('search', {result})
      }
      else {
        res.render('search', {message:true})
      }
      })

  router
    .route('/:username')
    .get(async (req,res) => {
      try{
      const user = await User.findOne({username:req.params.username}).populate('tags')
      res.render('profile',{ user })
    } catch(error){
      next(error)
    }
      
    })

  router
    .route('/:id/edit')
    .get(async (req,res) => {

      const user = await User.findOne({_id:req.params.id}).populate('tags')
      let tags = await Tag.find().lean()
    
      const tagsWeHave = user.tags.map(el => el.tag)
      for (let i=0;i<tags.length;i++) {
        if (tagsWeHave.indexOf(tags[i].tag) !== -1 ) {
          tags[i].checked = true
        } else {
          tags[i].checked = false
        }
      }
      res.render('edit', {user,tags})
     

     
    })
    .post(upload.single('image'),async (req,res) => {
      const userNew=req.body;
      const image=req.file;
      console.log(image)
      if (image){
        userNew.image={url:image.path, filename:image.filename}
      }
      const user =await User.findByIdAndUpdate({_id:req.params.id},userNew,{new:true})
    
      res.redirect(`/${user.username}`)

    })

    router
      .route('/:username/requests')
      .get(async (req,res) => {
       
        const user = await User.findOne({username:req.params.username}).populate('requests')
      
        const requests = user.requests
        const username=user.username;
        res.render('profile' ,{requests, username})
      })
      .post(async (req,res) => {

      })

    router
      .route('/:id/request')
      .post(async (req,res) => {
      
        const newRequest = await Request.create(req.body)
        const user = await User.findOneAndUpdate({_id:req.params.id},{$push: {requests:newRequest._id} })
      
        res.redirect('/home')
      })
    router
    .route('/:username/requests/:id')
    .delete(async (req, res)=>{
      const {username}=req.params;
      const {id}=req.params;
      try{
      await Request.findOneAndDelete({_id:id})
       await User.updateOne({username}, {$pull: {requests:id}});
       res.send(id);
      } catch(error){
        next(error)
      }
      //  await User.updateOne({username},  {requests:[]});
      // res.redirect(`/${username}/requests`);
     
    })


module.exports = router;
