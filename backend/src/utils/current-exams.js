class CurrentExams{
    constructor(){
        this.exams = {}
    }

    getExam(course){
        console.log("Getting exam for course:", course)

        if(this.exams[course]){
            console.log("Exam found for course:", course)
            return this.exams[course];
        }
        else{
            console.log("Exam NOT found for course:", course)
            return null;
        }
    }

    getCourse(room){
        const c = Object.keys(this.exams).map(course => {
            if(this.exams[course].room === room){
                return course
            }
        })
        return c;
    }

    setExam(course,room){
        if(!this.exams[course]){
            this.exams[course] = {
                "room": room
            } 
        }
    }

    removeExam(course){
        delete this.exams[course];
    }
}

module.exports = new CurrentExams();