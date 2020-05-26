import React from "react";
import { Box, Dialog, Typography, Avatar, Button, TextField, Grid, Container} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOpenOutlined';

const styles = {
  userInfo:{
    color: "#fff",
    fontSize: "1.2rem"
  },
  avatar: {
    backgroundColor: "#009688",
    margin: "auto",
    marginTop: "20px"
  },
  button: {
    margin: "24px 0 16px",
    backgroundColor: "#009688",
    color: "#fff"
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
    this.doLogout = this.doLogout.bind(this);
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
          "password": password
        })
      };
      let response = await fetch("/api/users/login", requestOptions);
      if(response.status === 200){
        let result = await response.json();
        this.closeForm();
        let otherCourses = result.otherCourses ? result.otherCourses : [];
        this.props.onSuccess(result.email, result.role, result.courses, otherCourses); 
      }
      else{
        this.resetForm();
        alert("An error occurred");
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
          "password": password
        })
      };
      let response = await fetch("/api/users/signup",requestOptions);
      if(response.status === 200){
        let result = await response.json();
        this.closeForm();
        let otherCourses = result.otherCourses ? result.otherCourses : [];
        this.props.onSuccess(result.email, result.role, result.courses, otherCourses);
      }
      else{
        this.resetForm();
        alert("An error occurred");
      }
    } 
    catch (err) {
      console.log("An error occurred")
      console.log(err);
      this.resetForm();
    }
  }

  async doLogout(){
    try {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include"
      };
      let response = await fetch("/api/users/logout",requestOptions);
      if(response.status === 200){
        this.closeForm();
        this.props.onSuccess(null); 
      }
      else{
        this.resetForm();
        alert("An error occurred");
      }
    } 
    catch (err) {
      console.log("An error occurred")
      console.log(err);
      this.resetForm();
    }
  } 

  render() {
    var userInfo;
    const email = this.props.email
    if(this.props.isLoggedIn && email !== undefined){
        userInfo = (
          <Box align="right">
            <Typography style={styles.userInfo} variant="subtitle2" align="right">
              Hi, {email}!
            </Typography>
            <Button variant="contained" style={styles.button} onClick={this.doLogout}>
              Logout
            </Button>   
          </Box>
        )
    }else{
      userInfo = (
        <Typography style={styles.userInfo} variant="subtitle2" align="right">
          <Button variant="contained" style={styles.button} onClick={this.openForm}>
            Login
          </Button>
        </Typography>
      )
    }

    return (
      <div>
        {userInfo}
        <Dialog open={this.state.open} onClose={this.closeForm} aria-labelledby="form-dialog-title">
          <Container fixed>
            <Box>
              <Avatar style={styles.avatar} align="center">
                <LockOutlinedIcon />
              </Avatar>
            </Box>

            <Typography component="h1" variant="h5" align="center">
              Welcome
            </Typography>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              inputRef={this.email}
              id="email"
              label="email"
              name="email"
              autoComplete="email"
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
              <Grid item style={styles.buttonL}>
                <Button
                  onClick={this.doLogin}
                  fullWidth
                  variant="contained"
                  style={styles.button}
                >
                  Login
                </Button>
              </Grid>
              <Grid item style={styles.buttonR}>
                <Button
                  onClick={this.doSignUp}
                  fullWidth
                  variant="contained"
                  style={styles.button}
                >
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Dialog>
      </div>
    );
  }
}

export default LoginForm;
