import React from 'react'
import janus from './Janus'
import Stream from './Stream'
import Exam from './Exam'
import Results from './Results'
import Fullscreen from "react-full-screen";
import {Grid, Container, Box, Card, CardContent, Button, Typography, Dialog, IconButton} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

class CoursesStudent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            displayRoom: false,
            teacherStream: null,
            isFull: false,
            openExamDialog: false,
            openResultsDialog: false,
            overflow: "inherit",
            test: null,
            results: null,
            forceComplete: false
        }
        this.enroll = this.enroll.bind(this);
        this.startExam = this.startExam.bind(this);
        this.closeExam = this.closeExam.bind(this);
        this.closeResultsDialog = this.closeResultsDialog.bind(this);
        this.fixOverflow = this.fixOverflow.bind(this);
        this.goFull = this.goFull.bind(this);
        this.changeFullScreen = this.changeFullScreen.bind(this);
        this.completeExam = this.completeExam.bind(this)
    }

    async enroll(course){
        this.setState({
            buttonDisabled: true,
          });
          try {
            const requestOptions = {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "name": course
              })
            };
            let response = await fetch("/api/courses/enroll", requestOptions);
            if(response.status === 200){
              this.props.refresh();
            }
            else{
              alert("An error occurred");
            }
          } 
          catch (err) {
            alert("An error occurred");
            console.log("An error occurred")
            console.log(err);
          }        
    }

    async startExam(course){
        this.setState({
            displayRoom: true
        }, () => {
           this.setState({
               isFull: true,
               openExamDialog: false
           }, async () => {
                await janus.init(course)
                let test = await janus.publish('student')
                this.setState({
                    "test": test
                })
           }) 
        })


        
        //this.goFull();
        janus.on('subscribed', async (object) => {
            console.log("Subscribed event")
            let res = await janus.onRemoteFeed(object)
            let user = res[0];
            let type = res[1];
            if(!this.state.teacherStream){
                this.setState({
                    teacherStream: janus.streams[user][type].stream
                })
            }
            
        })

        janus.on('leaving', async (object) => {
            await janus.onLeavingFeed(object)
            this.setState({
                teacherStream: null
            })
        })

        janus.on('forceComplete', () => {
            this.setState({
                forceComplete: true
            })
        })
    }

    goFull() {
        this.setState({
            displayRoom: true, 
            isFull: true,
            openExamDialog: false
        });
    }

    changeFullScreen(isFull){
        console.log("CHANGE FULL SCREEN FN")
        this.setState({
            isFull: isFull
        })
        if(!isFull){
            this.setState({
                openExamDialog: true
            })
            this.startCountdown();
        }
    }

    startCountdown(){
        this.setState({
            timeLeft: 10
        })
        const countdownID = setInterval(() => {
            if(this.state.timeLeft <= 0){
                this.closeExam();
                clearInterval(countdownID)
            }
            else{
                this.setState({
                    timeLeft: this.state.timeLeft-1
                })
            }
        },1000)
        this.setState({
            countdownID: countdownID
        })
    }

    closeExam(){
        this.setState({
            displayRoom: false,
            mystream : null,
            streams: {},
            openExamDialog: false,
            test: null,
        })
        this.fixOverflow(false)
        janus.destroy(true);
        this.props.refresh()
    }

    closeResultsDialog(){
        this.setState({
            openResultsDialog: false
        })
        this.fixOverflow(false)
    }

    completeExam(answers){
        janus.completeExam(answers)

        janus.on('completed', (results) => {
            janus.destroy(true);
            this.props.refresh();
            this.setState({
                displayRoom: false,
                mystream : null,
                streams: {},
                openExamDialog: false,
                openResultsDialog: true,
                results: results
            })
        })
    }

    fixOverflow(hidden){
        let overflow = hidden ? "hidden" : "inherit";
        this.setState({
            overflow: overflow
        })
        document.body.style.overflow = this.state.overflow
    }

    render(){
        var courses = (<div></div>);
        if(this.props.courses.length>0){
            courses = this.props.courses.map((course,i) => {
                let matches = course.name.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()
                
                let startExam;
                if(course.examActive){
                    startExam = (
                        <Button className="course-btn course-btn-start" onClick={() => this.startExam(course.name)}>
                            Start exam
                        </Button>
                    )
                }
                else{
                    startExam = (
                        <Typography variant="subtitle1">
                            There are no active exams for this course at this time
                        </Typography>
                    )
                }

                return (
                    <Grid item sm={12} md={3} key={i}>
                        <Card className="course-card">
                            <CardContent align="center">
                               <Box className="course-avatar">
                                    {acronym}
                                </Box>
                                <Box className="course-name">
                                    {course.name}
                                </Box>
                                {startExam}
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })
            courses = (
            <Box style={{"marginBottom": "30px"}}>
                <Typography variant="h5" className="courses-title">
                    Your courses
                </Typography>
                <Grid container>
                    {courses}
                </Grid>
            </Box>
            )
        }

        var otherCourses= (<div></div>);
        if(this.props.otherCourses.length>0){
            otherCourses = this.props.otherCourses.map((course,i) => {
                let matches = course.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()
                return (
                    <Grid key={i} item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    {acronym}
                                </Box>
                                <Box className="course-name">
                                    {course}
                                </Box>
                                <Button className="course-btn course-btn-start" onClick={() => this.enroll(course)}>
                                    Enroll
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })
            otherCourses = (
                <Box>
                    <Typography variant="h5" className="courses-title">
                        Other courses
                    </Typography>
                    <Grid container>
                        {otherCourses}
                    </Grid>                   
                </Box>
            )           
        }

        var teacherStream;
        if(this.state.teacherStream){
            teacherStream = (
                <Stream stream={this.state.teacherStream} bigscreen={false} />
            )
        }

        var exam;
        if(this.state.test){
            exam = (<Exam test={this.state.test} completeExam={this.completeExam} forceComplete={this.state.forceComplete}/>)
        }

        var streams;
        if(this.state.displayRoom){
            streams = (
                <Fullscreen enabled={this.state.isFull} onChange={this.changeFullScreen}>
                    <Box className="streams-box">
                        {teacherStream}
                        <IconButton aria-label="delete" onClick={this.closeExam} className="exam-btn-stop-student">
                            <CloseIcon />
                        </IconButton>
                        {exam}
                    </Box>
                </Fullscreen>
            )
        }
               
        return (
        <Box className="course-box">
            <Dialog open={this.state.openExamDialog} fullWidth={true} maxWidth="sm">
                <Container>
                    <Typography variant="h4" align="center" className="fullscreen-dialog-h4">
                        You cannot disable fullscreen mode!
                    </Typography>
                    <Typography variant="h5" align="center">
                        If you decide to disable it the exam will be canceled, you have {this.state.timeLeft} seconds left.
                    </Typography>
                    <Button onClick={() => {
                        clearInterval(this.state.countdownID); 
                        this.goFull()
                    }} className="fullscreen-dialog-btn fullscreen-dialog-btn-left">
                        Go back to fullScreen
                    </Button>
                    <Button onClick={this.closeExam} className="fullscreen-dialog-btn fullscreen-dialog-btn-right">
                        I know what I'm doing
                    </Button>
                </Container>
            </Dialog>
            
            {streams}

            <Results open={this.state.openResultsDialog} results={this.state.results} close={this.closeResultsDialog} />

            <Container>
                {courses}
                {otherCourses}
            </Container>
        </Box>
        )
    }
}
export default CoursesStudent;