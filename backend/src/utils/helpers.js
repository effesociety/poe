const jwt = require('jsonwebtoken')
const usersSchema = require('../schemas/users-schema')
const coursesSchema = require('../schemas/courses-schema')

async function checkUser(cookies){
  var token = cookies.token
  if(token){
    var decoded = jwt.verify(token,process.env.JWT_SECRET)
    var email = decoded.user.email

    try{
      let user = await usersSchema.findOne({email})
      return user
    }
    catch (e){
      console.log(e)
      return null;
    }
  }
  else{
    return null;
  }
    
}

async function checkCourse(name){
  try{
    let course = await coursesSchema.findOne({name});
    return course;
  }
  catch (e){
    console.log(e);
    return null;
  }
}

function isTeacher(user){
  if(user.role === 'teacher')
    return true
  else
    return false
}

function isEnrolled(student,course){
  if(student.courses.includes(course)){
    return true;
  }
  else{
    return false;
  }
}

function removeDeletedCourse(course){

}

const EventEmitter = require('events');
const commonEmitter = new EventEmitter();

exports.checkUser = checkUser
exports.checkCourse = checkCourse
exports.isTeacher = isTeacher
exports.isEnrolled = isEnrolled
exports.removeDeletedCourse = removeDeletedCourse
exports.commonEmitter = commonEmitter
