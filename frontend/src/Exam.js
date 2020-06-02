import React from 'react';
import {Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Button } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done';

class Question extends React.Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(ev){
        this.props.setAnswer(this.props.id,ev.target.value)
    }

    render(){
        return(
            <Card className="student-exam-card">
                <CardContent>
                    <Typography variant="h4">
                        {this.props.question}
                    </Typography>
                    <RadioGroup aria-label="gender" name="gender1" value={this.props.value || ""} onChange={this.handleChange}>
                        <FormControlLabel value={this.props.options[0]} control={<Radio />} label={this.props.options[0]} />
                        <FormControlLabel value={this.props.options[1]} control={<Radio />} label={this.props.options[1]} />
                        <FormControlLabel value={this.props.options[2]} control={<Radio />} label={this.props.options[2]} />
                        <FormControlLabel value={this.props.options[3]} control={<Radio />} label={this.props.options[3]} />
                    </RadioGroup>
                </CardContent>
            </Card>
        )
    }
}

class Exam extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            "answers": {},
            "activeQuestion": null
        }
        this.setAnswer = this.setAnswer.bind(this);
        this.changeActiveQuestion = this.changeActiveQuestion.bind(this);
        this.completeExam = this.completeExam.bind(this);
    }

    componentDidMount(){
        let activeQuestion = Object.keys(this.props.test)[0];
        this.setState({
            "activeQuestion": activeQuestion
        })
        
        let answers = {};
        Object.keys(this.props.test).forEach(key => {
            answers[key] = ""
        })
        this.setState({
            answers: answers
        })
    }

    changeActiveQuestion(key){
        this.setState({
            "activeQuestion": key
        })
    }

    setAnswer(key,answer){
        let answers = this.state.answers;
        let id = this.props.test[key].id
        answers[id] = answer;

        this.setState({
            answers: answers
        })
    }

    completeExam(){
        this.props.completeExam(this.state.answers)
    }

    render(){
        const indexes = Object.keys(this.props.test).map((key,i) => {
            let className = "student-exam-index";
            if(this.state.activeQuestion && this.state.activeQuestion === key){
                className = "student-exam-index student-exam-active-index"
            }
            return (
                <Box className={className} key={key} onClick={() => this.changeActiveQuestion(key)}>
                    {i+1}
                </Box>
            )
        })
        var question
        if(this.state.activeQuestion){
            if(this.state.activeQuestion !== "-1"){
                question = (<Question key={this.state.activeQuestion} id={this.state.activeQuestion} question={this.props.test[this.state.activeQuestion].question} options={this.props.test[this.state.activeQuestion].options} value={this.state.answers[this.props.test[this.state.activeQuestion].id]} setAnswer={this.setAnswer} />)
            }
            else{
                question = (
                    <Card className="student-exam-card">
                        <CardContent>
                            <Typography variant="h4" align="center">
                                Well well, you reached the end of the test.
                            </Typography>
                            <Typography variant="subtitle1" align="center">
                                If you are sure press the button, otherwise you can go back and change your answers.
                            </Typography>
                            <Button className="student-exam-complete-btn" onClick={this.completeExam}>
                                Complete exam
                            </Button>
                        </CardContent>
                    </Card>
                )
            }
        }      

        let doneIndexClass = this.state.activeQuestion === "-1" ? "student-exam-index student-exam-active-index" : "student-exam-index";

        return (
            <Box className="student-exam-box">
                <Box className="student-exam-index-box">
                    {indexes}
                    <Box className={doneIndexClass} onClick={() => this.changeActiveQuestion("-1")}>
                        <DoneIcon className="student-exam-complete-index" />
                    </Box>
                </Box>
                {question}
            </Box>
        )
    }
}
export default Exam;