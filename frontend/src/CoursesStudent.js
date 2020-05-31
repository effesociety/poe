import React from 'react'
import janus from './Janus'
import Stream from './Stream'
import Fullscreen from "react-full-screen";
import {Grid, Container, Box, Card, CardContent, Button, Typography, IconButton} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

class CoursesStudent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            displayRoom: false,
            teacherStream: null,
            isFull: false
        }
        this.enroll = this.enroll.bind(this);
        this.startExam = this.startExam.bind(this);
        this.closeExam = this.closeExam.bind(this);
        this.fixOverflow = this.fixOverflow.bind(this);
        this.goFull = this.goFull.bind(this);
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
              this.props.refresh(true);
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
        })

        await janus.init(course)
        await janus.publish()
       
        janus.on('subscribed', async (object) => {
            console.log("Subscribed event")
            var id = await janus.onRemoteFeed(object)
            this.setState({
                teacherStream: janus.streams[id]
            })
        })

        janus.on('leaving', async (object) => {
            await janus.onLeavingFeed(object)
            this.setState({
                teacherStream: null
            })
        })
    }

    goFull() {
        this.setState({ 
            isFull: true 
        });
    }

    closeExam(){
        this.setState({
            displayRoom: false,
            mystream : null,
            streams: {}
        })
        janus.destroy();
    }

    fixOverflow(hidden){
        let overflow = hidden ? "hidden" : "inherit";
        document.body.style.overflow = overflow
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
                        <Typography variant="paragraph">
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
            otherCourses = this.props.otherCourses.map((course) => {
                let matches = course.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()
                return (
                    <Grid item sm={12} md={3}>
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
                <Stream stream={this.state.teacherStream} bigscreen={true} />
            )
        }

        var streams;
        if(this.state.displayRoom){
            this.fixOverflow(true)
            streams = (
                <Fullscreen enabled={this.state.isFull} onChange={isFull => this.setState({isFull})}>
                    <Box className="streams-box">
                        <IconButton aria-label="delete" onClick={this.closeExam} className="exam-btn-stop">
                            <CloseIcon />
                        </IconButton>
                        {teacherStream}
                    </Box>
                </Fullscreen>
            )
        }
        else{
            this.fixOverflow(false)
        }
               
        return (
        <Box className="course-box">
            {streams}

            <Container>
                {courses}
                {otherCourses}
            </Container>
        </Box>
        )
    }
}
export default CoursesStudent;