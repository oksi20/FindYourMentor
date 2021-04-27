const { Schema, model} = require('mongoose');
const Tag=require('./tag.model');
const Request=require('./request.model');

const UserSchema = new Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  name:{
    type: String,
    required: true,
  },
  lastname:{
    type: String,
    required: true,
  },
  country:{
    type: String,
    required: true,
  },
  city:{
    type: String,
    required: true,
  },
  experience:{
    type:Number,
    required:true,
  },
  // Мы не храним пароль, а только его хэш
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  // Email
  email: {
    type: String,
    required: true,
    minlength: 5,
    match: /^[A-Za-z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  
  tags:[{type:Schema.type.ObjectID, ref:'Tag'}],

  requests:[{type:Schema.type.ObjectID, ref:'Request'}]
});
module.exports=model('users', UserSchema);
