import React from 'react';
import {Box, IconButton} from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

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
        let swapIcon;
        if(screenSize === "bigscreen" && this.props.id){
            swapIcon = (
                <IconButton aria-label="delete" className="exam-btn-swap" onClick={() => this.props.swapView(this.props.id)}>
                    <CachedIcon />
                </IconButton>
            )
        }

        return (
            <Box className={screenSize} >
                {swapIcon}
                <video ref={this.videoRef} onClick={() => {
                    if(this.props.changeSize) {
                        this.props.changeSize(this.props.id || null)
                    }
                }} autoPlay />
            </Box>
                
        )
    }
}



export default Stream;