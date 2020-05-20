import React from 'react'
import Janus from './Janus'
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';


class Courses extends React.Component{
    start(){
        var janus = new Janus();
        janus.init()
        .then(() => {
            janus.publish()
        })
    }
    getFeeds(){
        var janus = new Janus();
        janus.init()
        .then(() => {
            janus.subscribe()
        })
        
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

    render(){       
        return (
        <Box className="course-box">
            <Button id="start" onClick={this.start}>Start</Button>
            <Button id="getFeeds" onClick={this.getFeeds}>getFeeds</Button>
            <video style={{"width":"320px", "height":"180px"}} id="remote1" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote2" autoPlay playsInline></video>
            <video style={{"width":"320px", "height":"180px"}} id="remote3" autoPlay playsInline></video>
            <Container>
                <Grid container>
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    AT
                                </Box>
                                <Box className="course-name">
                                    Applicazioni Telematiche
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    AT
                                </Box>
                                <Box className="course-name">
                                    Applicazioni Telematiche
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    AT
                                </Box>
                                <Box className="course-name">
                                    Applicazioni Telematiche
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    AT
                                </Box>
                                <Box className="course-name">
                                    Applicazioni Telematiche
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <Card className="course-card">
                            <CardContent>
                                <Box className="course-avatar">
                                    AT
                                </Box>
                                <Box className="course-name">
                                    Applicazioni Telematiche
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
        )
    }
}
export default Courses;