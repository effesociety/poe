import React from "react";
import LoginForm from "./LoginForm";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Telecommuting from "./images/Telecommuting.svg";
import CssBaseline from "@material-ui/core/CssBaseline";

const style = {
  header: {
    alignItems: "center",
    paddingTop: "25px",
    paddingBottom: "px",
    paddingRight: "25px",
    backgroundImage: "url(" + Telecommuting + ")",
    width: "100%",
    backgroundSize: "cover",
  },
};

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header style={style.header}>
        <CssBaseline />
        <LoginForm isLoggedIn={this.props.isLoggedIn} onSuccess={this.props.onSuccess} username={this.props.username}/>
        <Container className="Header">
          <Grid container>
            <Grid item xs={11} />
            <Grid item xs={1}>
            </Grid>
          </Grid>
        </Container>
      </header>
    );
  }
}
export default Header;
