const router = require('express').Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const {sessionChecker}=require('../middleware/auth');
const User=require('../models/user.model')

router.get('/', sessionChecker, (req, res) => {
  res.redirect('home');
});

router.get('/home', sessionChecker, (req, res) => {
  res.render('home', {isSigned:true});
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
  .get(sessionChecker, (req, res) => {
    res.render('signup', {isSigned:true});
  })
  .post(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({
        username,
        email,
        password: await bcrypt.hash(password, Number(process.env.SALT_ROUNDS)),
      });
      await user.save();
      req.session.user = user;
      res.redirect("/entries");
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
