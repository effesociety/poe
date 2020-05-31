import React from 'react';
import {Box, Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'

class Question extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            value: ""
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(){
        this.setState({
            value: this.props.options[0]
        })
    }

    handleChange(ev){
        this.setState({
            value: ev.target.value
        })
        this.props.setAnswer(this.props.id,ev.target.value)
    }

    render(){
        return(
            <Card className="student-exam-card">
                <CardContent>
                    <Typography variant="h4">
                        {this.props.question}
                    </Typography>
                    <RadioGroup aria-label="gender" name="gender1" value={this.state.value} onChange={this.handleChange}>
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
            "answers": {}
        }
        this.setAnswer = this.setAnswer.bind(this);
    }

    setAnswer(id,answer){
        console.log(id)
        console.log(answer)
    }

    render(){
        console.log(this.props.test)
        const questions = Object.keys(this.props.test).map(key => {
            return (
                <Question key={key} id={key} question={this.props.test[key].question} options={this.props.test[key].options} setAnswer={this.setAnswer} />
            )
        })

        return (
            <Box className="student-exam-box">
                {questions}
            </Box>
        )
    }
}
export default Exam;