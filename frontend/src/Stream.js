import React from 'react';
import Box from '@material-ui/core/Grid'

class Stream extends React.Component{
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
        let screenSize = this.props.bigscreen ? "bigscreen" : "smallscreen";

        return (
            <Box className={screenSize} onClick={() => {
                if(this.props.changeSize) {
                    this.props.changeSize(this.props.id || null)
                }
            }}>
                <video ref={this.videoRef} autoPlay />
            </Box>
                
        )
    }
}



export default Stream;