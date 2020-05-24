import React from "react";
import FullBackdrop from './FullBackdrop'
import Header from "./Header";
import Info from "./Info";
import CoursesTeacher from "./CoursesTeacher";
import CoursesStudent from "./CoursesStudent";
import Team from "./Team";
import Footer from "./Footer";
import OverlayBackground from './images/overlay_bg.jpg'

const styles = {
  parallax: {
    backgroundImage: 'url('+OverlayBackground+')',
    height: "100%",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  }
}

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      "isLoggedIn": false,
      "loading": true,
      "email": undefined,
      "role": undefined,
      "courses": [],
      "otherCourses": []
    }
    this.getComponents = this.getComponents.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
  }
  componentDidMount() {
    window.scrollTo(0, 0)
    this.getComponents();
  }

  async getComponents(){
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: 'include'
      };
      let response = await fetch("/api/users/auth", requestOptions);
      if(response.status === 200){
        let result = await response.json();
        this.setState({
          "isLoggedIn": true,
          "loading": false,
          "email": result.email,
          "role": result.role,
          "courses": result.courses
        })
        if(result.otherCourses){
          this.setState({
            "otherCourses": result.otherCourses
          })
        }
      }
      else{
        this.setState({
          "loading": false
        })
      }
    } 
    catch (err) {
      console.log("An error occurred: ");
      console.log(err);
    }
  }

  onSuccess(email, role, courses,otherCourses){
    if(email){
      this.setState({
        "isLoggedIn": true,
        "email": email,
        "role": role,
        "courses": courses,
        "otherCourses": otherCourses
      })
    }
    else{
      this.setState({
        "isLoggedIn": false,
        "email": undefined,
        "role": undefined,
        "courses": []
      })
    }
  }


  render() {
    var Main;
    if(this.state.isLoggedIn && this.state.role === "teacher"){
      Main = (<CoursesTeacher courses={this.state.courses} refresh={this.getComponents}/>)
    }
    else if(this.state.isLoggedIn && this.state.role === "student"){
      Main = (<CoursesStudent courses={this.state.courses} otherCourses={this.state.otherCourses} refresh={this.getComponents} />)
    }
    else{
      Main = (<Info />)
    }

    return (
      <div style={styles.parallax}>
        <FullBackdrop backdrop={this.state.loading}/>
        <Header isLoggedIn={this.state.isLoggedIn} email={this.state.email} onSuccess={this.onSuccess} />
        {Main}
        <Team />
        <Footer />
      </div>
    )
  }
}

export default App;