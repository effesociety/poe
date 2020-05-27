import React from 'react'
import CourseForm from './CourseForm'
import janus from './Janus2'
import Stream from './Stream'
import update from 'react-addons-update';
import {Grid, Container, Box, Card, CardContent, Button, Typography, Fab} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

class CoursesTeacher extends React.Component{
    constructor(){
        super()
        this.state = {
            displayRoom: false,
            openForm : false,
            mystream : null,
            streams: {}
        };
        this.closeForm = this.closeForm.bind(this);
        this.openForm = this.openForm.bind(this);
        this.destroyCourse = this.destroyCourse.bind(this);
        this.startExam = this.startExam.bind(this);
    }

    closeForm(refresh){
        this.setState({
            openForm: false
        })
        if(refresh){
            this.props.refresh()
        }
    }

    openForm(){
        this.setState({
            openForm: true
        })
    }

    async destroyCourse(course){
          try {
            const requestOptions = {
              method: "DELETE",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "name": course
              })
            };
            let response = await fetch("/api/courses/destroy", requestOptions);
            if(response.status === 200){
              this.closeForm(true);
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
        if(janus.mystream && !this.state.mystream){
            this.setState({
                "mystream": janus.mystream
            })
        }
    
        console.log(janus)

        janus.on('subscribed', (object) => {
            janus.onRemoteFeed2(object)
            .then((id)=> {
                this.setState(update(this.state,{
                    streams: {
                        [id]: {
                            $set: janus.streams[id]
                        }
                    }
                }))
            })
        })    
    }

    render(){
        var courses;
        if(this.props.courses.length>0){
            courses = this.props.courses.map((course,i) => {
                let matches = course.name.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()
                return (
                    <Grid item sm={12} md={3} key={i}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    {acronym}
                                </Box>
                                <Box className="course-name">
                                    {course.name}
                                </Box>
                                <Button className="course-btn course-btn-cancel" onClick={() => this.destroyCourse(course.name)}>
                                    Delete course
                                </Button>
                                <Button className="course-btn course-btn-start" onClick={() => this.startExam(course.name)}>
                                    Start exam
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })
            courses = (
                <Grid container>
                    {courses}
                    <Grid item sm={12} md={3} align="center">
                        <Fab color="primary" aria-label="add" className="plus-fab" onClick={this.openForm}>
                            <AddIcon />
                        </Fab>
                    </Grid>
                </Grid>
            )
        }
        else{
            courses = (
                <Grid container>
                    <Grid item sm={12} md={12}>
                        <Card className="course-card">
                            <CardContent>
                                <Typography variant="h5" align="center">
                                    Here will be displayed all your courses. Unfortunately for now you haven't created one yet.
                                    What are you waiting for? Let's create one!
                                </Typography>
                                <Button className="course-btn course-btn-create" onClick={this.openForm}>
                                    Create a course
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )
        }


        var localStream;
        if(this.state.mystream){
            localStream = (
                <Grid item>
                    <Stream stream={this.state.mystream} />
                </Grid>
            )
        }

        var remoteStreams;
        if(Object.keys(this.state.streams) !== 0){
            remoteStreams = Object.values(this.state.streams).map((stream,i) => {
                    return (
                        <Grid item>
                            <Stream stream={stream} key={i} />
                        </Grid>
                    )
            })
        }
        var streams;
        if(this.state.displayRoom){
            streams = (
                <Box className="streams-box">
                    <Grid container className="streams-container">
                        {localStream}
                        {remoteStreams}
                    </Grid>
                </Box>
            )
        }




        
        return (
        <Box className="course-box">

            {streams}

            <CourseForm open={this.state.openForm} closeForm={this.closeForm} />

            <Container>
                {courses}
            </Container>
        </Box>
        )
    }
}
export default CoursesTeacher;