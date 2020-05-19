import React from 'react'
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

class Courses extends React.Component{
    render(){
        return (
        <Box className="course-box">
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