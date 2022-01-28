import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditDyForm from './EditDyForm';

class ShowContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false, // editando el contenido?
      values: [], // valores de los campos
    };
  }

  getRefValue = (values, id) => {
    let {refValues} = this.props;

    let result = '';

    for(let i = 0; i < refValues.length; i++) {
      if (refValues[i].id === values) {
        for(let j = 0; j < refValues[i].values.length; j++) {
          if (refValues[i].values[j].id === id) {
            result = refValues[i].values[j].value;

            break;
          }
        }
      }
    }

    return result;
  }

  findRefValues = (values) => {
    let {refValues} = this.props;
    let result = null;

    for(let i = 0; i < refValues.length; i++) {
      if (refValues[i].id === values) {
        result = refValues[i];

        break;
      }
    }
    return result;
  }

  verifyProps = (props) => {
    let {fields, values } = props;
    let newState = this.state;
    newState.values = [];
    // if (fields.length === values.length) {
      for(let i = 0; i < fields.length; i++) {
        let found = false;
        for(let j = 0; j < values.length; j++) {
          if (values[j][fields[i].field] !== undefined) {
            found = true;
            newState.values[fields[i].field] = values[j][fields[i].field];

            // let rv = this.findRefValues(fields[i].values);
            // if ((fields[i].type === 'ref') && (rv === null)) {
            // // if ((fields[i].type === 'ref') && (refValues[fields[i].values] === undefined)) {
            //   this.props.refreshRefValues(fields[i].values);
            // }

            break;
          }
        }
        if (!found) newState.values[fields[i].field] = '';
        // if (!found) return false;
      }
      this.setState(newState);
      // return true;
    // }
    // return false;
  }

  async componentDidMount() {
    this.verifyProps(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.verifyProps(nextProps);
  }

  noEdit = () => {
    let newState = this.state;
    newState.editing = false;
    this.setState(newState);
  }

  render() {
    let {fields, position} = this.props;
    let {editing, values} = this.state;
    let bEdit = null;
    let tdCells = [];
    if (editing) {
      bEdit = <Button bsStyle='warning' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      tdCells = [<td key={0}>{bEdit}</td>, <td key={1}>{position}</td>];

      tdCells.push(
        <td key={2} colSpan={fields.length + 2} align='center'>
          <EditDyForm
            fields={this.props.fields}
            values={this.props.values}
            refValues={this.props.refValues}
            form={this.props.form}
            id={this.props.id}
            updDyContent={this.props.updDyContent}
            noEdit={this.noEdit}
            />
        </td>);
    } else {
      bEdit = <Button bsStyle='success' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      tdCells = [<td key={0}>{bEdit}</td>, <td key={1}>{position}</td>];
      if (fields) {
        fields.forEach((f, i) => {
          if ((values[f.field] !== undefined) && (values[f.field] !== '')){
            switch (f.type) {
              case 'txt':
              case 'num':
              case 'lst':
                tdCells.push(<td key={i+2}>{values[f.field]}</td>);
                break;
              case 'ref':
                tdCells.push(<td key={i+2}>{this.getRefValue(f.values, values[f.field])}</td>);
                break;
              case 'img':
                let ext = 'jpg';
                if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                  ext = values[f.field].split('.').pop();
                }
                let src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + this.props.id + '-' + f.field + '_thumb.' + ext;
                tdCells.push(<td key={i+2}><img src={src} alt='sin imagen' /></td>);
                break;
              case 'fle':
                let fileName = '';
                if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                  fileName = values[f.field];
                }
                tdCells.push(<td key={i+2}>{fileName}</td>);
                break;
              case 'dte':
                tdCells.push(<td key={i+2}>{values[f.field]}</td>);
                break;
              case 'tme':
                tdCells.push(<td key={i+2}>{values[f.field]}</td>);
                break;
              default:
                tdCells.push(<td key={i+2}></td>);
            }
          } else {
            tdCells.push(<td key={i+2}></td>);
          }
        });
        const date = new Date(this.props.date);
        let fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        tdCells.push(<td key={fields.length+3}>{fecha}</td>);
        tdCells.push(<td key={fields.length+4} align='right'><Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delDyContent(this.props.form, this.props.id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button></td>);
      }
    }

    return (
      <tr align='left'>
        {tdCells}
      </tr>);
  }
}

export default ShowContent;
