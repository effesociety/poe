const express = require('express')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const coursesSchema = require('../schemas/courses-schema')
const usersSchema = require('../schemas/users-schema')

const coursesRouter = express.Router()

coursesRouter.use(bodyParser.json())
coursesRouter.use(bodyParser.urlencoded({extended:false}))

coursesRouter.post(
  "/create",
  async (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var token = cookies.token
    if(token){
      var decoded = jwt.verify(token,process.env.JWT_SECRET)
      var email = decoded.user.email
      var name = req.body.name

      try {
        let course = await coursesSchema.findOne({name})
        if (course) {
          return res.status(400).json({
            message: "This course already exists"
          })
        }

        let user = await usersSchema.findOne({email})
        if (!user){
          return res.status(400).json({
            message: "User not exists"
          })
        }

        if (user.role === 'teacher') {
          course = new coursesSchema({
            name,
            teacher: email,
            students: []
          })

          await course.save()

          user.courses.push(name)
          await user.save()
          console.log("User",user.email, "has a new course:",course.name)
          res.status(200).json({
            message: "Success"
          })
        }
        else {
          return res.status(400).json({
            message: "This user cannot create a course"
          })
        }
      } catch(e){
        console.error(e);
        return res.status(500).json({
          message: "Server Error"
        })
      }
    }
    else {
      return res.status(400).json({
        message: "Invalid Token"
      })
    }
  }
)


coursesRouter.delete(
  "/destroy",
  async (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var token = cookies.token
    if(token){
      var decoded = jwt.verify(token,process.env.JWT_SECRET)
      var email = decoded.user.email
      var name = req.body.name

      try {
        let course = await coursesSchema.findOne({name})

        if (!course) {
          return res.status(400).json({
            message: "This course not exists"
          })
        }

        let user = await usersSchema.findOne({email})
        if (!user){
          return res.status(400).json({
            message: "User not exists"
          })
        }

        if (user.role === 'teacher') {
          user.courses.splice(user.courses.indexOf(name),1)
          await user.save()
          await course.remove()

          console.log("Course:",course.name,"has been deleted")
          res.status(200).json({
            message: "Success"
          })
        }
        else {
          return res.status(400).json({
            message: "This user cannot destroy a course"
          })
        }
      } catch(e){
        console.error(e);
        return res.status(500).json({
          message: "Server Error"
        })
      }
    }
    else {
      return res.status(400).json({
        message: "Invalid Token"
      })
    }
  }
)

coursesRouter.post(
  "/enroll",
  async (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var token = cookies.token
    if(token){
      var decoded = jwt.verify(token,process.env.JWT_SECRET)
      var email = decoded.user.email
      var name = req.body.name

      try {
        let course = await coursesSchema.findOne({name})
        if (!course) {
          return res.status(400).json({
            message: "This course not exists"
          })
        }

        let user = await usersSchema.findOne({email})
        if (!user){
          return res.status(400).json({
            message: "User not exists"
          })
        }

        if (user.role === 'student') {
          user.courses.push(name)
          await user.save()
          course.students.push(email)
          await course.save()
          console.log("Student:",email,"enrolled to course",name)
          res.status(200).json({
            message: "Success"
          })
        }
        else {
          return res.status(400).json({
            message: "This user is not a student"
          })
        }
      } catch(e){
        console.error(e);
        return res.status(500).json({
          message: "Server Error"
        })
      }
    }
    else {
      return res.status(400).json({
        message: "Invalid Token"
      })
    }
  }
)

module.exports = coursesRouter
