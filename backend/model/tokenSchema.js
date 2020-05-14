const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("tokenSchema", tokenSchema)
