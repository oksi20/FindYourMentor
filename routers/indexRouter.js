const router = require('express').Router();
const bcrypt = require('bcrypt');
if (process.env.Node_Env!=="production"){
  require('dotenv').config();
}

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
    const mentors = await User.find();
    console.log(mentors);
    res.render('home', {mentors});
});

router
  .route('/login')
  .get(sessionChecker, (req, res)=>{
    res.render('login');
  })

  .post(async (req, res)=>{
    const {username, password}=req.body;
    const user = await User.findOne({username});
    if (user && (await bcrypt.compare(password, user.password))){
      req.session.user ={id:user._id, name:user.username};
      res.redirect(`/${user.username}`);
    } else {
      res.redirect('/login')
    }
  })

router
  .route('/signup')
  .get(sessionChecker, async (req, res) => {
    const tags = await Tag.find()
    res.render('signup', { tags });
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
        searchId.push(tagId._id)
      }
      
      for (let el of searchId) {
        const mentor = await User.find({tags:el})
        mentors.push(mentor)
        }

        mentors = mentors.flat()
        mentors = mentors.map(el => JSON.stringify(el))
        let result= [...new Set(mentors)]
       
        result = result.map(el => JSON.parse(el))
        

        res.render('search', {result})
      })

  router
    .route('/:username')
    .get(async (req,res) => {
      const user = await User.findOne({username:req.params.username}).populate('tags')
      res.render('profile',{ user })
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

// console.log(image);
// if (image){
//   console.log(image);
//   await User.findOneAndUpdate({_id:req.params.id}, {image:{url:image.path, filename:image.filename}})
  // user.image={url:image.path, filename:image.filename}
//  }

      res.redirect(`/${user.username}`)

    })

    router
      .route('/:username/requests')
      .get(async (req,res) => {
        const user = await User.findOne({username:req.params.username}).populate('requests')
        const requests = user.requests
        res.render('profile' ,{requests})
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



module.exports = router;
