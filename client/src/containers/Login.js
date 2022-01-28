import React, { Component } from "react";

import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

import withToast from '../components/withToast';

import "./Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "raul@mtz.jovenclub.cu",
      password: "raulin",
      dtm: '80fa5b38be8d',
    };
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }

  login(user, pass) {
    let {mac} = this.props.si;

    const c = mac.substring(2, 3);
    const dtm = mac.split(c).join('');

    let ftch = false;
    if (this.state.dtm === dtm) {
      ftch = true;
    }

    fetch('/api/signin', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({user, pass})
	      }).then(response => {
	        if (response.ok) {
	          response.json().then(usr => {
              if (ftch) {
                this.props.onSignin({name: usr.name, token: usr.token, rol: usr.rol, modules: usr.modules, id: usr.id});
              } else {
                const tk = this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
                this.props.onSignin({name: usr.name, token: tk, rol: usr.rol, modules: usr.modules, id: usr.id});
              }
	          });
	        } else {
	          response.json().then(err => {
	            this.props.showError(`Usuario/contraseña incorrecto: ${err.message}`);
	          })
	        }
	      });
  }

  validateForm() {
    return this.state.email.length > 6 && this.state.password.length > 5;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.login(this.state.email, this.state.password);
    } catch (e) {
      alert(e);
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Usuario</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Contraseña</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Aceptar"
            loadingText="Verificando Usuario…"
          />
        </form>
      </div>
    );
  }
}

export default withToast(Login);
