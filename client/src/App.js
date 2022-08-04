import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';

import AppTitle from './AppTitle.js';
import {CarCatalog,CarFilters,UserRentals,NavButton,OptionalErrorMsg} from './components/GeneralComp.js';
import {Login, Logout} from './components/LoginComp.js'
import {ConfigForm} from './components/ConfigComp.js';
import API from './api/API.js';
import "./custom.css";

class App extends React.Component{
  
  //bfs: filtri marca
  //cfs: filtri categoria
  constructor(props) {
    super(props);
    this.state = { cars: [], brands: [],bfs: [],cfs: [],rentals: [],
    loading: false,isLoggedIn: false,errorMsg: '',loginError: false,user: '',csrfToken: null,
    };

    this.updateFilters = this.updateFilters.bind(this);
    this.paymentThenRent = this.paymentThenRent.bind(this);
  };
  
  componentDidMount() {
    if (!this.state.isLoggedIn) {
      API.getUserInfo().then( (userInfo) => { 
          this.setState({isLoggedIn: true, user: userInfo.name});
          this.loadAllData(); //carica elenco auto e elenco noleggi effettuati 
          API.getCSRFToken().then( (response) => {this.setState({csrfToken: response.csrfToken})} );
      }).catch( (errorObj) => {
          if (errorObj.status && errorObj.status === 401) {
              this.setState({isLoggedIn: false, loading: false, loginError: false, errorMsg:''});
              this.loadPublicData(); //carica l'elenco per il catalogo, in quanto è necessario anche nella pagina senza autenticazione
          }
      })
    }
  };
  
  //elenco auto -> elenco marche (serve all'elenco dei filtri)
  getBrands(cars){
    return [...new Set(cars.map((car) => {return car.brand}))];
  }
  
  //gestisce i casi di errore (fornendo eventuale visualizzazione tramite il componente OptionalErrorMsg)
  handleErrors(errorObj) {
    if (errorObj) {
        if (errorObj.status && errorObj.status === 401) {
            setTimeout( ()=>{this.setState({isLoggedIn: false, loginError: false, errorMsg:''})}, 2000 );
        }
        const err0 = errorObj.errors[0];
        const errorString = err0.param + ': ' + err0.msg;
        this.setState({ errorMsg: errorString, loading: false });
    }
  }

  //richiede e poi carica l'elenco auto per la pagina pubblica
  loadPublicData(){
    API.getCars(this.state.bfs,this.state.cfs)
    .then((res) => {
                this.setState({cars: res, brands: this.getBrands(res), loading: false})
            }
        ).catch(
            (errorObj) => {
                this.handleErrors(errorObj);
            }
        );
    
  }

  //richiede e poi carica l'elenco noleggi per l'utente autenticato
  loadPrivateData(){
    API.getRentalsByUser()
    .then((res) => {
      this.setState({rentals: res, loading: false})
    }
  ).catch(
    (errorObj) => {
      this.handleErrors(errorObj);
    }
  );
  }

  //richiede e carica entrambe le collezioni di auto e noleggi (per il caso di ricarica pagina con utente ancora autenticato)
  loadAllData(){
    const promises = [ API.getCars(this.state.bfs,this.state.cfs), API.getRentalsByUser() ];
        Promise.all(promises).then(
            ([cs, rs]) => {
                this.setState({cars: cs, brands: this.getBrands(cs),rentals: rs, loading: false })
            }
        ).catch(
            (errorObj) => {
                this.handleErrors(errorObj);
            }
        );
  }
  
  //aggiorna i filtri attivi e richiede di conseguenza l'elenco auto
  //mode= 0:bfs (filtri marca) 1:cfs (filtri categoria) 2:reset
  updateFilters(f,mode){
    if(mode===2){
      API.getCars([],[]).then((res)=>{
        this.setState({cars: res,bfs: [],cfs: []})
      });
    }else if(mode===1){
    let newcfs=this.state.cfs;

    if(!newcfs.includes(f))
      newcfs.push(f);
    else{
      let i=newcfs.indexOf(f);
      if(i!==-1)
        newcfs.splice(i,1);
    }

    API.getCars(this.state.bfs,newcfs).then((res)=>{
      this.setState({cars: res,cfs: newcfs})
    });
    }else{
      let newbfs=this.state.bfs;

      if(!newbfs.includes(f))
        newbfs.push(f);
      else{
        let i=newbfs.indexOf(f);
        if(i!==-1)
          newbfs.splice(i,1);
      }
  
      API.getCars(newbfs,this.state.cfs).then((res)=>{
        this.setState({cars: res,bfs: newbfs})
      }); 
    }

  }
  
