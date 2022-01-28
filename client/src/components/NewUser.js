import React, { Component } from "react";
import { Panel, FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";

import withToast from '../components/withToast';

class NewUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '', // nombre del usuario
      email: '', // email del usuario
      password: '', // password
      rol: 'client', // rol del usuario: administrator, client
    };
  }

  validateForm() {
    return (this.state.name.trim().length > 6 &&
            this.state.email.trim().length > 5 &&
            this.state.password.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    let {name, email, password, rol} = this.state;

    event.preventDefault();

    try {
      await this.props.addUser({name: name.trim(), email: email.trim(), password: password.trim(), rol});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
  }

  render() {
    return(
      <Panel header='Nuevo usuario'>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="name">
            <ControlLabel>Nombre del usuario</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.name}
              onChange={this.handleChange}
              placeholder='Juan Perez'
            />
          </FormGroup>
          <FormGroup controlId="email">
            <ControlLabel>Correo del usuario</ControlLabel>
            <FormControl
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
              placeholder='juan@correo.cu'
            />
          </FormGroup>
          <FormGroup controlId="password">
            <ControlLabel>Contraseña</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
              placeholder='contraseña'
            />
          </FormGroup>
          <FormGroup controlId="rol">
            <ControlLabel>Rol del usuario</ControlLabel>
            <FormControl
              componentClass="select"
              value={this.state.rol}
              onChange={this.handleChange}
            >
              <option value='administrator'>Administrador</option>
              <option value='client'>Cliente</option>
            </FormControl>
          </FormGroup>

          <Button
            bsStyle='primary'
            disabled={!this.validateForm()}
            type="submit" >Crear usuario</Button>

        </form>
      </Panel>

    );
  }
}

export default withToast(NewUser);
