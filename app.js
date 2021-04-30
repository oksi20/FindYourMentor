const express = require('express');
const logger = require('morgan');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require("cookie-parser");
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
require('dotenv').config();
const MongoStore = require('connect-mongo');
const mongoUrl = process.env.DB_URL;


const {cookiesCleaner}=require('./middleware/auth');
const errorMiddleware=require('./middleware/error');
const indexRouter=require('./routers/indexRouter')

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(process.env.PWD, 'views'));
app.use(logger('dev'));
app.use(express.static(path.join(process.env.PWD, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const options = {
  // store: new FileStore(),
  key: 'user_sid',
  secret: 'fsjdhfsdg89dsghg',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    expires: 10000 * 60 * 10,
  },
  store: MongoStore.create({ mongoUrl })
};

app.use(session(options));
app.use(cookiesCleaner);
app.use((req, res, next) => {
  res.locals.userLogined = req.session?.user;
  next();
});


app.use('/', indexRouter);
app.get('/image', (req, res)=>{
  res.render('image')
})
app.post('/image', (req, res)=>{
  res.send(req.body)
})
errorMiddleware(app);

module.exports = app;
