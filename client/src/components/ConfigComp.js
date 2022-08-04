import React from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

import API from "../api/API.js";

class ConfigForm extends React.Component{
    
    constructor(props) {
        super(props);
        this.state={dataI: new Date(),dataF: new Date(),categ: "A",
        eta: "sotto 25 anni",guidAdd: "n",kmd: "meno di 50km",ass: "n",price: null,nA: null,carID: null,
        showRes: false,payment: false};

        this.handleChangeI = this.handleChangeI.bind(this);
        this.handleChangeF = this.handleChangeF.bind(this);
        this.togglePayment = this.togglePayment.bind(this);
        this.payThenRent = this.payThenRent.bind(this);
    }

    resetConfig(){
        //valori di default
        let categ="A";
        let kmd="meno di 50km";
        let eta="sotto 25 anni";
        let guidAdd="n";
        let ass="n";
        let dataF=moment(new Date()).format("YYYY-MM-DD");
        let dataI=moment(new Date()).format("YYYY-MM-DD");

        API.checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF).then((res)=>{
            this.setState({dataI: new Date(),dataF: new Date(),categ: categ,kmd: kmd,eta: eta,guidAdd: guidAdd,ass: ass,
                price: res[1],nA: res[0],carID: res[2],showRes: true,payment: false});
        });
    }

    //handler per il datepicker della data iniziale
    handleChangeI(date) {
        let categ=this.state.categ;
        let kmd=this.state.kmd;
        let eta=this.state.eta;
        let guidAdd=this.state.guidAdd;
        let ass=this.state.ass;
        let dataF=moment(this.state.dataF).format("YYYY-MM-DD");
        
        let dataI=moment(date).format("YYYY-MM-DD");

        if(moment(dataF).isBefore(dataI)){ //in questo modo si aggiorna anche il datepicker per la data finale, affinchè non sia permesso di impostare una data precedente a quella iniziale
            dataF=dataI;
            API.checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF).then((res)=>{
                this.setState({dataI: date,dataF: date,price: res[1],nA: res[0],carID: res[2],showRes: true});
            });
        }else{
            API.checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF).then((res)=>{
                this.setState({dataI: date,price: res[1],nA: res[0],carID: res[2],showRes: true});
            });
        }    
    }

    //handler per il datepicker della data finale
    handleChangeF(date) {
        let categ=this.state.categ;
        let kmd=this.state.kmd;
        let eta=this.state.eta;
        let guidAdd=this.state.guidAdd;
        let ass=this.state.ass;
        let dataI=moment(this.state.dataI).format("YYYY-MM-DD");

        let dataF=moment(date).format("YYYY-MM-DD");

        API.checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF).then((res)=>{
            this.setState({dataF: date,price: res[1],nA: res[0],carID: res[2],showRes: true});
        });
    }
    
    //handler per tutti gli altri campi 
    changeHandler = (event) =>{
        let categ=this.state.categ;
        let kmd=this.state.kmd;
        let eta=this.state.eta;
        let guidAdd=this.state.guidAdd;
        let ass=this.state.ass;
        let dataI=moment(this.state.dataI).format("YYYY-MM-DD");
        let dataF=moment(this.state.dataF).format("YYYY-MM-DD");


        let name=event.target.name;
        let value;
        if(name==='ass')
            value=this.state.ass==='y' ? 'n' : 'y';
        else if(name==='guidAdd')
            value=this.state.guidAdd==='y' ? 'n' : 'y';
        else
            value=event.target.value;
            

        //name e value indicando l'evento che effettivamente è stato cambiato: tutti gli altri 
        //valori rimangono uguali allo stato (che è rimasto invariato)
        switch(name){ 
            case 'categ':
            categ=value;
            break;
            case 'kmd':
            kmd=value;
            break;
            case 'eta':
            eta=value;
            break;
            case 'guidAdd':
            guidAdd=value;
            break;
            case 'ass':
            ass=value;
            break;
            default:
        }
        
        API.checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF).then((res)=>{
            this.setState({[name]: value,price: res[1],nA: res[0],carID: res[2],showRes: true});
        });
          
         
    }

    //in questo modo, se si annulla il pagamento (nv: false), si resetta il configuratore
    togglePayment(){
        let nv=this.state.payment ? false : true;
        if(!nv){
            this.resetConfig(); 
        }else
            this.setState({payment: nv});
    }

    //chiamata ad App che chiamerà la dovuta API
    payThenRent(state){
        let dataI=moment(this.state.dataI).format("YYYY-MM-DD");
        let dataF=moment(this.state.dataF).format("YYYY-MM-DD"); 
        this.props.pay({price: this.state.price,fullName: state.fullName,cardNumber: state.cardNumber,CVV: state.CVV},this.state.carID,dataI,dataF);
    }

    render(){
        if(!this.state.payment){
        return <>
        <Jumbotron>
        <Form>
        <Form.Row>
        <h3><b>Inserisci i parametri desiderati</b></h3><br/><br/>
        </Form.Row>
        <Form.Row>
            <Col xs={5}>
            <Form.Group controlId="formGridDataI">
                <Form.Label><b>Data Inizio</b></Form.Label><br/>
                <DatePicker
                    selected={ this.state.dataI }
                    onChange={ this.handleChangeI }
                    name="dataI"
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                />
            </Form.Group>
            </Col>
            <Col xs={4}>
            <Form.Group controlId="formGridDataF">
                <Form.Label><b>Data Fine</b></Form.Label><br/>
                <DatePicker
                    selected={ this.state.dataF }
                    onChange={ this.handleChangeF }
                    name="dataF"
                    dateFormat="yyyy-MM-dd"
                    minDate={this.state.dataI}
                />
                </Form.Group>
            </Col>
        </Form.Row>
        <Form.Row>
            <Col xs={2}>
                <Form.Label><b>Categoria</b></Form.Label>
                <Form.Control as="select" name="categ" defaultValue={this.state.categ} onChange={this.changeHandler}>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>E</option>
                </Form.Control>
            </Col>
            <Col xs={3}>
                <Form.Label><b>Età guidatore</b></Form.Label>
                <Form.Control as="select" name="eta" defaultValue={this.state.eta} onChange={this.changeHandler}>
                    <option>sotto 25 anni</option>
                    <option>tra 25 e 65 anni</option>
                    <option>oltre 65 anni</option>
                </Form.Control>
            </Col>
            <Col xs={3}>
            <Form.Label><b>Stima km giornalieri</b></Form.Label>
            <Form.Control as="select" name="kmd" defaultValue="meno di 50km" onChange={this.changeHandler}>
                <option>meno di 50km</option>
                <option>tra 50 e 150km</option>
                <option>illimitato</option>
            </Form.Control>
            </Col>
        </Form.Row>
        <br/>
        <Form.Row>
            <Form.Check name="ass" label="Assicurazione" onChange={this.changeHandler}/>
        </Form.Row>
        <Form.Row>
            <Form.Check name="guidAdd" label="Guidatore/i extra" onChange={this.changeHandler}/>
        </Form.Row>
      </Form>
      </Jumbotron>
      <br/>
      <Price price={this.state.price} nA={this.state.nA} carID={this.state.carID} show={this.state.showRes} toggle={this.togglePayment}/>   
      </>;
    }else
        return <>
            <PaymentForm toggle={this.togglePayment} pay={this.payThenRent} price={this.state.price}/>
        </>;
    }
}

