import React from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import moment from 'moment';

import { iconDelete } from "../svgIcons.js";

class CarCatalogTable extends React.Component {

    render() {
        if(this.props.isEmpty){
        return <>
            <br/><i>Nessun modello disponibile con la combinazione attuale di filtri.</i>
        </>;
        }else{
        return <Table striped bordered hover size='sm'>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modello</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
            {
            this.props.cars.map((car) => (<CarCatalogRow key={car.carID} car={car}/>))
            }
        </tbody>
      </Table>;
        }
    }
}

function CarCatalogRow(props) {
    return <tr>
        <td>{props.car.brand}</td>
        <td>{props.car.model}</td>
        <td>{props.car.category}</td>
    </tr>
}

function CarCatalog(props) {
    let isEmpty=false;
    if(props.cars.length===0)
        isEmpty=true;
    return <>
        <CarCatalogTable cars={props.cars} isEmpty={isEmpty}/>
    </>;
}

class CarFilters extends React.Component {

    checkboxHandlerB= (event) =>{
        let bf=event.target.name;
        this.props.updateF(bf,0);
    }

    checkboxHandlerC= (event) =>{
        let cf=event.target.name;
        this.props.updateF(cf,1);
    }
    

    render(){
        return <Container fluid>
            <Jumbotron>
            <Row>
            <h3>Filtri:</h3>    
            </Row>
            <Row>
            <Col>
            <Form.Label><b>Marche</b></Form.Label>
            {
            this.props.brands.map((brand)=>(<BrandRow key={"brand-"+brand} brand={brand} handler={this.checkboxHandlerB}/>))
            }
            </Col>
            <Col>
            <Form.Label><b>Categorie</b></Form.Label>
            <Form.Check name='A' label="A" onChange={this.checkboxHandlerC}/>
            <Form.Check name='B' label="B" onChange={this.checkboxHandlerC}/>
            <Form.Check name='C' label="C" onChange={this.checkboxHandlerC}/>
            <Form.Check name='D' label="D" onChange={this.checkboxHandlerC}/>
            <Form.Check name='E' label="E" onChange={this.checkboxHandlerC}/>  
            </Col>
         </Row>
         <br/>
         <Row>
             Il filtro 'categoria' si riferisce ad una fascia di prezzi (decrescente da A ad E).
         </Row>
         </Jumbotron>
        </Container>;
    }
}

function BrandRow(props){
    return<>
            <Form.Check name={props.brand} label={props.brand} onChange={props.handler}/>
        </>;
}

class RentalTable extends React.Component{
    render() {
        if(this.props.isEmpty){
        return <>
            <br/><i>Nessun noleggio effettuato.</i>
        </>;
        }else{
        return <Table striped bordered hover size='sm'>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Data Inizio</th>
            <th>Data Fine</th>
            <th>Stato</th>
            <th>Annulla</th>
          </tr>
        </thead>
        <tbody>
            {
            this.props.rentals.map((r) => (<RentalRow key={r.rentalID} rental={r} deleteRental={this.props.deleteRental}
                />))
            }
        </tbody>
      </Table>;
        }
    }
}

function RentalRow(props){
    let now=moment();
    let timeState;
    if(moment(now).isAfter(props.rental.dataF))
        timeState='P';
    else if(moment(now).isBetween(props.rental.dataI,props.rental.dataF))
        timeState='A';
    else
        timeState='F';
    return <RentalRowData rental={props.rental} timeState={timeState} deleteRental={props.deleteRental}/>
}

function RentalRowData(props){
    if(props.timeState==='F') //caso 'futuro' (non ancora iniziato alla data attuale)
        return <tr>
        <td>{props.rental.category}</td>
        <td>{props.rental.dataI}</td>
        <td>{props.rental.dataF}</td>
        <td>futuro</td>
        <td><span onClick={() => props.deleteRental(props.rental)}>{iconDelete}</span></td>
        </tr>
    else if(props.timeState==='A') //stato 'in corso' (già iniziato alla data attuale ma non ancora finito, escluso il caso di oggi->oggi)
        return <tr>
        <td>{props.rental.category}</td>
        <td>{props.rental.dataI}</td>
        <td>{props.rental.dataF}</td>
        <td>in corso</td>
        <td>-</td>
        </tr>
    else //stato 'concluso' (già finito alla data attuale)
        return <tr>
        <td>{props.rental.category}</td>
        <td>{props.rental.dataI}</td>
        <td>{props.rental.dataF}</td>
        <td>concluso</td>
        <td>-</td>
        </tr>
}

function UserRentals(props){
    let isEmpty=false;
    if(props.rentals.length===0)
        isEmpty=true;
    return <>
        <RentalTable rentals={props.rentals} isEmpty={isEmpty} deleteRental={props.deleteRental}/>
    </>;
}

function NavButton(props){
    return <>
        <Link to='/rentals' className="btn btn-primary" >Visualizza le tue prenotazioni</Link>
    </>;
}

function OptionalErrorMsg(props) {
    if (props.errorMsg)
        return <div className='alert alert-danger alert-dismissible show' role='alert'>
            <strong>Error:</strong> <span>{props.errorMsg}</span>
            <button type='button' className='close' aria-label='Close' onClick={props.cancelErrorMsg}> 
                <span aria-hidden='true'>&times;</span>
            </button>
        </div>;
    else
        return null;
}

export { CarCatalog,CarFilters,UserRentals,NavButton,OptionalErrorMsg};

