import React from "react";
import Header from "./Header";

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      "isLoggedIn": false,
      "loading": true,
      "username": undefined
    }
  }
  async componentDidMount() {
    this.setState({
      "loading": false
    })

    //Uncomment the following and delete previous setState once the authentication is completed
    /*
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      };
      let response = await fetch("/api/users/auth", requestOptions);
      let result = await response.json();

      if (result && result.success) {
        this.setState({
          "isLoggedIn": true,
          "loading": false
        })
      } else {
        this.setState({
          "isLoggedIn": false,
          "loading": false
        })
      }
    } catch (err) {
      console.log("An error occurred: ");
      console.log(err);
    }
  */
  }

  onSuccess(){
    this.setState({
      "isLoggedIn": true
    })
  }


  render() {
    return (
      <div>
        <Header isLoggedIn={this.state.isLoggedIn} username={this.state.username} onSuccess={this.state.onSuccess} />
      </div>
    )
  }
}

export default App;