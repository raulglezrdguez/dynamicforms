import React, { Component } from "react";
import { Panel, FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";

import withToast from '../components/withToast';

class EditModule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '', // nombre
      desc: '', //
    };
  }

  fillState = (module) => {
    let newState = this.state;
    newState.name = JSON.parse(JSON.stringify(module.name));
    newState.desc = JSON.parse(JSON.stringify(module.desc));
    this.setState(newState);
  }

  async componentDidMount() {
    this.fillState(this.props.module);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.module);
  }

  validateForm() {
    return (this.state.name.trim().length > 5 &&
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
      await this.props.updModule({name: name.trim(), desc: desc.trim(), _id: this.props.module._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
  }

  render() {

    return(
      <Panel header='Editando modulo'>
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
              placeholder='Descripción del Modulo'
            />
          </FormGroup>

          <Button
            bsStyle='primary'
            disabled={!this.validateForm()}
            type="submit" >Modificar</Button>

        </form>
    </Panel>
    );
  }
}

export default withToast(EditModule);
