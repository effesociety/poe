import React from "react";
import LoginForm from "./LoginForm";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Logo from './images/logo_white.png';
import Typography from "@material-ui/core/Typography";

const styles = {
  logo :{
    backgroundImage: "url(" + Logo + ")",
    width: "100%",
    minHeight: "75px",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat"
  }
};

class Header extends React.Component {

  render() {
    return (
      <header>
        <CssBaseline />
        <Container className="header">
          <Grid container>
            <Grid item sm={6} md={2}>
              <div style={styles.logo} />
            </Grid>
            <Grid item sm={4} md={8}/>
            <Grid item sm={2} md={2}>
              <LoginForm isLoggedIn={this.props.isLoggedIn} onSuccess={this.props.onSuccess} email={this.props.email}/>
            </Grid>
          </Grid>
        </Container>
        
        <Container className="header-text">
          <Grid container>
            <Grid item sm={12}>
              <Typography  variant="h1" align="center" className="header-text-title">
                Lorem ipsum
              </Typography>
              <Typography  variant="h4" align="center" className="header-text-title">
                dolor sit amet, consectetur adipiscing elit. Aenean consequat convallis sem vitae rutrum. Morbi auctor condimentum nisl, non interdum eros viverra ac. In eu risus efficitur, egestas purus id, finibus neque. 
              </Typography>             
            </Grid>
          </Grid>
        </Container>
      </header>
    );
  }
}
export default Header;
