import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from "@material-ui/core/Typography";

class Main extends React.Component{
    render(){
        return (
            <Container className="main">
                <Card>
                    <CardContent>
                        <Typography variant="p">
                        Aenean dolor felis, sagittis ut pulvinar eu, hendrerit ut elit. Praesent ac orci pretium, porttitor justo at, elementum ipsum. Quisque vitae augue lacus. Donec ac cursus diam. Fusce pretium volutpat cursus. In volutpat elit sit amet magna placerat pharetra eu at nulla. Curabitur eu accumsan lectus. Praesent ut justo a neque rhoncus mollis nec eu erat. Curabitur elit leo, sodales et nisi et, vestibulum efficitur tortor. Duis quis venenatis nulla. Phasellus tristique ligula ac odio pharetra auctor. Sed nec dictum risus, sed mollis ipsum. Praesent tincidunt malesuada justo sit amet eleifend. Nulla a magna lacus. Praesent in massa non neque malesuada mollis.

                        Sed nunc metus, tincidunt vitae sagittis ac, imperdiet id massa. Donec dictum dui ut leo fringilla, non posuere odio gravida. Maecenas libero ante, condimentum rhoncus dignissim in, facilisis quis risus. Suspendisse mi massa, mattis at ex ac, hendrerit aliquet augue. Nunc mattis sagittis ultricies. Nunc a nulla cursus diam blandit efficitur eu tempor turpis. Nullam tempus, purus in facilisis aliquet, diam nibh ullamcorper leo, at euismod libero risus sit amet lacus. Nulla viverra arcu at euismod sollicitudin. Ut ipsum ante, elementum et odio a, viverra gravida ipsum. 
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        )
    }
}
export default Main;