//mostra il prezzo (se ci sono auto disponibili) e permette di proseguire con la procedura
function Price(props){
    if(props.show){
        if(props.nA)
            return <>
            <Jumbotron>
            <b>numero auto disponibili: </b>{props.nA}<br/>
            <b>prezzo: </b>{props.price.toFixed(2)}<br/>
            <button type='button' className='btn btn-primary' onClick={() => props.toggle()}>Procedi</button>
            </Jumbotron>
        </>;
        else    
            return <>
            <Jumbotron>
            <i>nessun'auto disponibile con i parametri attuali.</i>
            </Jumbotron>
            </>;
    }else
        return null;
}

//form che si occupa di inoltrare i dati di pagamento ed eventualmente far proseguire la procedura
class PaymentForm extends React.Component{
    constructor(props){
        super(props);
        this.state={fullName: null, cardNumber: null,CVV: null,submitted: false}
    }

    updateField = (name, value) => {
        this.setState({ [name]: value });
    }

    validateForm = (event) => {
        event.preventDefault();
    }

    submitData(state){
        if (this.form.checkValidity()) {
            this.props.pay(state);
            this.props.toggle();
        } else {
            this.form.reportValidity();
        }
    }

    render(){
        return <>
        <Jumbotron>
        <form className='' onSubmit={this.validateForm} ref={form => this.form = form}>
            <Form.Row>
                <Col sm={4}>
                <Form.Label>Prezzo</Form.Label>
                <Form.Control type="text" placeholder={this.props.price} readOnly />
                </Col>
                <Col sm={4}>
                <Form.Label>Nome completo</Form.Label>
                <Form.Control name="fullName" placeholder="Nome Cognome" required onChange={(ev) => this.updateField(ev.target.name,ev.target.value)}/>
                </Col>
            </Form.Row>
            <Form.Row>
                <Col sm={4}>
                <Form.Label>Numero carta</Form.Label>
                <Form.Control name="cardNumber" placeholder="inserisci numero carta" pattern="[0-9]{16}" required onChange={(ev) => this.updateField(ev.target.name,ev.target.value)} />
                <Form.Text className="text-muted">formato: 16 cifre</Form.Text>
                </Col>
                <Col sm={2}>
                <Form.Label>CVV</Form.Label>
                <Form.Control name="CVV" placeholder="inserisci cvv" pattern="[0-9]{3}" required onChange={(ev) => this.updateField(ev.target.name,ev.target.value)} />
                <Form.Text className="text-muted">formato: 3 cifre</Form.Text>
                </Col>
            </Form.Row>
            <br/>
            <Form.Row>
            <Col sm={4}>
                <button type='button' className='btn btn-primary' onClick={() => this.submitData(this.state)}>Inoltra il pagamento</button>
            </Col>
            <Col sm={2}>
                <button type='button' className='btn btn-primary' onClick={() => this.props.toggle()}>Annulla</button>
            </Col>
            </Form.Row>
        </form>
        </Jumbotron>
    </>;
    }

}

export {ConfigForm};
