import React from "react";
import { Box, Dialog, Typography, Fab, TextField, Container, Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

class ExamQuestion extends React.Component{
  updateAnswer(ev, item){
    let question = this.props.question;
    let options = this.props.options;

    if(item === "question"){
      question = ev.target.value
    }
    else{
      options[item] = ev.target.value
    }
    
    this.props.setQuestion(this.props.id,question,options)
  }

  render(){
    return (
      <Box className="make-exam-question">
          <Typography className="make-exam-h5" variant="h5">Question #{this.props.num+1}</Typography>
          <Fab size="small" color="primary" aria-label="add" className="make-exam-remove-question" onClick={() => this.props.removeQuestion(this.props.id)}>
                <RemoveIcon />
            </Fab>
          <TextField value={this.props.question || ""} className="make-exam-textfield" id="outlined-basic" label="Question" variant="outlined" fullWidth onChange={(ev) => this.updateAnswer(ev,"question")}/>
          <Typography variant="h6">Answers</Typography>
          <TextField value={this.props.options[0] || ""} className="make-exam-textfield make-exam-correct-answer" id="outlined-basic" label="Correct answer" variant="outlined" fullWidth onChange={(ev) => this.updateAnswer(ev,0)} color="secondary"/>
          <TextField value={this.props.options[1] || ""} className="make-exam-textfield make-exam-wrong-answer" id="outlined-basic" label="Wrong answer #1" variant="outlined" fullWidth onChange={(ev) => this.updateAnswer(ev,1)}/>
          <TextField value={this.props.options[2] || ""} className="make-exam-textfield make-exam-wrong-answer" id="outlined-basic" label="Wrong answer #2" variant="outlined" fullWidth onChange={(ev) => this.updateAnswer(ev,2)}/>
          <TextField value={this.props.options[3] || ""} className="make-exam-textfield make-exam-wrong-answer" id="outlined-basic" label="Wrong answer #3" variant="outlined" fullWidth onChange={(ev) => this.updateAnswer(ev,3)}/>

      </Box>
    )
  }

}

class ExamMaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "questions": {},
      "answers": {}
    }
    this.addQuestion = this.addQuestion.bind(this);
    this.uploadExam = this.uploadExam.bind(this);
    this.setQuestion = this.setQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.uploadExam = this.uploadExam.bind(this);
    this.onEnter = this.onEnter.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  onEnter(){
    if(this.props.test){
      let questions = Object.assign({}, this.props.test.questions);
      let answers = Object.assign({}, this.props.test.answers);
      this.setState({
        "questions": questions,
        "answers": answers
      })
    }
    else{
      this.addQuestion()
    }
  }

  onClose(){
    this.setState({
      "questions": {},
      "answers": {}
    })
    this.props.close()
  }

  addQuestion(){
    let questions = this.state.questions;
    let answers = this.state.answers;

    const keys = Object.keys(this.state.questions).map((key) => {return key})
    const newID = keys.length > 0 ? Math.max(...Object.keys(this.state.questions))+1 : 0;

    questions[newID] = {"question": "", "options": []}
    answers[newID] = ""

    this.setState({
      questions: questions,
      answers: answers
    })

  }

  setQuestion(id,question,options){
    let q = this.state.questions;
    let a = this.state.answers;

    q[id] = {
      "question": question,
      "options": options
    }
    a[id] = options[0] //By default the answer is the first option
    this.setState({
      questions: q,
      answers: a
    })
  }

  removeQuestion(id){
    let questions = this.state.questions;
    let answers = this.state.answers;
    delete questions[id];
    delete answers[id]

    this.setState({
      questions: questions,
      answers: answers
    })
  }

  async uploadExam(){
    let body = {
      questions: this.state.questions, //The questions with ALL the answers
      answers: this.state.answers, //The correct answers
      name: this.props.course //This is the course
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };
    try{
      let response = await fetch("/api/courses/upload", requestOptions);
      if(response.status === 200){
        this.props.close()
      }
      else{
        this.props.close()
        alert("An error occurred");
      }
    } 
    catch (err) {
      alert("An error occurred");
      console.log("An error occurred")
      console.log(err);
    }
  }

  render() {
    const questions = Object.keys(this.state.questions).map((key,id) => {
      return (<ExamQuestion key={key} id={key} num={id} question={this.state.questions[key].question} options={this.state.questions[key].options} setQuestion={this.setQuestion} removeQuestion={this.removeQuestion} />)
    })

    return (
      <div>
        <Dialog open={this.props.open} onEnter={this.onEnter} onClose={this.onClose} fullWidth={true}
        maxWidth="md" aria-labelledby="form-dialog-title">
          <Container>

            <Typography variant="h4" align="center" className="make-exam-h4">
              Create an exam from scratch
            </Typography>
            <Typography variant="subtitle1" align="center">
              Here you can create an exam from scratch! By <strong>default</strong> the first answer you provide will be taken as the correct one
            </Typography>

            {questions}

            <Fab color="primary" aria-label="add" className="make-exam-plus-question" onClick={this.addQuestion}>
                <AddIcon />
            </Fab>

            <Button className="make-exam-btn" onClick={this.uploadExam}>
              Upload exam
            </Button>

          </Container>
        </Dialog>
      </div>
    );
  }
}

export default ExamMaker;
