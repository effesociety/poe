const express = require('express')
const bodyParser = require('body-parser')
const cookie = require('cookie')
const coursesSchema = require('../schemas/courses-schema')
const helper = require('../utils/helpers')
const coursesRouter = express.Router()

coursesRouter.use(bodyParser.json())
coursesRouter.use(bodyParser.urlencoded({extended:false}))

coursesRouter.post(
  "/create",
  (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var name = req.body.name
    helper.checkCourse(name).then(course => {
      if(!course){
        helper.checkUser(cookies,res).then(user => {
          if(user){
            if (helper.isTeacher(user)) {
              course = new coursesSchema({
                name,
                teacher: user.email,
                students: []
              })

              course.save()
              user.courses.push(name)
              user.save()

              console.log("Course [",course.name, "] has been created")
              res.status(200).json({
                message: "Success"
              })
            }
            else
              res.status(400).json({
                message: "This user cannot create a course"
              })
          }
          else
            res.status(400).json({
              message: "User not exists"
            })
        })
      }
      else
        res.status(400).json({
          message: "This course already exists"
        })
    })
  }
)

coursesRouter.delete(
  "/destroy",
  (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var courseName = req.body.name
    helper.checkCourse(courseName).then(course => {
      if(course){
        helper.checkUser(cookies).then(user => {
          if(user){
            if (helper.isTeacher(user)) {
              user.courses.splice(user.courses.indexOf(courseName),1)
              helper.removeDeletedCourse(courseName)
              user.save()
              course.remove()

              console.log("Course [",courseName,"] has been deleted")
              res.status(200).json({
                message: "Success"
              })
            }
            else
              res.status(400).json({
                message: "This user cannot destroy a course"
              })
          }
          else
            res.status(400).json({
              message: "User not exists"
            })
        })
      }
      else
        res.status(400).json({
          message: "This course not exists"
        })
    })
  }
)

coursesRouter.post(
  "/enroll",
  (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var name = req.body.name
    console.log(name)
    helper.checkCourse(name).then(course => {
      if(course){
        helper.checkUser(cookies,res).then(user => {
          if(user){
            if (user.role === 'student' && !user.courses.includes(course.name)) {
              user.courses.push(course.name)
              user.save()
              course.students.push(user.email)
              course.save()
              console.log("Student:",user.email,"enrolled to course",course.name)
              res.status(200).json({
                message: "Success"
              })
            }
            else
              res.status(400).json({
                message: "This user is not a student"
              })
          }
          else
            res.status(400).json({
              message: "User not exists"
            })
        })
      }
      else
        res.status(400).json({
          message: "This course not exists"
        })
    })
  }
)

coursesRouter.post(
  "/upload",
  (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var { questions,answers,name } = req.body
    helper.checkCourse(name).then(course => {
      if(course){
        helper.checkUser(cookies,res).then(async (user) => {
          if(user){
            if (helper.isTeacher(user)) {
              course.test = {questions,answers}
              await course.save()      
              console.log("[",course.name,"] Test correctly loaded")
              res.status(200).json({
                message: "Success"
              })
            }
            else{
              res.status(400).json({
                message: "This user cannot upload an exam"
              })
            }
          }
          else{
            res.status(400).json({
              message: "User not exists"
            })
          }
        })
      }
      else{
        res.status(400).json({
          message: "This course not exists"
        })
      }
    })
  }
)

coursesRouter.post(
  "/history",
  async (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var name = req.body.name;
    helper.checkUser(cookies).then(async user => {
        if(user && user.role === 'teacher'){
          try{
              let course = await helper.checkCourse(name)
              if(course){
                  console.log("Got history for exam:",name)
                  res.status(200).json({
                      history: course.history
                  })
              }
              else{
                  console.log("Exam not found")
                  res.status(400).json({
                    message: "Error"
                  })
              }
          }
          catch(e){
              console.log(e)
          }
        }
        else{
          res.status(400).json({
              message: "No valid token provided in the request"
            })
        }
    })
  }
)

module.exports = coursesRouter