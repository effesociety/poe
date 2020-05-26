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
                            Lorem ipsum dolor sit amet
                        </Typography>
                        <Grid container>
                            <Grid item sm={12} md={6}>
                                <Typography variant="subtitle1" align="justify">
                                    Aenean dolor felis, sagittis ut pulvinar eu, hendrerit ut elit. Praesent ac orci pretium, porttitor justo at, elementum ipsum. Quisque vitae augue lacus. Donec ac cursus diam. Fusce pretium volutpat cursus. In volutpat elit sit amet magna placerat pharetra eu at nulla. Curabitur eu accumsan lectus. Praesent ut justo a neque rhoncus mollis nec eu erat. Curabitur elit leo, sodales et nisi et, vestibulum efficitur tortor. Duis quis venenatis nulla. Phasellus tristique ligula ac odio pharetra auctor. Sed nec dictum risus, sed mollis ipsum. Praesent tincidunt malesuada justo sit amet eleifend. Nulla a magna lacus. Praesent in massa non neque malesuada mollis. Sed nunc metus, tincidunt vitae sagittis ac, imperdiet id massa. Donec dictum dui ut leo fringilla, non posuere odio gravida. Maecenas libero ante, condimentum rhoncus dignissim in, facilisis quis risus. Suspendisse mi massa, mattis at ex ac, hendrerit aliquet augue. Nunc mattis sagittis ultricies.
                                </Typography>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <img alt="Sample 2" src={Sample2} className="info-img-right"/>  
                            </Grid>
                        </Grid>

                        <Typography variant="h3" align="center" gutterBottom>
                            Lorem ipsum dolor sit amet
                        </Typography>                        
                        <Grid container>
                           <Grid item sm={12} md={6}>
                                <img alt="Sample 3" src={Sample3} className="info-img-left"/>  
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <Typography variant="subtitle1" align="justify">
                                    Sed nunc metus, tincidunt vitae sagittis ac, imperdiet id massa. Donec dictum dui ut leo fringilla, non posuere odio gravida. Maecenas libero ante, condimentum rhoncus dignissim in, facilisis quis risus. Suspendisse mi massa, mattis at ex ac, hendrerit aliquet augue. Nunc mattis sagittis ultricies. Nunc a nulla cursus diam blandit efficitur eu tempor turpis. Nullam tempus, purus in facilisis aliquet, diam nibh ullamcorper leo, at euismod libero risus sit amet lacus. Nulla viverra arcu at euismod sollicitudin. Ut ipsum ante, elementum et odio a, viverra gravida ipsum.  Aenean dolor felis, sagittis ut pulvinar eu, hendrerit ut elit. Praesent ac orci pretium, porttitor justo at, elementum ipsum. Quisque vitae augue lacus. Donec ac cursus diam. Fusce pretium volutpat cursus. In volutpat elit sit amet magna placerat pharetra eu at nulla.
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