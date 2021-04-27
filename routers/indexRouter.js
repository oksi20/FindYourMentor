const router = require('express').Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const {sessionChecker}=require('../middleware/auth');
const Tag = require('../models/tag.model');
const User=require('../models/user.model')

router.get('/',(req, res) => {
  res.redirect('home');
});

router.get('/home',async (req, res) => {
  const mentors = await User.find()
  console.log(mentors)
  res.render('home', {mentors});
});

router.route('/login')
.get(sessionChecker, (req, res)=>{
  res.render('login',{isSigned:true} );
})
.post(async (req, res)=>{
  const {username, password}=req.body;
  const user=await User.findOne({username});
  if (user && (await bcrypt.compare(password, user.password))){
    req.session.user=user;
    res.redirect('/entries');
  } else {
    res.redirect('/login', {isSigned:true})
  }
})
router
  .route('/signup')
  .get(sessionChecker, async (req, res) => {
    const tags = await Tag.find()
    res.render('signup', {isSigned:true,tags});
  })
  .post(async (req, res, next) => {
    
    try {
      const user= req.body;
            user.password = await bcrypt.hash(user.password, Number(process.env.SALT_ROUNDS))
            
      
      const newuser = new User(user);
      await newuser.save();
      const users = await User.find()
      console.log(users)
      // req.session.user = user;
      // res.redirect("/entries");
    } catch (error) {
      next(error);
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
module.exports = router;
