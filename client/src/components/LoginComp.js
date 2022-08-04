import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import Jumbotron from 'react-bootstrap/Jumbotron';

import API from '../api/API.js';
import { OptionalErrorMsg } from "./GeneralComp.js";


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loginSuccess: false, wrongLoginMsg: false, doingLogin: false };
    }
    
    doLoginCall = (user, pass) => {
        this.setState({doingLogin: true});
        API.userLogin(user, pass).then( (userObj) => {
            this.setState({loginSuccess: true});       
            this.props.setLoggedInUser(userObj.name);  
        }).catch(
            () => {this.setState({wrongLoginMsg: true, doingLogin: false})}
        );
    }

    cancelLoginErrorMsg = () => {
        this.setState({wrongLoginMsg: false, doingLogin: false});
    }

    render() {        
        if (this.state.loginSuccess) {
            return <Redirect to={{
                pathname: '/',
                state: { isLoggedIn: true }, //si usa state (anzichè setState) per un cambio immediato dello stato (usato solo in questa occasione)
            }} />;
        } else
            return <>
                <OptionalErrorMsg errorMsg={this.state.wrongLoginMsg ? 'Username e/o password errati' : ''}
                    cancelErrorMsg={this.cancelLoginErrorMsg} />
                <LoginForm doLoginCall={this.doLoginCall} doingLogin={this.state.doingLogin} />
            </>;
    }
}


class LoginForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { username: '', password: '' };
    }

    updateField = (name, value) => {
        this.setState({ [name]: value });
    }

    doLogin = (event) => {
        event.preventDefault();
        if (this.form.checkValidity()) {
            this.props.doLoginCall(this.state.username, this.state.password);
        } else {
            this.form.reportValidity();
        }
    }

    validateForm = (event) => {
        event.preventDefault();
    }

    render() {
            return<>
                <Jumbotron>
                <h3>Entra nell'area clienti</h3>
                <form className='form' method={'POST'} onSubmit={this.validateForm} ref={form => this.form = form}>
                    <div className={'form-row'}>
                        <div className={'form-group'}>
                            <label htmlFor='username'>Username</label>
                            <input id='username' className={'form-control'} type='email' required={true}
                                name='username'
                                value={this.state.username}
                                placeholder='inserisci username'
                                onChange={(ev) => this.updateField(ev.target.name, ev.target.value)}
                            />
                        </div>
                        &nbsp;
                        <div className={'form-group'}>
                            <label htmlFor='password'>Password</label>
                            <input id='password' className={'form-control'} type='password' required={true}
                                name='password'
                                value={this.state.password}
                                placeholder='inserisci password'
                                onChange={(ev) => this.updateField(ev.target.name, ev.target.value)}
                            />
                        </div>
                    </div>

                    <div className={'form-row'}>
                        <button type='button' className='btn btn-primary' disabled={this.props.doingLogin}
                            onClick={this.doLogin}>Login</button>
                    </div>

                </form>
            </Jumbotron>
            </>;
    }
}


function Logout(props) {
    if (props.isLoggedIn) {
        return <> 
            Benvenuto/a {props.name}!<br/><br/>
            <Link to='/guest' className='btn btn-primary' onClick={props.userLogout}>Logout</Link>
            </>;
    } else
        return null;
}

export { Login, Logout };