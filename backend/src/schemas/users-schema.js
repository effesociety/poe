const mongoose = require('mongoose')

const usersSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role:{
    type: String,
    enum: ['teacher','student'],
    required: true
  },
  courses:{
    type: Array,
    required: true
  }
})

module.exports = mongoose.model('usersSchema', usersSchema)
