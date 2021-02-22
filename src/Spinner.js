import React from 'react';
import { Loader, Dimmer } from 'semantic-ui-react';

const Spinner = () => (
    <Dimmer active style={{backgroundColor:"black"}} >
    <Loader size="huge" content={"Preparing Chat..."} style={{color:"white"}} />
    </Dimmer>
)

export default Spinner;