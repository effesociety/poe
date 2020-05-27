import React from 'react';

class Stream extends React.Component{
    /*
    render(){
        var stream;
        console.log("Printing in STREAM 1")
        console.log(this.props.stream)
        if(this.props.stream){
            let srcObject = this.props.stream || null
            stream = (
                <video ref={video => { video.srcObject = srcObject }} autoPlay playsInline/>
            )
        }
        return (
            <div>{stream}</div>
        )
    }
    */

    constructor(props) {
        super(props)
        this.videoRef = React.createRef()
    }

    componentDidMount(){
        const video = this.videoRef.current
        video.srcObject = this.props.stream
    }

    componentDidUpdate(){
        if(this.videoRef.current.srcObject !== this.props.stream){
            this.videoRef.current.srcObject = this.props.stream
        }
    }

    render(){
        return (
                <video ref={this.videoRef} autoPlay />
        )
    }
}



export default Stream;