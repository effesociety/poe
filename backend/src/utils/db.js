const mongoose = require('mongoose')
const utils = require('./config')
const MONGO_URI = utils.MONGO_URI

const mongoServer = async () => {
  try {
    await mongoose.connect(MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true})
    console.log("Connected to ",MONGO_URI)
  } catch (e) {
    console.log(e)
    throw e
  }
}

module.exports = mongoServer
