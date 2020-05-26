import React from 'react';

class Stream extends React.Component{
    render(){
        var stream;
        if(this.props.stream){
            stream = (
                <video ref={video => { video.srcObject = this.props.stream }} autoPlay playsInline/>
            )
        }
        return (
            <div>{stream}</div>
        )
    }
}

export default Stream;