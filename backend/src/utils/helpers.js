const jwt = require('jsonwebtoken')
const usersSchema = require('../schemas/users-schema')
const coursesSchema = require('../schemas/courses-schema')

async function checkUser(cookies,res){
  var token = cookies.token
  if(token){
    var decoded = jwt.verify(token,process.env.JWT_SECRET)
    var email = decoded.user.email

    try{
      let user = usersSchema.findOne({email})
      return user
    }
    catch (e){
      console.log(e)
      res.status(500).json({
        message: "Server Error"
      })
    }
  }
  else
    res.status(400).json({
      message: "Invalid Token"
    })
}

async function checkCourse(name,res){
  try{
    let course = coursesSchema.findOne({name})
    return course
  }
  catch (e){
    console.log(e)
    res.status(500).json({
      message: "Server Error"
    })
  }
}

function isTeacher(user){
  if(user.role === 'teacher')
    return true
  else
    return false
}

exports.checkUser = checkUser
exports.checkCourse = checkCourse
exports.isTeacher = isTeacher
