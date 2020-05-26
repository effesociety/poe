import React from 'react'
import CourseForm from './CourseForm'
import janus from './Janus2'
import Stream from './Stream'
import {Grid, Container, Box, Card, CardContent, Button, Typography, Fab} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

class CoursesTeacher extends React.Component{
    constructor(){
        super()
        this.state = {
            openForm : false,
            mystream : null
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
        await janus.init(course)
        await janus.publish()
        if(janus.mystream && !this.state.mystream){
            this.setState({
                "mystream": janus.mystream
            })
        }
    }

    //Test functions
    getFeeds(){
        janus.subscribe()
        
        setInterval(() => {
            console.log("Ciao")
            console.log(janus.streams)
            console.log(Object.keys(janus.streams).length)
            if(Object.keys(janus.streams).length===1){
                document.getElementById('remote1').srcObject = janus.streams[Object.keys(janus.streams)[0]];
            }
            else if(Object.keys(janus.streams).length===2){
                document.getElementById('remote1').srcObject = janus.streams[Object.keys(janus.streams)[0]];
                document.getElementById('remote2').srcObject = janus.streams[Object.keys(janus.streams)[1]];
            }
            else if(Object.keys(janus.streams).length===3){
                document.getElementById('remote1').srcObject = janus.streams[Object.keys(janus.streams)[0]];
                document.getElementById('remote2').srcObject = janus.streams[Object.keys(janus.streams)[1]];
                document.getElementById('remote3').srcObject = janus.streams[Object.keys(janus.streams)[2]];
            }
            else{
                console.log("Tutto rotto!")            
            }
        },5000)
    }
    //End test functions

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

        var prova;
        if(this.state.mystream){
            prova = (<Stream stream={this.state.mystream} />)
        }

        
        return (
        <Box className="course-box">
            <Button id="start" onClick={this.start}>Start</Button>
            <Button id="getFeeds" onClick={this.getFeeds}>getFeeds</Button>
            <video style={{"width":"320px", "height":"180px"}} id="remote1" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote2" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote3" autoPlay playsInline></video>

            {prova}

            <CourseForm open={this.state.openForm} closeForm={this.closeForm} />

            <Container>
                {courses}
            </Container>
        </Box>
        )
    }
}
export default CoursesTeacher;