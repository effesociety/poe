const mongoose = require('mongoose')

const examsSchema = mongoose.Schema({
    course: {
        type: String,
        required: true
    },
    room: {
        type: Number,
        required: true
    },
    students: {
        type: Object
    },
    stopping: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('exams', examsSchema)