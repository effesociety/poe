import React from "react";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

import TeamBG from './images/team_bg.jpg';
import PropicDaniele from './images/propicDaniele.jpg';
import PropicAlessandro from './images/propicAlessandro.jpg';
import PropicAngelo from './images/propicAngelo.jpg';
import PropicGaetano from './images/propicGaetano.jpg';

const styles = {
    team : {
        backgroundImage: "url(" + TeamBG + ")",
        backgroundSize: "cover"
    }
}

class Team extends React.Component{
    render(){
        return(
            <Box className="team" style={styles.team}>
                <Container>
                    <Grid container>
                        <Grid item sm={12} md={3}>
                            <img src={PropicDaniele} className="team-avatar"/>
                            <span className="team-member">
                                Daniele
                            </span>
                        </Grid>
                        <Grid item sm={12} md={3}>
                            <img src={PropicAlessandro} className="team-avatar"/>
                            <span className="team-member">
                                Alessandro
                            </span>
                        </Grid>
                        <Grid item sm={12} md={3}>
                            <img src={PropicAngelo} className="team-avatar"/>
                            <span className="team-member">
                                Angelo
                            </span>
                        </Grid>
                        <Grid item sm={12} md={3}>
                            <img src={PropicGaetano} className="team-avatar"/>
                            <span className="team-member">
                                Gaetano
                            </span>
                        </Grid>                                                
                    </Grid>
                </Container>
            </Box>
        )
    }
}
export default Team;