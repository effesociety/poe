const mongoose = require('mongoose')

const coursesSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('coursesSchema', coursesSchema)
