const Request = require('../models/request.model');
const Tag = require('../models/tag.model');
const User = require('../models/user.model');
const dbConnect = require('./config');
const { disconnect } = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// const funcReadDir = async (directory) => await fs.readdir(directory);

const pushDB = async (directory) => {
  await dbConnect();
    let file = await fs.readFile(`${directory}`, 'utf-8');
    const arr = file.trim().split('\n')
    console.log(arr)
    for (let i=0; i < arr.length; i++) {
      await Tag.create({tag: arr[i]})
    }
    // arr.forEach(async elem => {
    //   const tag = new Tag({tag: elem});
    //   await tag.save()
    // })
    disconnect()
}

// const seedDb = async () => {
//   await dbConnect()
//   await User.create({user: 'Ruslan'})
//   disconnect()
// }
// seedDb()
pushDB('./models/tags.txt')
