import React from 'react' ;
import Navbar from 'react-bootstrap/Navbar';

function AppTitle() {
    return <>
    <Navbar bg="primary" variant="dark">
        <Navbar.Brand><h1>Autonoleggio</h1></Navbar.Brand>
    </Navbar>
    </>;
}

export default AppTitle;