  //oltre al settare lo stato a false, ricarica il catalogo e i filtri allo stato iniziale
  userLogout = () => {
    API.userLogout().then(
        () => {
          this.setState({isLoggedIn: false, user: ''});
          this.updateFilters('',2);
      }
    );
  }

  //una volta loggato, viene caricato anche l'elenco dei noleggi (mentre le auto sono già state caricate inizialmente)
  setLoggedInUser = (name) => {
    this.setState({isLoggedIn: true, user: name,loading: true});
    this.loadPrivateData();
    API.getCSRFToken().then( (response) => this.setState({csrfToken: response.csrfToken}));
  }

  cancelErrorMsg = () => {
    this.setState({ errorMsg: '' });
  }

  //viene chiamata l'api payment (stub) e in caso di successo viene effettuata l'aggiunta del noleggio
  paymentThenRent = (payObj,carID,dataI,dataF) => {
    API.paymentCheck(payObj,this.state.csrfToken).then(() => {
      console.log("DEBUG: pagamento effettuato con successo!");
      API.addRental({carID: carID,dataI: dataI,dataF: dataF},this.state.csrfToken).then(()=>{
        console.log("DEBUG: prenotazione aggiunta con successo!");
        API.getRentalsByUser().then((rs) => this.setState({rentals: rs}));
      }).catch((errorObj) =>{this.handleErrors(errorObj)});
    }).catch(
            (errorObj) => {
                this.handleErrors(errorObj);
            }
        );
  };
  
  //elimina il noleggio desiderato e successivamente aggiorna la lista dei noleggi
  deleteRental= (rental) =>{
    console.log("DEBUG: rental ("+rental.rentalID+") -> delete");
    API.deleteRental(rental,this.state.csrfToken).then(
      () => API.getRentalsByUser().then((rs)=>this.setState({rentals: rs}))
    ).catch(
      (errorObj) => {
          this.handleErrors(errorObj);
      }
    );
  };

  render(){
    return <Router>
      <Switch>
      <Route path='/guest' render={(props) => {
        if (this.state.isLoggedIn)
          return <Redirect to='/' />;
        else
          return <> 
        <AppTitle/>
        <Container fluid className='upper-margin'>
          <Row>
          <Col sm={4}>
            <CarFilters brands={this.state.brands} bfs={this.state.bfs} cfs={this.state.cfs} updateF={this.updateFilters}/>
            <Login setLoggedInUser={this.setLoggedInUser} />
          </Col>
          <Col sm={8}>
            <CarCatalog cars={this.state.cars}/>
          </Col>
          </Row>
        </Container>
      </>
      }} >
      </Route>
      <Route path='/rentals' render={(props) => {
            return <>
            <AppTitle/>
            <Container fluid className='upper-margin'>
              <Row>
              <Col sm={2}>
              <Jumbotron>
                <Link to='/' className="btn btn-primary">Torna al configuratore</Link><br/>
                <OptionalErrorMsg errorMsg={this.state.errorMsg} cancelErrorMsg={this.cancelErrorMsg}/>
              </Jumbotron>
              </Col> 
              <Col sm={10}>
                <UserRentals rentals={this.state.rentals} deleteRental={this.deleteRental}/>
              </Col> 
              </Row>
            </Container>
          </>;
          }}>
      </Route>
      <Route path='/' render={(props) => {
          if (this.state.loading){
          return <>
              <AppTitle />
              <Logout isLoggedIn={this.state.isLoggedIn} userLogout={this.userLogout} />
          </>;
        }else{
          let isLogged = this.state.isLoggedIn;
          //if (props.location.state && props.location.state.isLoggedIn)
              //isLogged = props.location.state.isLoggedIn;
          if (isLogged){
            return <>
            <AppTitle/>
            <Container fluid className='upper-margin'>
              <Row>
              <Col sm={3}>
              <Jumbotron>
                <Logout name={this.state.user} isLoggedIn={this.state.isLoggedIn} userLogout={this.userLogout} /><br/><br/>
                <NavButton /><br/>
                <OptionalErrorMsg errorMsg={this.state.errorMsg} cancelErrorMsg={this.cancelErrorMsg} />
              </Jumbotron>
              </Col> 
              <Col sm={9}>
                <ConfigForm pay={this.paymentThenRent}/>
              </Col> 
              </Row>
            </Container>
          </>;
          }else{ 
            return <>
              <Redirect to='/guest' />;
            </>;
            }
          }
          }}>
      </Route>
      </Switch>
    </Router>
  }
  
}

export default App;
