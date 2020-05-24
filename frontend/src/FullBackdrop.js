import React from 'react';
import { Backdrop, CircularProgress } from '@material-ui/core';

const styles = {
  backdrop: {
    zIndex: "999",
    color: '#fff',
    backgroundColor: "#000",
    opacity: "0.8"
  },
}

class FullBackdrop extends React.Component{
  render(){
    return(
      <div>
        <Backdrop style={styles.backdrop} open={this.props.backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    )
  }
}

export default FullBackdrop
