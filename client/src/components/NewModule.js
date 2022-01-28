import React, { Component } from "react";
import { Panel, FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";

import withToast from '../components/withToast';

class NewModule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '', // nombre
      desc: '', //
    };
  }

  validateForm() {
    return (this.state.name.trim().length > 4 &&
            this.state.desc.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    let {name, desc} = this.state;

    event.preventDefault();

    try {
      await this.props.addModule({name: name.trim(), desc: desc.trim()});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
  }

  render() {
    return(
      <Panel header='Nuevo modulo'>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="name">
            <ControlLabel>Nombre del modulo</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.name}
              onChange={this.handleChange}
              placeholder='ModuloX'
            />
          </FormGroup>
          <FormGroup controlId="desc">
            <ControlLabel>Descripción</ControlLabel>
            <FormControl
              type="desc"
              value={this.state.desc}
              onChange={this.handleChange}
              placeholder='Descripción del modulo'
            />
          </FormGroup>

          <Button
            bsStyle='primary'
            disabled={!this.validateForm()}
            type="submit" >Crear modulo</Button>

        </form>
      </Panel>

    );
  }
}

export default withToast(NewModule);
