import React from 'react'
import { ProgressBar, Alert } from 'react-bootstrap'

const Progressbar = ({ percentage, children }) => {      
   return (
       <>
       <ProgressBar striped variant="success" now={percentage} />
       <Alert className="my-3" variant="info">{children}</Alert>
       </>
    );
}
Progressbar.defaultProps = {
    percentage: 0,    
}
export default Progressbar