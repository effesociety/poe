const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role:{
    type: String,
    enum: ['admin','client'],
    required: true
  }
})

module.exports = mongoose.model("userSchema", userSchema)
