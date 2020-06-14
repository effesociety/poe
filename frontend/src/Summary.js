import React from 'react'
import {Dialog, Container, Typography, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell} from '@material-ui/core'
import {ReactComponent as Teacher} from './images/teacher.svg'

class Summary extends React.Component{
    render(){

        


        return(
            <Dialog open={this.props.open} onClose={this.props.close} fullWidth={true}
            maxWidth="md" aria-labelledby="form-dialog-title">
                <Container>
                    <Typography variant="h2" align="center" className="summary-h2">
                        Here is the final report
                    </Typography>
                    <Teacher className="summary-icon" />
                    <TableContainer component={Paper} className="summary-container-table" >
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell align="right">Result</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(this.props.reports).map((key,i) => {
                                    return(
                                    <TableRow key={key}>
                                        <TableCell>{key}</TableCell>
                                        <TableCell align="right">{this.props.reports[key].correctAnswers}/{this.props.reports[key].answers}</TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>    
                </Container>
            </Dialog>
        )
    }
}

export default Summary;