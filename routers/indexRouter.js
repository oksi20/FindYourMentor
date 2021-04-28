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
const upload=multer({storage})

router.get('/',(req, res) => {
  res.redirect('/home');
});

router.get('/home',async (req, res) => {
    const mentors = await User.find();
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
      req.session.user = user;
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
            user.image={url:image.path, filename:image.filename}

      const newuser = new User(user);
      await newuser.save();
      
    } catch (error) {
      res.render('singup',{error});
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
    .post(async (req,res) =>{

      const search = req.body.search.split(',')
      const searchId = []
      for (let i=0;i<search.length;i++){
        const tag = await Tag.find({tag:search[i]})
        const mentors = await User.find({tags:tag._id})
        console.log(mentors)
      }
        
     
      
      
      // логика поиска
    })

  router
    .route('/:user')
    .get((req,res) => {

    })




module.exports = router;
