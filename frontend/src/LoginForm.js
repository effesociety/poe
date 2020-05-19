import React from "react";
import { Box } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";

const style = {
  button: {
    margin: "24px 0 16px",
  },
  buttonL: {
    width: "calc(50% - 6px)",
  },
  buttonR: {
    width: "calc(50% - 6px)",
    marginLeft: "12px",
  },
};

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
      open: false,
    };

    this.doLogin = this.doLogin.bind(this);
    this.doSignUp = this.doSignUp.bind(this);

    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.email = React.createRef();
    this.password = React.createRef();

  }
  openForm() {
    this.setState({
      open: true,
    });
  }
  closeForm() {
    this.setState({
      open: false,
    });
  }
  resetForm() {
    this.setState({
      buttonDisabled: false,
    });
  }

  async doLogin() {
    this.setState({
      buttonDisabled: true,
    });
    const email = this.email.current.value;
    const password = this.password.current.value;
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "email": email,
          "passowrd": password
        })
      };
      let response = await fetch("/api/users/login", requestOptions);
      let result = await response.json();

      if (result && result.success) {
        this.closeForm();
        this.props.onSuccess(); //@TO-DO Lift up data to be set in upper state
      } 
      else if (result && !result.success) {
        this.resetForm();
        alert(result.msg);
      }
    } 
    catch (err) {
      console.log("An error occurred")
      console.log(err);
      this.resetForm();
    }
  }

  async doSignUp() {
    this.setState({
      buttonDisabled: true,
    });
    const email = this.email.current.value;
    const password = this.password.current.value;
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "email": email,
          "passowrd": password
        })
      };
      let res = await fetch("/api/users/signup",requestOptions);
      let result = await res.json();
      if (result && result.success) {
        this.closeForm();
        this.props.onSuccess(); //@TO-DO Lift up data to be set in upper state
      } 
      else if (result && !result.success) {
        this.resetForm();
        alert(result.msg);
      }
    } 
    catch (err) {
      console.log("An error occurred")
      console.log(err);
      this.resetForm();
    }
  }

  render() {
    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.openForm}>
          Login
        </Button>
        <Dialog open={this.state.open} onClose={this.closeForm} aria-labelledby="form-dialog-title">
          <Container fixed>
            <div>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                inputRef={this.email}
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                inputRef={this.password}
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <Grid container>
                <Grid item style={style.buttonL}>
                  <Button
                    onClick={this.doLogin}
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={style.button}
                  >
                    Login
                  </Button>
                </Grid>
                <Grid item style={style.buttonR}>
                  <Button
                    onClick={this.doSignUp}
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={style.button}
                  >
                    Sign Up
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </Dialog>
      </div>
    );
  }
}

export default LoginForm;
