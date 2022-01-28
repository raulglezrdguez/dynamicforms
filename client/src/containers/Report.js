import React, { Component } from "react";
import { Form, FormGroup, FormControl, ButtonToolbar, Button, Glyphicon, Panel } from "react-bootstrap";

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import ReportContent from '../components/ReportContent';

import FileSaver from 'file-saver';

class Report extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forms: [], // formularios que puede ver el usuario
      formsInUse: [], // forms del modulo que esta viendo el usuario
      form: null, // formulario que esta viendo el usuario
      modulesInUse: [], // modulos que puede ver el usuario
      module: '', // modulo activo
      content: [], // contenido del formulario activo
      refValues: [], // valores de los campos por referencia
      currentPage: 1, // pagina que se muestra
      items4Page: 10, // contenidos a mostrar por pagina
      itemsTotal: 0, // cantidad de contenidos total que hay del formulario activo
      saveAll: '0', // guardo todo el contenido (1) o la página activa (0)
    };
  }

  refreshForms = () => {
    let fetchApi = '/api/getFormsView';
    if (this.props.user.signedIn) {
      fetchApi = `/api/getFormsView?token=${this.props.user.token}`;
    }
    fetch(fetchApi, {
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

  refreshModules = () => {
    fetch('/api/getAllModules', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => {
        if (response.ok) {
          response.json().then(modules => {
            let newState = this.state;
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
    if (this.state.form) {
      let { items4Page, currentPage } = this.state;
      let skip = (currentPage - 1) * items4Page;
      fetch(`/api/getAllDyContent?form=${this.state.form._id}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(content => {
              let newState = this.state;
              newState.itemsTotal = content.count;
              newState.content = content.docs;
              this.setState(newState, this.refreshRefValues);
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

  setModule = module => {
    this.setState({module}, this.refreshFormsInUse);
  }

  // handleChangeModule = event => {
  //   this.setState({
  //     [event.target.id]: event.target.value
  //   }, this.refreshFormsInUse);
  // }

  setForm = form => {
    let newState = this.state;
    for(let i = 0; i < newState.formsInUse.length; i++) {
      if (newState.formsInUse[i]._id === form) {
        newState.form = newState.formsInUse[i];
        this.setState(newState, this.refreshContent);

        break;
      }
    }
  }

  // handleChangeForm = event => {
  //   let value = event.target.value;
  //   let newState = this.state;
  //   for(let i = 0; i < newState.formsInUse.length; i++) {
  //     if (newState.formsInUse[i]._id === value) {
  //       newState.form = newState.formsInUse[i];
  //       this.setState(newState, this.refreshContent);
  //
  //       break;
  //     }
  //   }
  // }

  handleChangeSaveAll = event => {
    let newState = this.state;
    newState.saveAll = event.target.value;
    this.setState(newState);
  }

  getValue(field, values) {
    let res = '';
    for(let i = 0; i < values.length; i++) {
      if (values[i][field] !== undefined) {
        res = values[i][field];

        break;
      }
    }

    return res;
  }

  getRefValue = (values, id) => {
    let {refValues} = this.state;
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

  saveSubmit = async event => {
    event.preventDefault();

    let {saveAll, form} = this.state;
    let lines = '';
    form.fields.forEach(ff => {
      if (lines === '') lines = ff.field;
      else lines += ',' + ff.field;
    });

    if (saveAll === '0') {
      this.state.content.forEach(cc => {
        lines += '\r\n';
        form.fields.forEach((ff, i) => {
          let value = this.getValue(ff.field, cc.values);
          if (ff.type === 'ref') {
            value = this.getRefValue(ff.values, value);
          }
          if (i === 0) lines += value;
          else lines += ',' + value;
        });
      });
      let blob = new Blob([lines], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, form.name+'.csv');
    } else {
      fetch(`/api/getAllDyContent?form=${form._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(content => {
              content.docs.forEach(cc => {
                lines += '\r\n';
                form.fields.forEach((ff, i) => {
                  let value = this.getValue(ff.field, cc.values);
                  if (ff.type === 'ref') {
                    value = this.getRefValue(ff.values, value);
                  }
                  if (i === 0) lines += value;
                  else lines += ',' + value;
                });
              });
              let blob = new Blob([lines], {type: "text/plain;charset=utf-8"});
              FileSaver.saveAs(blob, form.name+'.csv');
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener contenido: ${err.message}`);
            })
          }
        });
    }
  }

  async componentDidMount() {
    this.refreshForms();
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshForms();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, this.refreshContent);
  }

  updPage = () => {
    let {currentPage, content} = this.state;

    if ((currentPage !== 1) && (content.length === 0)) {
      let newState = this.state;
      newState.currentPage = 1;
      this.setState(newState, this.refreshContent);
    }
  }

  render() {

    let {form, formsInUse, modulesInUse, content, items4Page, currentPage, saveAll} = this.state;
    // let moduleOptions = modulesInUse.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    let moduleDesc = '';
    let moduleButtons = modulesInUse.map((m, i) => {
      if (m._id === this.state.module) {
        moduleDesc = m.desc;
        return (<Button key={i} bsStyle='primary' disabled>{m.name}</Button>);
      } else {
        return (<Button key={i} bsStyle='info' onClick={() => this.setModule(m._id)} >{m.name}</Button>);
      }
    });

    let formValue = (form) ? form._id : '';
    let formDesc = '';
    // let formOptions = formsInUse.map((f, i) => (<option key={i} value={f._id}>{f.name}</option>));
    let formButtons = formsInUse.map((f, i) => {
      if (f._id === formValue) {
        formDesc = f.desc;
        return (<Button key={i} bsStyle='primary' disabled>{f.name}</Button>);
      } else {
        return (<Button key={i} bsStyle='info' onClick={() => this.setForm(f._id)}>{f.name}</Button>);
      }
    });

    let thHeads = [<th key={0}>#</th>];
    if (form) {
      thHeads.push(form.fields.map((f, i) => (<th key={i+1}>{f.field}</th>)));
      thHeads.push(<th key={form.fields.length+3}>Fecha</th>);
    }

    let skip = (currentPage - 1) * items4Page;
    let reportContents = content.map((cont, i) =>
          (<ReportContent key={i}
            position={skip + i}
            fields={form.fields}
            values={cont.values}
            refValues={this.state.refValues}
            form={this.state.form._id}
            id={cont._id}
            date={cont.date}
             />));

    return (
      <div>
        <div className="row-fluid">
          <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
            <ButtonToolbar align='center'>
              {moduleButtons}
            </ButtonToolbar>
            <Panel align='left' bsStyle='primary' >{moduleDesc}</Panel>
          </div>
          <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8">
            <ButtonToolbar>
              {formButtons}
            </ButtonToolbar>
            <Panel align='left' bsStyle='primary' >{formDesc}</Panel>
          </div>
        </div>
        <div className="row-fluid">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <Form inline onSubmit={this.saveSubmit}>
              <Button type="submit" className='btn-primary'><Glyphicon glyph="briefcase"></Glyphicon> Exportar</Button>{' '}
              <FormGroup controlId="saveall">
                <FormControl
                  componentClass="select"
                  value={saveAll}
                  onChange={this.handleChangeSaveAll}
                >
                  <option value='0'>Esta página</option>
                  <option value='1'>Todo</option>
                </FormControl>
              </FormGroup>{' '}
            </Form>
          </div>
        </div>
        <div className="row-fluid">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <h4>Contenido <span className="label label-primary">{this.state.itemsTotal}</span></h4>

            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />

              <div>
                {reportContents}
              </div>

              <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />
          </div>

        </div>
      </div>
    )
  }
}

export default withToast(Report);

/*
<Table striped condensed hover responsive>
  <thead>
    <tr>
      {thHeads}
    </tr>
  </thead>
  <tbody>
    {reportContents}
  </tbody>
</Table>
*/
