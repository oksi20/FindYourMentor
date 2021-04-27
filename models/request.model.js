const { Schema, model} = require('mongoose');

const requestSchema = new Schema({

  name:{
    type: String,
    required: true,
  },
  lastname:{
    type: String,
    required: true,
  },
  contact:{
    type: String,
    required: true,
  },
  about:{
    type:String,
  }
})

module.exports=model('Request', requestSchema);
