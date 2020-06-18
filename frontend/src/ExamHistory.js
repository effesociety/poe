import React from 'react';
import {Dialog, Typography, Grid, Card, CardContent, Button, TextField, Box, Container} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {ReactComponent as Good} from './images/good.svg';
import {ReactComponent as Bad} from './images/bad.svg';

class ExamQuestion extends React.Component{
    render(){
        
        const options = this.props.question.options.map((option,i) => {
            let className = "make-exam-textfield";
            let label = "Wrong answer"
            if(option === this.props.answer.correctAnswer){
                className = "make-exam-textfield make-exam-correct-answer";
                label = "Correct answer"
            }
            if(option === this.props.answer.yourAnswer && option !== this.props.answer.correctAnswer){
                className = "make-exam-textfield make-exam-wrong-answer";
                label = "Your answer"
            }
            return (
                <TextField value={option} key={i} className={className} id="outlined-basic" label={label} variant="outlined" fullWidth disabled/>
            )
        })

        return (
            <Box className="make-exam-question">
                <Typography className="make-exam-h5" variant="h5">Question #{this.props.num+1}</Typography>
                <TextField value={this.props.question.question || ""} className="make-exam-textfield" id="outlined-basic" label="Question" variant="outlined" fullWidth disabled/>
                <Typography variant="h6">Answers</Typography>
                {options}
            </Box>
        )
    }
}

class ExamHistory extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showExamDetails: false,
            showStudentDetails: false,
            exam: null,
            student: null
        }
        this.onClose = this.onClose.bind(this);
        this.setExam = this.setExam.bind(this);
        this.setStudent = this.setStudent.bind(this);
        this.backToHistory = this.backToHistory.bind(this);
        this.backToStudents = this.backToStudents.bind(this);
    }

    onClose(){
        this.setState({
            showExamDetails: false,
            showStudentDetails: false,
            exam: null,
            student: null
        })
        this.props.close()
    }

    setExam(index){
        this.setState({
            exam: index,
            showExamDetails: true
        })
    }

    setStudent(student){
        this.setState({
            student: student,
            showExamDetails: false,
            showStudentDetails: true
        })
    }

    backToHistory(){
        this.setState({
            student: null,
            exam: null,
            showExamDetails: false,
            showStudentDetails: false,
        })
    }

    backToStudents(){
        this.setState({
            student: null,
            showExamDetails: true,
            showStudentDetails: false,
        })        
    }

    render(){
        let body;
        let heading;
        let goBack;

        if(this.props.history.length === 0){
            heading = (
                <Typography variant="h4" align="center" className="exam-history-h4">
                    There are no exams!
                </Typography>
            )
        }

        if(this.state.showStudentDetails){
            goBack = (
                <ArrowBackIcon className="exam-history-goback" onClick={this.backToStudents}/>    
            )
            heading = (
                <Typography variant="h2" align="center">
                The score of <strong>{this.state.student}</strong> is
            </Typography>            
            )

            let questions = Object.keys(this.props.history[this.state.exam].students[this.state.student].responses).map((key,id) => {
                const question = this.props.history[this.state.exam].students[this.state.student].responses[key].question;
                const answer = this.props.history[this.state.exam].students[this.state.student].responses[key].answer;
                return (
                    <ExamQuestion key={key} num={id} question={question} answer={answer}/>
                )
            })
            const correctAnswers = this.props.history[this.state.exam].students[this.state.student].report.correctAnswers;
            const answers = this.props.history[this.state.exam].students[this.state.student].report.answers;
            let percentage = correctAnswers / answers * 100;
            let icon = percentage >= 50 ? <Good className="results-icon" /> : <Bad className="results-icon" />
            let report = (
                <Typography variant="h2" align="center">
                    Questions: {answers} - Correct: {correctAnswers}
                </Typography>
            )

            body = (
                <Container>
                    <Typography variant="h1" align="center">
                        {percentage}%
                    </Typography>
                    {icon}
                    {report}
                    {questions}
                </Container>
            )
        }
        else if(this.state.showExamDetails){
            goBack = (
                <ArrowBackIcon className="exam-history-goback" onClick={this.backToHistory}/>    
            )
            heading = (
                <Typography variant="h4" align="center" className="exam-history-h4">
                    Here are the students who took the exam
                </Typography>               
            )
            let students = Object.keys(this.props.history[this.state.exam].students).map((student) => {
                return (
                    <Grid item className="exam-history-grid-item">
                        <Card key={student}>
                            <CardContent>
                                <Typography align="center" variant="subtitle1">
                                    <strong>{student}</strong>
                                </Typography>
                                <Typography align="center" variant="subtitle1">
                                    Result: {this.props.history[this.state.exam].students[student].report.correctAnswers}/{this.props.history[this.state.exam].students[student].report.answers}
                                </Typography>
                                <Button className="exam-history-btn" onClick={() => this.setStudent(student)}>
                                    Full report
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })
            body = (
                <Grid container className="exam-history-grid-container">
                    {students}
                </Grid>
            )
        }
        else if(this.props.history.length > 0){
            heading = (
                <Typography variant="h4" align="center" className="exam-history-h4">
                    Here is the history for this exam
                </Typography>               
            )
            let history = this.props.history.map((exam,index) => {
                const date = new Date(exam.timestamp).toLocaleString();
                return (
                    <Grid item className="exam-history-grid-item">
                        <Card key={exam}>
                            <CardContent>
                                <Typography variant="subtitle1" align="center">
                                    <strong>{date}</strong>
                                </Typography>
                                <Typography variant="subtitle1" align="center">
                                    Num. of students: {Object.keys(this.props.history[index].students).length}
                                </Typography>
                                <Button className="exam-history-btn" onClick={() => this.setExam(index)}>
                                    Details
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })
            body = (
                <Grid container className="exam-history-grid-container">
                    {history}
                </Grid>
            )
        }
        

        

        return(
            <Dialog open={this.props.open} onClose={this.onClose} fullWidth={true}
            maxWidth="lg" aria-labelledby="form-dialog-title" className="exam-history-dialog">
                {goBack}
                {heading}
                {body}
            </Dialog>
        )
    }
}

export default ExamHistory;