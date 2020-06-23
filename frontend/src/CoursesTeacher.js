import React from 'react'
import CourseForm from './CourseForm'
import ExamMaker from './ExamMaker'
import ExamHistory from './ExamHistory'
import janus from './Janus'
import Stream from './Stream'
import Summary from './Summary'
import update from 'react-addons-update';
import Fullscreen from "react-full-screen";
import {Grid, Container, Box, Card, CardContent, Button, Typography, Fab, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';

class CoursesTeacher extends React.Component{
    constructor(){
        super()
        this.state = {
            displayRoom: false,
            openForm : false,
            mystream : null,
            streams: {},
            isFull: false,
            isCreating: false,
            examCreation: null,
            currentTest: null,
            reports: {},
            openSummaryDialog: false,
            openExamHistoryDialog: false,
            history: []
        };
        this.closeForm = this.closeForm.bind(this);
        this.openForm = this.openForm.bind(this);
        this.destroyCourse = this.destroyCourse.bind(this);
        this.startExam = this.startExam.bind(this);
        this.manageTest = this.manageTest.bind(this);
        this.closeManageTest = this.closeManageTest.bind(this);
        this.destroyExam = this.destroyExam.bind(this);
        this.closeExam = this.closeExam.bind(this);
        this.fixOverflow = this.fixOverflow.bind(this);
        this.changeSize = this.changeSize.bind(this);
        this.swapView = this.swapView.bind(this);
        this.goFull = this.goFull.bind(this);
        this.closeSummaryDialog = this.closeSummaryDialog.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.closeExamHistoryDialog = this.closeExamHistoryDialog.bind(this);
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

    goFull() {
        this.setState({ 
            isFull: true 
        });
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
        await janus.publish('teacher')
        this.props.refresh(); //To make appear the "Stop exam" btn
        this.goFull();
        if(janus.mystream && !this.state.mystream){
            let mystream = {
                "media": janus.mystream['userMedia'],
                "bigscreen": true
            }

            this.setState({
                "mystream": mystream
            })
        }

        janus.on('subscribed', async (object) => {
            console.log("Subscribed")
            let res = await janus.onRemoteFeed(object)
            let user = res[0];
            let type = res[1];            

            //If another stream adds (screen or webcam) the views doesn't change
            if(!this.state.streams[user]){
                let stream = {
                    "media" : janus.streams[user][type].stream,
                    "bigscreen": false
                }
                this.setState(update(this.state,{
                    streams: {
                        [user]: {
                            $set: stream
                        }
                    }
                }))
            }
        })
        
        janus.on('leaving', async (object) => {
            var user = await janus.onLeavingFeed(object)
            let streams = this.state.streams;
            delete streams[user];
            this.setState({
                streams: streams
            })
        
        })
    }

    closeExam(){
        this.setState({
            displayRoom: false,
            mystream : null,
            streams: {}
        })
        janus.destroy(true);
        this.props.refresh()
    }

    async destroyExam(course){
        await janus.init(course)
        let reports = await janus.destroyExam(course);
        this.setState({
            reports: reports,
            openSummaryDialog: true
        })
        this.props.refresh()
    }

    manageTest(course){
        this.setState({
            isCreating: true,
            examCreation: course.name,
            currentTest: course.test || null
        })
    }

    closeManageTest(){
        this.setState({
            isCreating: false,
            examCreation: null,
            currentTest: null
        })
    }

    closeSummaryDialog(){
        this.setState({
            openSummaryDialog: false
        })
    }

    async getHistory(course){
        try{
            const requestOptions = {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "name": course
                }),
                credentials: 'include'
            };
            let response = await fetch("/api/courses/history", requestOptions);
            if(response){
                let result = await response.json();
                this.setState({
                    history: result.history,
                    openExamHistoryDialog: true,
                })
            }
        }
        catch(e){
            console.log(e)
        }
    }

    closeExamHistoryDialog(){
        this.setState({
            history: [],
            openExamHistoryDialog: false
        })
    }

    fixOverflow(hidden){
        let overflow = hidden ? "hidden" : "inherit";
        document.body.style.overflow = overflow
    }

    changeSize(streamID){        
        console.log("Printing streamID")
        console.log(streamID)
        console.log("Printing this.state.streams")
        console.log(this.state.streams)
        console.log("Printing this.state.mystream")
        console.log(this.state.mystream)
        if(streamID === null){
            Object.keys(this.state.streams).forEach((id) => {
                if(this.state.streams[id].bigscreen){
                    let stream = {
                        "media": this.state.streams[id].media,
                        "bigscreen": false
                    }
                    this.setState(update(this.state,{
                        mystream: {
                            ["bigscreen"]: {
                                $set: true
                            }
                        },
                        streams: {
                            [id]: {
                                $set: stream
                            }
                        }
                    }))
                }
            })
        }
        else{
            let stream = {
                "media": this.state.streams[streamID].media,
                "bigscreen": true
            }
            this.setState(update(this.state,{
                mystream: {
                    ["bigscreen"]: {
                        $set: false
                    }
                },
                streams: {
                    [streamID]: {
                        $set: stream
                    }
                }
            }))
        }
    }

    swapView(id){
        let type = this.state.streams[id].media === janus.streams[id]['userMedia'].stream ? 'displayMedia' : 'userMedia';
        if(janus.streams[id][type]){
            let streams = this.state.streams
            streams[id].media = janus.streams[id][type].stream
            this.setState({
                streams: streams
            })
        }
    }

    render(){
        var courses;
        if(this.props.courses.length>0){
            courses = this.props.courses.map((course,i) => {
                let matches = course.name.match(/\b(\w)/g)
                let acronym = matches.join('').toUpperCase()

                let stopExam;
                if(course.examActive){
                    stopExam = (
                        <Button className="course-btn course-btn-stop" onClick={() => this.destroyExam(course.name)}>
                            Stop exam
                        </Button>
                    )
                }

                let testTxt = course.test ? "Edit" : "Create";

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
                                <Button className="course-btn course-btn-make" onClick={() => this.manageTest(course)}>
                                    {testTxt} test
                                </Button>
                                <Button className="course-btn course-btn-start" onClick={() => this.startExam(course.name)}>
                                    Start exam
                                </Button>
                                {stopExam}
                                <Button className="course-btn course-btn-history" onClick={() => this.getHistory(course.name)}>
                                    History
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
                <Stream stream={this.state.mystream.media} bigscreen={this.state.mystream.bigscreen} changeSize={this.changeSize}/>
            )
        }

        var remoteStreams;
        if(Object.keys(this.state.streams) !== 0){
            remoteStreams = Object.keys(this.state.streams).map((stream,i) => {
                    return (
                        <Stream id={stream} stream={this.state.streams[stream].media} bigscreen={this.state.streams[stream].bigscreen} key={i} changeSize={this.changeSize} swapView={this.swapView}/>
                    )
            })
        }      

        var streams;
        if(this.state.displayRoom){
            this.fixOverflow(true);
            streams = (
                <Fullscreen enabled={this.state.isFull} onChange={isFull => this.setState({isFull})}>
                    <Box className="streams-box">
                        <IconButton aria-label="delete" onClick={this.closeExam} className="exam-btn-stop">
                            <CloseIcon />
                        </IconButton>
                        {localStream}
                        {remoteStreams}
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

            <CourseForm open={this.state.openForm} closeForm={this.closeForm} />

            <Summary open={this.state.openSummaryDialog} reports={this.state.reports} close={this.closeSummaryDialog} />

            <ExamMaker open={this.state.isCreating} close={this.closeManageTest} course={this.state.examCreation} test={this.state.currentTest}/>

            <ExamHistory open={this.state.openExamHistoryDialog} close={this.closeExamHistoryDialog} history={this.state.history} />

            <Container>
                {courses}
            </Container>
        </Box>
        )
    }
}
export default CoursesTeacher;