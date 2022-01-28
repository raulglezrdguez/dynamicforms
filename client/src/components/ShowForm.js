import React, { Component } from "react";
import { Panel, ListGroup, ListGroupItem, Table, Button, Glyphicon } from "react-bootstrap";

import EditForm from './EditForm';

// import withToast from '../components/withToast';

class ShowForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false, // editando el formulario?
    };
  }

  getType(t) {
    switch (t) {
      case 'txt': return 'Texto';
      case 'lst': return 'Elementos';
      case 'num': return 'Numero';
      case 'img': return 'Imagenes';
      case 'fle': return 'Fichero';
      case 'ref': return 'Referencia';
      case 'dte': return 'Fecha';
      case 'tme': return 'Hora';
      default: return '';
    }
  }

  getValues = (t, v) => {
    let {forms} = this.props;

    switch (t) {
      case 'txt': return '';
      case 'lst': return v;
      case 'num': return '';
      case 'img': return '';
      case 'fle': return '';
      case 'ref':
        let vls = v.split(',');
        if (vls.length > 1) {
          forms.forEach((f, i) => {
            if (f._id === vls[0]) return f.name + '(' + vls[1]+ ')';
          });
          // for(let i = 0; i < forms.length; i++) {
          //   if (forms[i]._id === vls[0]) return forms[i].name + '(' + vls[1]+ ')';
          // }
        }
        return '';
      case 'dte': return '';
      case 'tme': return '';
      default: return '';
    }
  }

  render() {
    const { form } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updForm, users, forms, modules} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditForm updForm={updForm} form={form} users={users} forms={forms} modules={modules} />;
    } else {
      const date = new Date(form.date);
      const fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

      bEdit = <Button bsStyle='success' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      if ((form.fields.length > 0) && (form.fields[form.fields.length - 1].field === '')) {
        form.fields.splice(-1, 1);
      }

      let fields = form.fields.map((field, i) => (
        <tr key={i} align='left' valign="baseline">
        <td>{field.field}</td>
        <td>{this.getType(field.type)}</td>
        <td>{this.getValues(field.type, field.values)}</td>
        </tr>));

      content = <ListGroup>
        <ListGroupItem>
          <p>{form.desc}</p>
        </ListGroupItem>
        <ListGroupItem>
          <p>Creado: {fecha}</p>
        </ListGroupItem>
        <ListGroupItem>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Campo</th>
                <th>Tipo</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {fields}
            </tbody>
          </Table>
        </ListGroupItem>
      </ListGroup>;
    }


    return (
      <Panel header={form.name}>
        <ListGroup>
          <ListGroupItem>
            <div className="text-center" style={{height: '20px'}}>
              {bEdit}
              <Button bsStyle='danger' bsSize='xsmall' style={{float: 'right'}} onClick={() => this.props.delForm(form._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
            </div>
          </ListGroupItem>
        </ListGroup>
        {content}
      </Panel>);
  }
}

export default ShowForm;
// export default withToast(ShowForm);
