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
        let exam = await this.getExam(course)
        if(!exam){
            let e = new examsSchema({
                course,
                room,
                stopping: false,
            })
            await e.save()
        }
    }

    async removeExam(course){    
        let exam = await this.getExam(course)
        if(exam){
            exam.remove()
        }       
    }

    async addStudent(student,room){
        try{
            let exam = await examsSchema.findOne({room})
            if(exam){  
                let data = {}
                data[student] = {
                    'completed': false,
                    'report': null    
                }
                exam.students = Object.assign(data, exam.students)
                await exam.save()
                console.log("Added student",student,"to exam")            
            }            
        }
        catch(e){
            console.log(e)
        }   
    }

    verifyFirstTime(student,exam){
        if(exam.students){
            if(student in exam.students){
                console.log("Student",student,"has already participated in this exam")
                return false
            } 
            else{
                return true
            }
        }
        else{
            return true
        }
    }

    async completeExam(course,student,report,response){
        let exam = await this.getExam(course)
        if(exam && exam.students){
            if(student in exam.students){
                console.log("Student", student, "complete exam")
                let data = {}
                data[student] = {
                    'completed': true
                }
                if(report){
                    data[student] = Object.assign({"report": report}, data[student])
                }
                if(response){
                    data[student] = Object.assign({"response": response}, data[student])
                }
                delete exam.students[student]
                exam.students = Object.assign(data, exam.students)
                await exam.save()
            }
        }
    }

    async stopExam(course){
        let exam = await this.getExam(course)
        if(exam){
            console.log("[",course,"] Exam stopped")
            exam.stopping = true
            await exam.save()
        }        
    }

    getReports(exam){
        let reports = {}
        if(exam && exam.students){
            for(let i = 0; i<Object.keys(exam.students).length; i++){
                if(exam.students[i].completed){
                    let key = Object.keys(exam.students)[i]
                    let data = {}
                    data[key] = exam.students[key].report
                    reports = Object.assign(data,reports)
                }
            }
            return reports
        }
    }

    async getNumStudents(course,clients){
        let students = 0       
        let exam = await this.getExam(course)
        if(exam && exam.students){
            for(let i = 0; i<Object.keys(exam.students).length; i++){
                let key = Object.keys(exam.students)[i]
                if(!exam.students[key].completed && clients.includes(key)){
                    students += 1
                }
            }
            return students
        }
        else{
            return 0
        }           
    }

    async getStopping(course){
        let exam = await this.getExam(course)
        return exam.stopping
    }
}

module.exports = new CurrentExams();