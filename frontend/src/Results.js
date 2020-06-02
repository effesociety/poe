import React from 'react'
import {Box, Dialog, Container, Typography, TextField} from '@material-ui/core'
import {ReactComponent as Good} from './images/good.svg'
import {ReactComponent as Bad} from './images/bad.svg'

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

class Results extends React.Component{
    render(){
        let questions;
        let percentage;
        let report;
        let icon;
        if(this.props.results){
            questions = Object.keys(this.props.results.test).map((key,id) => {
                return (<ExamQuestion key={key} num={id} question={this.props.results.test[key].question} answer={this.props.results.test[key].answer}/>)
            })
            percentage = this.props.results.report.correctAnswers / this.props.results.report.answers * 100;
            icon = percentage >= 50 ? <Good className="results-icon" /> : <Bad className="results-icon" />
            report = (
                <Typography variant="h2" align="center">
                    Questions: {this.props.results.report.answers} - Correct: {this.props.results.report.correctAnswers}
                </Typography>)             
        }


        return (
            <Dialog open={this.props.open} onClose={this.props.close} fullWidth={true}
            maxWidth="md" aria-labelledby="form-dialog-title">
                <Container>
                    <Typography variant="h2" align="center">
                        Your score is
                    </Typography>
                    <Typography variant="h1" align="center">
                        {percentage}%
                    </Typography>
                    {icon}
                    {report}
                    {questions}
                </Container>
            </Dialog>
        )
    }
}

export default Results;