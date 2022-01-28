import React, { Component } from "react";
import { Panel, FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";
import ReactDOM from 'react-dom';

import withToast from '../components/withToast';

class NewForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //types: ['texto', 'listado', 'numero', 'imagen', 'referencia'],
      name: '', // nombre del formulario
      desc: '', // descripcion del formulario
      module: '', // modulo a que pertenece
      fields: [{field:'', obligatory: 'true', type:'txt', values:''}], // otros campos del nuevo formulario
      users: ['all'], // usuarios que introducen los datos
      viewers: ['all'], // usuarios que ven los datos introducidos [all, public, _idUser...]
      formFields: [] //{_id: , form:'', fields:[]} las forms con los campos de tipo text que contienen
    };
  }

  fillFormFields = (forms) => {
    let formFields = [];
    let newState = this.state;
    forms.forEach((f, i) => {
      let newF = {_id: f._id, form: f.name, fields: []};
      f.fields.forEach((ff, j) => {
        if (ff.type === 'txt')
          newF.fields.push(ff.field);
      });
      if (newF.fields.length > 0) formFields.push(newF);
    });
    // for(let i = 0; i < forms.length; i++) {
    //   let newF = {_id: forms[i]._id, form: forms[i].name, fields: []};
    //   for(let j = 0; j < forms[i].fields.length; j++) {
    //     if (forms[i].fields[j].type === 'txt')
    //       newF.fields.push(forms[i].fields[j].field);
    //   }
    //   if (newF.fields.length > 0) formFields.push(newF);
    // }
    newState.formFields = formFields;
    this.setState(newState);
  }

  buildFormFields = (formId) => {
    let {formFields} = this.state;
    let fields = [];
    for(let i = 0; i < formFields.length; i++) {
      if (formFields[i]._id === formId) {
        fields = formFields[i].fields.map((f, i) => (<option key={i} value={f}>{f}</option>));
        break;
      }
    }
    return fields;
  }

  setModule = (module) => {
    let newState = this.state;
    newState.module = module._id;
    this.setState(newState);
  }

  async componentDidMount() {
    this.fillFormFields(this.props.forms);
    if (this.props.modules.length > 0)
      this.setModule(this.props.modules[0]);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillFormFields(nextProps.forms);

    if ((this.state.module === '') && (nextProps.modules.length > 0)) {
      this.setModule(nextProps.modules[0]);
    }
  }

  findIndex = (field, start) => {
    let {fields} = this.state;

    for(let i = start; i < fields.length; i++) {
      if (fields[i].field === field) return true;
    }

    return false;
  }

  validateForm() {
    let res = this.state.fields.length > 1;
    for(let i = 0; i < this.state.fields.length - 1; i++) {
      if (
          (this.state.fields[i].field === '') ||
          ((this.state.fields[i].type === 'ref') && (this.state.fields[i].values === ',')) ||
          (((this.state.fields[i].type === 'lst') && (this.state.fields[i].values === '')) ||
           (this.findIndex(this.state.fields[i].field, i + 1))
          )
        ) {
            res = false;
            break;
          }
    }

    if (res) {
      let { users } = this.state;
      if ((users.length === 0) || ((users.length > 1) && (users.indexOf('all') !== -1))) res = false;
    }

    if (res) {
      let {viewers} = this.state;
      if ((viewers.length === 0) ||
          ((viewers.length > 1) && (viewers.indexOf('all') !== -1)) ||
          ((viewers.length > 1) && (viewers.indexOf('public') !== -1))) res = false;
    }

    if (this.state.module === '') res = false;

    if (res) {
      for(let i = 0; i < this.props.forms.length; i++) {
        if (this.props.forms[i].name === this.state.name) {
          res = false;

          break;
        }
      }
    }

    return res && this.state.name.trim().length > 3 && this.state.desc.trim().length > 5;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeField = event => {
    let index = parseInt(event.target.id, 10);
    let newState = this.state;
    newState.fields[index].field = event.target.value;

    if ((event.target.value !== '') && (index === this.state.fields.length - 1)) {
      newState.fields.push({field:'', obligatory: 'true', type:'txt', values:''});
    } else if ((event.target.value === '') && (index === this.state.fields.length) - 2) {
      newState.fields.splice(this.state.fields.length - 1, 1);
    }
    this.setState(newState);
  }

  handleChangeObligatory = event => {
    let newState = this.state;
    newState.fields[parseInt(event.target.id, 10)].obligatory = event.target.value;
    this.setState(newState);
  }

  handleChangeType = event => {
    let index = parseInt(event.target.id, 10);
    let { formFields } = this.state;
    let newState = this.state;
    newState.fields[index].type = event.target.value;
    switch (event.target.value) {
      case 'ref':
        if (formFields && formFields.length > 0) {
          newState.fields[index].values = formFields[0]._id + ',' + formFields[0].fields[0];
        } else {
          newState.fields[index].values = ',';
        }
        break;
      default:
        newState.fields[index].values = '';
    }
    this.setState(newState);
  }

  handleChangeValues = event => {
    let index = parseInt(event.target.id, 10);
    let newState = this.state;
    newState.fields[index].values = event.target.value;
    this.setState(newState);
  }

  handleChangeUsers = event => {
    let usersSelected = ReactDOM.findDOMNode(this.select).options; //value, innerText, selected
    let users = [];
    // usersSelected.forEach((u, i) => {
    //   if (u.selected) users.push(u.value);
    // });
    for(let i = 0; i < usersSelected.length; i++) {
      if (usersSelected[i].selected) users.push(usersSelected[i].value);
    }
    let newState = this.state;
    newState.users = users;
    this.setState(newState);
  }

  handleChangeViewers = event => {
    let viewersSelected = ReactDOM.findDOMNode(this.selectViewer).options; //value, innerText, selected
    let viewers = [];
    // viewersSelected.forEach((v, i) => {
    //   if (v.selected) viewers.push(v.value);
    // });
    for(let i = 0; i < viewersSelected.length; i++) {
      if (viewersSelected[i].selected) viewers.push(viewersSelected[i].value);
    }
    let newState = this.state;
    newState.viewers = viewers;
    this.setState(newState);
  }

  handleChangeRef = event => {
    let index = parseInt(event.target.id, 10);
    let { formFields } = this.state;
    let newState = this.state;
    let field = '';

    for(let i = 0; i < formFields.length; i++) {
      if (formFields[i]._id === event.target.value) {
        field = formFields[i].fields[0];

        break;
      }
    }

    newState.fields[index].values = event.target.value + ',' + field;
    this.setState(newState);
  }

  handleChangeRefField = event => {
    let index = parseInt(event.target.id, 10);
    let newState = this.state;
    let v = newState.fields[index].values.split(',');
    if (v.length > 0) {
      newState.fields[index].values = v[0] + ',' + event.target.value;
      this.setState(newState);
    }
  }

  handleSubmit = async event => {
    let {name, desc, fields, users, viewers, module} = this.state;

    event.preventDefault();

    try {
      fields.splice(fields.length - 1, 1);
      await this.props.addForm({name: name.trim(), desc: desc.trim(), fields, users, viewers, module});
      let newState = this.state;
      newState.name = '';
      newState.desc = '';
      newState.fields = [{field:'', obligatory: 'true', type:'txt', values:''}];
      this.setState(newState);
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
  }

  render() {
    let { users, viewers } = this.state;

    let formGroups = this.state.fields.map((f, i) => {
      let values = null;
      if (this.state.fields[i].type === 'lst') {
        values = <FormControl
          type="text"
          value={this.state.fields[i].values}
          onChange={this.handleChangeValues}
          placeholder='Valor1, Valor2, Valor3'
        />
      } else if (this.state.fields[i].type === 'ref') {
        let formOptions = this.state.formFields.map((f, i) => (<option key={i} value={f._id}>{f.form}</option>));
        let v = this.state.fields[i].values.split(',');
        let defaultRefValue = (v.length > 0) ? v[0] : null;
        let defaultFieldValue = (v.length > 1) ? v[1] : null;
        let fieldOptions = null;
        if (defaultRefValue !== null) {
          fieldOptions = this.buildFormFields(defaultRefValue);
        }

        values = [
          <FormControl key={0}
            componentClass="select"
            onChange = {this.handleChangeRef}
            defaultValue = {defaultRefValue} >
            {formOptions}
          </FormControl>,
          <FormControl key={1}
            componentClass="select"
            onChange = {this.handleChangeRefField}
            defaultValue = {defaultFieldValue} >
            {fieldOptions}
          </FormControl>
        ];
      }

      return (<FormGroup controlId={i.toString()} key={i}>
      <ControlLabel>Campo nuevo {i}</ControlLabel>
      <FormControl
        type="text"
        value={this.state.fields[i].field}
        onChange={this.handleChangeField}
        placeholder='Nombre del campo'
      />
      <FormControl
        componentClass='select'
        value={this.state.fields[i].obligatory}
        onChange={this.handleChangeObligatory} >
        <option value='true'>Obligatorio</option>
        <option value='false'>No es obligatorio</option>
      </FormControl>
      <FormControl
        componentClass='select'
        value={this.state.fields[i].type}
        onChange={this.handleChangeType} >
        <option value='txt'>Texto</option>
        <option value='lst'>Listado</option>
        <option value='num'>Numero</option>
        <option value='img'>Imagen</option>
        <option value='fle'>Fichero</option>
        <option value='dte'>Fecha</option>
        <option value='tme'>Hora</option>
        <option value='ref'>Referencia</option>
      </FormControl>

      {values}
    </FormGroup>)});

    let userOptions = [<option key='0' value='all'>Todos los usuarios</option>];
    let userValues = [];
    if (users && (users.indexOf('all') !== -1)) userValues.push('all');
    this.props.users.forEach((u, i) => {
      if (users && (users.indexOf(u.id) !== -1)) userValues.push(u.id);
      userOptions.push(<option key={i+1} value={u.id}>{u.value}</option>);
    });
    // for(let i = 0; i < this.props.users.length; i++) {
    //   if (users && (users.indexOf(this.props.users[i].id) !== -1)) userValues.push(this.props.users[i].id);
    //   userOptions.push(<option key={i+1} value={this.props.users[i].id}>{this.props.users[i].value}</option>);
    // }

    let viewerOptions = [<option key='0' value='public'>Publico</option>, <option key='1' value='all'>Todos los usuarios</option>];
    let viewerValues = [];
    if (viewers && (viewers.indexOf('all') !== -1)) viewerValues.push('all');
    if (viewers && (viewers.indexOf('public') !== -1)) viewerValues.push('public');
    this.props.users.forEach((u, i) => {
      if (viewers && (viewers.indexOf(u.id) !== -1)) viewerValues.push(u.id);
      viewerOptions.push(<option key={i+2} value={u.id}>{u.value}</option>);
    });
    // for(let i = 0; i < this.props.users.length; i++) {
    //   if (viewers && (viewers.indexOf(this.props.users[i].id) !== -1)) viewerValues.push(this.props.users[i].id);
    //   viewerOptions.push(<option key={i+2} value={this.props.users[i].id}>{this.props.users[i].value}</option>);
    // }

    let moduleOptions = this.props.modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    return(
      <Panel header='Nuevo formulario'>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="name">
            <ControlLabel>Nombre del formulario</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.name}
              onChange={this.handleChange}
              placeholder='Nombre del formulario'
            />
          </FormGroup>
          <FormGroup controlId="desc">
            <ControlLabel>Descripción</ControlLabel>
            <FormControl
              value={this.state.desc}
              onChange={this.handleChange}
              type="text"
              placeholder='Descripción del formulario'
            />
          </FormGroup>
          <FormGroup controlId="module">
            <ControlLabel>Modulo a que pertenece</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={this.state.module}
              onChange={this.handleChange}
            >
            {moduleOptions}
            </FormControl>
          </FormGroup>
          <FormGroup controlId="users">
            <ControlLabel>Usuarios del formulario</ControlLabel>
            <FormControl
              ref = {select => { this.select = select }}
              componentClass='select'
              multiple
              value={userValues}
              onChange={this.handleChangeUsers} >
              {userOptions}
            </FormControl>
          </FormGroup>

          <FormGroup controlId="viewers">
            <ControlLabel>Visores del formulario</ControlLabel>
            <FormControl
              ref = {selectViewer => { this.selectViewer = selectViewer }}
              componentClass='select'
              multiple
              value={viewerValues}
              onChange={this.handleChangeViewers} >
              {viewerOptions}
            </FormControl>
          </FormGroup>

          {formGroups}

          <Button
            bsStyle='primary'
            disabled={!this.validateForm()}
            type="submit" >Crear formulario</Button>

        </form>
      </Panel>

    );
  }
}

export default withToast(NewForm);
