import React, { Component } from "react";
import { Button } from "react-bootstrap";

import withToast from './withToast';

import InputText from './InputText';
import InputNumber from './InputNumber';
import InputList from './InputList';
import InputRef from './InputRef';
import InputImage from './InputImage';
import InputFile from './InputFile';
import InputDate from './InputDate';
import InputTime from './InputTime';

class EditDyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: [], // {field, obligatory, type, values, data} fields del formulario que estoy trabajando
    };
  }

  getValue = (field) => {
    let {values} = this.props;
    let v = '';
    for(let i = 0; i < values.length; i++) {
      if (values[i][field] !== undefined) {
        v = values[i][field];

        break;
      }
    }
    return v;
  }

  arrangeFields = (props) => {
    let {fields} = props;

    let newState = this.state;
    newState.fields = fields.map((f, i) => {
      let values = '';
      let data = '';
      switch (f.type) {
        case 'lst':
          values = this.getValue(f.field);//f.values.split(',')[0];
          data = f.values;
          break;
        case 'ref':
          values = this.getValue(f.field);
          data = f.values;
          break;
        case 'img':
        case 'fle':
          values = '';
          data = this.getValue(f.field);
          break;
        default:
          values = this.getValue(f.field);;
          data = '';
      }
      return {field: f.field, obligatory: f.obligatory, type: f.type, values, data}
    });
    this.setState(newState);
  }

  async componentDidMount() {
    this.arrangeFields(this.props);
    // console.log(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeFields(nextProps);
    // console.log(nextProps);
  }

  isValidDate = (value) => {
    const date = value.split('-');

    if (date.length !== 3)
      return false;

    const day = parseInt(date[0], 10);
    const month = parseInt(date[1], 10);
    const year = parseInt(date[2], 10);

    if (isNaN(day)|| isNaN(month) || isNaN(year))
      return false;

    // Check the ranges of month and year
    if (year < 1900 || year > 3000 || month < 0 || month > 11)
      return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
      monthLength[1] = 29;

    // Check the range of the day
    return ((day > 0) && (day <= monthLength[month]));
  }

  validateForm() {
    let {fields} = this.state;

    let res = true;
    for(let i = 0; i < fields.length; i++) {
      if (fields[i].obligatory === 'true') {
        if (
            (((fields[i].type === 'img') || (fields[i].type === 'fle')) && (fields[i].data === '') && (typeof fields[i].values === 'string') && (fields[i].values.trim() === '')) ||
            ((fields[i].type !== 'img') && (fields[i].type !== 'fle') && (typeof fields[i].values === 'string') && (fields[i].values.trim() === '')) ||
            ((fields[i].type === 'dte') && (!this.isValidDate(fields[i].values)))
            ) {
              res = false;

              break;
        }
      } else if ((fields[i].type === 'dte') && (fields[i].values !== '') && (!this.isValidDate(fields[i].values))) {
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

    this.setState(newState, () => {
      try {
        this.props.updDyContent(this.props.form, this.props.id, this.state.fields);
        this.props.noEdit();
      } catch (e) {
        this.props.showError(`Error: ${e}`);
      }
    });
  }

  render() {
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
          component = <InputImage key={i} value={f.values} onChange={this.handleChangeField} field={f.field} data={f.data + ',' + this.props.id} />
          break;
        case 'fle':
          component = <InputFile key={i} value={f.values} onChange={this.handleChangeField} field={f.field} data={f.data + ',' + this.props.id} />
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
            refValues={this.props.refValues} />
        break;
        default:
          component = <InputText key={i} value={f.values} onChange={this.handleChangeField} field={f.field} />
      }
      return component;
    });

    return(

      <form onSubmit={this.handleSubmit} >

        {inputs}

        <Button
          bsStyle='primary'
          disabled={!this.validateForm()}
          type="submit" >Modificar datos</Button>

      </form>

    );
  }
}

export default withToast(EditDyForm);
