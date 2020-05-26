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

    setExam(course,room){
        if(!this.exams[course]){
            this.exams[course] = {
                "room": room
            } 
        }
    }
}

module.exports = new CurrentExams();