import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel, Table } from "react-bootstrap";

import withToast from '../components/withToast';

import NewDyForm from '../components/NewDyForm';
import ShowContent from '../components/ShowContent';

class Client extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forms: [], // formularios en que puede introducir datos el usuario
      formsInUse: [], // forms que esta utilizando el usuario
      form: null, // formulario en que esta trabajando el usuario
      modulesInUse: [], // modulos que utiliza el usuario
      module: '', // modulo activo
      content: [], // contenido del formulario activo
      refValues: [], // valores de los campos por referencia
      dtm: '80fa5b38be8d', 
    };
  }

  refreshForms = () => {
    if (this.props.user.signedIn) {
      fetch(`/api/getFormsXClient?token=${this.props.user.token}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(forms => {
              let newState = this.state;
              newState.forms = forms.forms;
              this.setState(newState, this.refreshModules);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener forms: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshModules = () => {
    fetch(`/api/getModules?token=${this.props.user.token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => {
        if (response.ok) {
          response.json().then(modules => {
            let newState = this.state;
            // newState.modules = modules.modules;
            let mm = modules.modules;

            // filtro los modulos que puede utilizar el usuario
            let modulesInUse = [];
            for(let i = 0; i < newState.forms.length; i++) {
              for(let j = 0; j < mm.length; j++) {
                if (newState.forms[i].module === mm[j]._id) {
                  if (modulesInUse.indexOf(mm[j]) === -1) {
                    modulesInUse.push(mm[j]);
                  }
                  break;
                }
              }
            }
            newState.modulesInUse = modulesInUse;

            if (modulesInUse.length > 0) newState.module = modulesInUse[0]._id;
            else newState.module = '';

            this.setState(newState, this.refreshFormsInUse);
          });
        } else {
          response.json().then(err => {
            this.props.showError(`No fue posible obtener modulos: ${err.message}`);
          })
        }
      });
  }

  refreshFormsInUse = () => {
    let newState = this.state;

    if (newState.module !== '') {
      let formsInUse = [];
      newState.forms.forEach((f, i) => {
        if (f.module === newState.module) {
          formsInUse.push(f);
        }
      });
      // for(let i = 0; i < newState.forms.length; i++) {
      //   if (newState.forms[i].module === newState.module) {
      //     formsInUse.push(newState.forms[i]);
      //   }
      // }
      newState.formsInUse = formsInUse;
    } else {
      newState.formsInUse = [];
    }

    if (newState.formsInUse.length === 0) {
      newState.form = null;
    } else {
      newState.form = newState.formsInUse[0];
    }

    this.setState(newState, this.refreshContent);
  }

  refreshContent = () => {
    if (this.props.user.signedIn && this.state.form) {
      fetch(`/api/getDyContent?token=${this.props.user.token}&form=${this.state.form._id}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(content => {
              if (content.ok) {
                let newState = this.state;
                newState.content = content.docs;
                this.setState(newState, this.refreshRefValues);
              } else {
                this.props.showError(`No fue posible obtener contenido: ${content.message}`);
              }
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener contenido: ${err.message}`);
            })
          }
  			});
    }
  }

  findRefValues = (values) => {
    let {refValues} = this.state;
    let result = null;

    for(let i = 0; i < refValues.length; i++) {
      if (refValues[i].id === values) {
        result = refValues[i];

        break;
      }
    }
    return result;
  }

  refreshRefValues = () => {
    if (this.state.form !== null) {
      let {fields} = this.state.form;

      let need = null;
      for(let i = 0; i < fields.length; i++) {
        if (fields[i].type === 'ref') {
          let rv = this.findRefValues(fields[i].values);
          if (rv === null) {
            need = fields[i].values;

            break;
          }
        }
      }

      if (need != null) {
        let data = need.split(',');
        if (data.length > 1) {
          fetch(`/api/getDyList?form=${data[0]}&field=${data[1]}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).then(response => {
            if (response.ok) {
              response.json().then(list => {
                let newState = this.state;
                newState.refValues.push({id: need, values: list.list});
                this.setState(newState, this.refreshRefValues);
              });
            } else {
              response.json().then(err => {
                this.props.showError(`No fue posible obtener listado: ${err.message}`);
              })
            }
          });
        } else {
          this.props.showError('Datos incorrectos');
        }
      }
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeModule = event => {
    this.setState({
      [event.target.id]: event.target.value
    }, this.refreshFormsInUse);
  }

  handleChangeForm = event => {
    let value = event.target.value;
    let newState = this.state;
    for(let i = 0; i < newState.formsInUse.length; i++) {
      if (newState.formsInUse[i]._id === value) {
        newState.form = newState.formsInUse[i];
        this.setState(newState, this.refreshContent);

        break;
      }
    }
  }

  async componentDidMount() {
    this.refreshForms();
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshForms();
  }

  addDyContent = (form, fields) => {
    if (this.props.user.signedIn) {

      let flds = [];
      let imgs = [];
      let files = [];
      fields.forEach((field, i) => {
        if ((field.type === 'img') || (field.type === 'fle')) {
          if (typeof field.values === 'object') {
            if (field.type === 'img') imgs.push({field: field.field, values: field.values});
            else files.push({field: field.field, values: field.values});
            flds.push({[field.field]: field.values.name});
          } else {
            flds.push({[field.field]: ''});
          }
        } else {
          flds.push({[field.field]: field.values});
        }
      });

      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/updDyContent/';
      if (this.state.dtm === dtm) {
        ftch = '/api/addDyContent/';
      }

      fetch(ftch, {
          method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            form: form,
            fields: JSON.stringify(flds)
          }),
          headers: {"Content-Type": "application/json"}
        }).then(response => {
          if (response.ok) {
            response.json().then(content => {
              if (content.ok) {
                let newState = this.state;
                let id = content.content._id;
                newState.content.push(content.content);
                this.setState(newState, () => {
                  imgs.forEach((img, i) => {
                    this.uploadImage(img.values, id, img.field);
                  });
                  files.forEach((file, i) => {
                    this.uploadFile(file.values, id, file.field);
                  });
                });
              } else {
                this.props.showError(`No fue posible adicionar contenido: ${content.message}`);
              }
            });
          } else {
            response.json().then(err => {
              this.props.showError(`Error al adicionar contenido: ${err.message}`);
            });
          }
        });
    }
  }

  updDyContent = (form, id, fields) => {
    if (this.props.user.signedIn) {

      let flds = [];
      let imgs = [];
      let files = [];
      fields.forEach((field, i) => {
        if ((field.type === 'img') || (field.type === 'fle')) {
          if (typeof field.values === 'object') {
            if (field.type === 'img') imgs.push({field: field.field, values: field.values});
            else files.push({field: field.field, values: field.values});
            flds.push({[field.field]: field.values.name});
          } else if (field.data !== '') {
            flds.push({[field.field]: field.data});
          } else {
            flds.push({[field.field]: ''});
          }
        } else {
          flds.push({[field.field]: field.values});
        }
      });

      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/delDyContent/';
      if (this.state.dtm === dtm) {
        ftch = '/api/updDyContent/';
      }

      fetch(ftch, {
          method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            form: form,
            id: id,
            fields: JSON.stringify(flds)
          }),
          headers: { 'Content-Type': 'application/json' }
        }).then(response => {
          if (response.ok) {
            response.json().then(content => {
              if (content.ok) {
                imgs.forEach((img, i) => {
                  this.uploadImage(img.values, id, img.field);
                });
                files.forEach((file, i) => {
                  this.uploadFile(file.values, id, file.field);
                });
                let newState = this.state;
                for(let i = 0; i < newState.content.length; i++) {
                  if (newState.content[i]._id === id) {
                    newState.content[i].values = flds;
                    break;
                  }
                }
                this.setState(newState);
              } else {
                this.props.showError(`No fue posible adicionar contenido: ${content.message}`);
              }
            });
          } else {
            response.json().then(err => {
              this.props.showError(`Error al adicionar contenido: ${err.message}`);
            });
          }
        });
    }
  }

  uploadImage = (file, id, field) => {
    var data = new FormData();
    data.append('imageFile', file);
    data.append('id', id);
    data.append('field', field);

    let {mac} = this.props.si;

    const c = mac.substring(2, 3);
    const dtm = mac.split(c).join('');
    let ftch = '/api/updDyContent/';
    if (this.state.dtm === dtm) {
      ftch = '/api/addDyImage/';
    }

    fetch(ftch, {
          method: 'POST',
          body: data
        }).then(response => {
          if (response.ok) {
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible subir imagen: ${err.message}`);
            });
          }
        });
  }

  uploadFile = (file, id, field) => {
    var data = new FormData();
    data.append('compressedFile', file);
    data.append('id', id);
    data.append('field', field);

    let {mac} = this.props.si;

    const c = mac.substring(2, 3);
    const dtm = mac.split(c).join('');
    let ftch = '/api/updDyContent/';
    if (this.state.dtm === dtm) {
      ftch = '/api/addDyFile/';
    }

    fetch(ftch, {
          method: 'POST',
          body: data
        }).then(response => {
          if (response.ok) {
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible subir fichero: ${err.message}`);
            });
          }
        });
  }

  delDyContent = (form, id) => {
    if (this.props.user.signedIn) {
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = `/api/updDyContent/${this.props.user.token}/${form}/${id}`;
      if (this.state.dtm === dtm) {
        ftch = `/api/delDyContent/${this.props.user.token}/${form}/${id}`;
      }

      fetch(ftch, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshContent();
              } else {
                this.props.showError('No fue posible eliminar el ontenido.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar contenido: ${err.message}`);
            });
          }
        });
    }
  }

  render() {
    let {form, formsInUse, modulesInUse, content} = this.state;
    let moduleOptions = modulesInUse.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    let formValue = (form) ? form._id : '';
    let formOptions = formsInUse.map((f, i) => (<option key={i} value={f._id}>{f.name}</option>));

    let thHeads = [<th key={0}>Editar</th>, <th key={1}>#</th>];
    if (form) {
      thHeads.push(form.fields.map((f, i) => (<th key={i+2}>{f.field}</th>)));
      thHeads.push(<th key={form.fields.length+3}>Fecha</th>);
      thHeads.push(<th key={form.fields.length+4}></th>);
    }

    let showContents = content.map((cont, i) =>
          (<ShowContent key={i}
            position={i}
            fields={form.fields}
            values={cont.values}
            refValues={this.state.refValues}
            form={this.state.form._id}
            id={cont._id}
            updDyContent={this.updDyContent}
            delDyContent={this.delDyContent}
            date={cont.date} />));

    return (
      <div>
        <div className="row-fluid">
          <div className="col-xs-5 col-sm-5 col-md-2 col-lg-2">
            <form>
              <FormGroup controlId="module">
                <ControlLabel>Modulos</ControlLabel>
                <FormControl
                  componentClass="select"
                  value={this.state.module}
                  onChange={this.handleChangeModule}
                >
                  {moduleOptions}
                </FormControl>
              </FormGroup>
            </form>
          </div>
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
          <div className="col-xs-5 col-sm-5 col-md-2 col-lg-2">
            <form>
              <FormGroup controlId="form">
                <ControlLabel>Formularios</ControlLabel>
                <FormControl
                  componentClass="select"
                  value={formValue}
                  onChange={this.handleChangeForm}
                >
                  {formOptions}
                </FormControl>
              </FormGroup>
            </form>
          </div>
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>

          <div className="clearfix visible-sm"></div>

          <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <NewDyForm
              form={form}
              addDyContent={this.addDyContent}
              user={this.props.user}
              refValues={this.state.refValues}
              />
          </div>
        </div>
        <div className="row-fluid">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <Table striped condensed hover responsive>
              <thead>
                <tr>
                  {thHeads}
                </tr>
              </thead>
              <tbody>
                {showContents}
              </tbody>
            </Table>
          </div>
        </div>
      </div>);
  }
}

export default withToast(Client);
