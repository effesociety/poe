import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from "@material-ui/core/Typography";
import 'animate.css/animate.css'

//import Sample1 from './images/sample1.jpg';
import Sample2 from './images/sample2.jpg';
import Sample3 from './images/sample3.jpg';


class Info extends React.Component{
    render(){
        return (
            <Container className="info">
                <Card className="animate__animated animate__slideInUp">
                    <CardContent className="info-card-content">
                        <Typography variant="h3" align="center" gutterBottom>
                            What is poe?
                        </Typography>
                        <Grid container>
                            <Grid item sm={12} md={6}>
                                <Typography variant="subtitle1" align="justify">
                                    POE is a flexible, simple, scalable assessment platform delivered in the cloud.
                                    The current global health crisis has forced companies and universities towards the new paradigm of online assessment and remote proctoring. We offer you our solution.

                                    Online exams are steadily gaining ground in the e-learning industry. Students, professionals and organizations are interested in digital solutions that can help them facilitate certification of skills without losing the integrity of the exam.

                                    Online proctoring is a digital form of assessment that allows the candidate to take the exam via software, from anywhere. It is important that the procedure
                                    must be somehow reliable and cheat-proof.
                                    Thanks to live proctoring, a proctor observes the examinee while doing the exam and when something suspicious is detected, it can intervene to guarantee the authenticity of the examination.
                                </Typography>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <img alt="Sample 2" src={Sample2} className="info-img-right"/>  
                            </Grid>
                        </Grid>

                        <Typography variant="h3" align="center" gutterBottom>
                            How it works
                        </Typography>                        
                        <Grid container>
                           <Grid item sm={12} md={6}>
                                <img alt="Sample 3" src={Sample3} className="info-img-left"/>  
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <Typography variant="subtitle1" align="justify">
                                    poe supports Key Stages of Assessment Management:
                                    <ul>
                                        <li>Exam creation and delivery</li>
                                        <li>Post-exam report generation</li>
                                    </ul>

                                    Some features of our platform: 
                                    <ul>
                                        <li>Delivered in the cloud</li>
                                        <li>No software installation needed</li>
                                    </ul>
                                    
                                    The supervisor can enable and stop the exam session remotely.

                                    The proctor can view the screen on which the candidate is taking the exam to check its behaviour.

                                    While the exam is full screen, it is not available to open something else. If the candidate wants to exit the full screen, he/she is warned and if he/she exits then the exam is terminated.
                                </Typography>
                            </Grid>

                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        )
    }
}
export default Info;