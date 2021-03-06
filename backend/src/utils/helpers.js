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
      return null
    }
  }
  else{
    return null
  }
}

async function checkCourse(name){
  try{
    let course = await coursesSchema.findOne({name})
    return course
  }
  catch (e){
    console.log(e)
    return null
  }
}

async function checkTests(courses){
  try{
    var teacherCourses = []
    for await(course of courses){
      let name = course.name
      let c = await coursesSchema.findOne({name})
      if(c.test){
        teacherCourses.push(Object.assign({"test": c.test}, course))
      }
      else{
        teacherCourses.push(course)
      }
    }
    return teacherCourses
  }
  catch (e){
    console.log(e)
    return null
  }
}

async function getTest(name){
  try{
    let course = await coursesSchema.findOne({name})
    if(course.test){
      //Simple shuffling of the questions
      let questionsID = Object.keys(course.test.questions).map((id) => {
        return id
      });
      questionsID.sort(function (a, b) {return Math.random() - 0.5;}); //Shuffling the order of the questions

      const questions = questionsID.map((id) => {
        let options = course.test.questions[id].options;
        options.sort(function (a, b) {return Math.random() - 0.5;}); //Shuffling the order of the options for each question
        const question = {
          "question": course.test.questions[id].question,
          "options": options,
          "id": id
        }
        return question
      })

      return questions
    }
  }
  catch(e){
    console.log(e)
    return null
  }
}

function isTeacher(user){
  if(user.role === 'teacher'){
    return true
  }
  else{
    return false
  }
}

function isEnrolled(student,course){
  if(student.courses.includes(course))
    return true
  else
    return false
}

async function getAllCourses(){
  try{
    let courses = await coursesSchema.find({})
    return courses
  }
  catch(e){
    console.log(e)
    return null
  }
}

async function getOtherCourses(student){
  var otherCourses = []
  try{
    let courses = await getAllCourses()
    for(i in courses){
      if(!student.courses.includes(courses[i].name)){
        otherCourses.push(courses[i].name)
      }
    }
    return otherCourses
  }
  catch (e){
    console.log(e)
    return null
  }
}

async function removeDeletedCourse(courseName){
  try{
    let students = await usersSchema.find({role: 'student'})
    for(i in students){
      for(j in students[i].courses){
        if(students[i].courses[j] === courseName){
          students[i].courses.splice(j,1)
          await students[i].save()
        }
      }
    }
  }
  catch(e){
    console.log(e)
  }
}

async function saveExamHistory(examHistory, name){
  try{
    let course = await coursesSchema.findOne({name})
    if(course){
      let history = course.history;
      if(!history){
        history = []
      }
      history.push(examHistory);
      course.history = history;
      course.save();
    }
  }
  catch(e){
    console.log(e)
  }

}

const EventEmitter = require('events')
const commonEmitter = new EventEmitter()

exports.checkUser = checkUser
exports.checkCourse = checkCourse
exports.checkTests = checkTests
exports.getTest = getTest
exports.isTeacher = isTeacher
exports.isEnrolled = isEnrolled
exports.removeDeletedCourse = removeDeletedCourse
exports.commonEmitter = commonEmitter
exports.getAllCourses = getAllCourses
exports.getOtherCourses = getOtherCourses
exports.saveExamHistory = saveExamHistory
