const utils = require('./utils')
const mongoose = require('mongoose')

const mongoServer = async () => {
  try {
    await mongoose.connect(utils.mongoAddr,{useNewUrlParser: true, useUnifiedTopology: true});
    console.log("Connected to",utils.mongoAddr);
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = mongoServer;
