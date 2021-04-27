const { Schema, model} = require('mongoose');

const UserSchema = new Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    match: /^[A-Z]\w+$/i,
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
});
module.exports=model('users', UserSchema);
