const { Schema, model} = require('mongoose');


const tagSchema=new Schema({
  tag:{
    type:String
  }
})
module.exports=model('Tag', tagSchema);
