import React, { Component } from "react";
import { Panel, Button } from "react-bootstrap";

import withToast from './withToast';

import InputText from './InputText';
import InputNumber from './InputNumber';
import InputList from './InputList';
import InputRef from './InputRef';
import InputImage from './InputImage';
import InputFile from './InputFile';
import InputDate from './InputDate';
import InputTime from './InputTime';

class NewDyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: [], // {field, type, values} fields del formulario que estoy trabajando
    };
  }

  arrangeFields = (form) => {
    if (form) {
      let newState = this.state;
      newState.fields = form.fields.map((f, i) => {
        let values = '';
        let data = '';
        switch (f.type) {
          case 'lst':
            values = f.values.split(',')[0];
            data = f.values;
            break;
          case 'ref':
            values = '';
            data = f.values;
            break;
          default:
            values = '';
            data = '';
        }
        return {field: f.field, obligatory: f.obligatory, type: f.type, values, data}
      });
      this.setState(newState);
    }
  }

  async componentDidMount() {
    this.arrangeFields(this.props.form);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeFields(nextProps.form);
  }

  validateForm() {
    let fields = this.state.fields;

    let res = true;
    for(let i = 0; i < fields.length; i++) {
      if ((fields[i].obligatory === 'true') &&
          (typeof fields[i].values === 'string') &&
          (fields[i].values.trim() === '')) {
          res = false;

          break;
      }
    }
    return res;
  }

  handleChangeField = (field, value) => {
    let newState = this.state;

    for(let i = 0; i < newState.fields.length; i++) {
      if (newState.fields[i].field === field){
        newState.fields[i].values = value;

        break;
      }
    }
    this.setState(newState);
  }

  handleSubmit = async event => {
    let newState = this.state;

    event.preventDefault();

    newState.fields.forEach((f, i) => {
      if (typeof f.values === 'string') {
        f.values = f.values.trim();
      }
    });
    // for(let i = 0; i < newState.fields.length; i++) {
    //   newState.fields[i].values = newState.fields[i].values.trim()
    // }

    this.setState(newState, () => {
      try {
        this.props.addDyContent(this.props.form._id, this.state.fields);
        // this.props.showSuccess('Datos adicionados');
      } catch (e) {
        this.props.showError(`Error: ${e}`);
      }
    });
  }

  render() {
    let title = (this.props.form) ? this.props.form.name : '';

    let inputs = this.state.fields.map((f, i) => {
      let component = null;
      switch (f.type) {
        case 'txt':
          component = <InputText key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
          break;
        case 'num':
          component = <InputNumber key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
          break;
        case 'lst':
          component = <InputList key={i} value={f.values} onChange={this.handleChangeField} field={f.field} data={f.data} />
          break;
        case 'img':
          component = <InputImage key={i} value={f.values} onChange={this.handleChangeField} field={f.field} data='' />
          break;
        case 'fle':
          component = <InputFile key={i} value={f.values} onChange={this.handleChangeField} field={f.field} data='' />
          break;
        case 'dte':
          component = <InputDate key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
          break;
        case 'tme':
          component = <InputTime key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
          break;
        case 'ref':
          component = <InputRef
            key={i}
            value={f.values}
            onChange={this.handleChangeField}
            field={f.field}
            data={f.data}
            refValues={this.props.refValues}

            />
        break;
        default:
          component = <InputText key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
      }
      return component;
    });

    return(
      <Panel header={title}>
        <form onSubmit={this.handleSubmit}>

          {inputs}

          <Button
            bsStyle='primary'
            disabled={!this.validateForm()}
            type="submit" >Almacenar datos</Button>

        </form>
      </Panel>

    );
  }
}

export default withToast(NewDyForm);
