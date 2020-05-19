const mongoose = require('mongoose')

const mongoServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true})
    console.log("Connected to ",process.env.MONGO_URI)
  } catch (e) {
    console.log(e)
    throw e
  }
}

module.exports = mongoServer
