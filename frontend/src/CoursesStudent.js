import React from 'react'
import Janus from './Janus'
import {Grid, Container, Box, Card, CardContent, Button, Typography} from '@material-ui/core';

class CoursesStudent extends React.Component{
    constructor(props){
        super(props);
        this.enroll = this.enroll.bind(this)
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

    //Test functions
    start(){
        var janus = new Janus();
        janus.init()
        .then(() => {
            janus.publish()
        })
    }
    //End test functions

    render(){
        var courses = (<div></div>);
        if(this.props.courses.length>0){
            courses = this.props.courses.map((course) => {
                let matches = course.name.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()
                return (
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    {acronym}
                                </Box>
                                <Box className="course-name">
                                    {course.name}
                                </Box>
                                <Button className="course-btn course-btn-start">
                                    Start exam
                                </Button>
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

               
        return (
        <Box className="course-box">
            <Button id="start" onClick={this.start}>Start</Button>
            <Button id="getFeeds" onClick={this.getFeeds}>getFeeds</Button>
            <video style={{"width":"320px", "height":"180px"}} id="remote1" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote2" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote3" autoPlay playsInline></video>
            <Container>
                {courses}
                {otherCourses}
            </Container>
        </Box>
        )
    }
}
export default CoursesStudent;