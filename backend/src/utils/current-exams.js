const examsSchema = require('../schemas/exams-schema')

class CurrentExams{

    async getExam(course){
        console.log("Getting exam for course:", course)
        try{
            let exam = await examsSchema.findOne({course})
            if(exam){
                console.log("Exam found for course:", course)
                return exam;
            }
            else{
                console.log("Exam not found for course:", course)
                return null;
            }
        }
        catch(e){
            console.log(e)
            return null
        }
    }

    async getCourse(room){
        try{            
            let exam = await examsSchema.findOne({room})
            if(exam){
                return exam.course
            }
            else{
                return null
            }
        }
        catch(e){
            console.log(e)
            return null
        }
    }

    async setExam(course,room){
        try{
            let exam = await examsSchema.findOne({course})
            if(!exam){

                let e = new examsSchema({
                    course,
                    room
                })
                await e.save()
            }
        }
        catch(e){
            console.log(e)
        }

    }

    async removeExam(course){
        try{
            let exam = await examsSchema.findOne({course})
            if(exam){
                exam.remove()
            }            
        }
        catch(e){
            console.log(e)
        }
    }

    async addStudent(student,room){
        try{
            let exam = await examsSchema.findOne({room})
            if(exam){               
                console.log("Added student",student,"to exam")
                exam.students.push(student)
                await exam.save()                
            }            
        }
        catch(e){
            console.log(e)
        }   
    }

    verifyFirstTime(student,exam){
         if(exam.students.includes(student)){
             console.log("Student",student,"has already participated in this exam")
             return false
         } 
         else{
             return true
         }
    }
}

module.exports = new CurrentExams();