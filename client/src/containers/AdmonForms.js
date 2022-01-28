import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import NewForm from '../components/NewForm';
import ShowForm from '../components/ShowForm';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

class AdmonForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allForms: [],
      moduleForms: [], // forms del module activo
      forms: [], // forms del modulo de la pagina activa
      users: [],
      modules: [], // modulos a los que puede acceder el usuario
      module: '', // modulo activo
      currentPage: 1, // pagina que se muestra
      items4Page: 1, // forms por pagina
      // itemsTotal: 0 // cantidad de forms total
      dtm: '80fa5b38be8d',
    };
  }

  refreshAllForms = () => {
    if (this.props.user.signedIn) {
  		fetch(`/api/getForms?token=${this.props.user.token}&skip=0`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(forms => {
              let newState = this.state;
              // newState.itemsTotal = forms.count;
              newState.allForms = forms.forms;
              this.setState(newState, this.refreshForms);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener todas las forms: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshForms = () => {
    let newState = this.state;

    let moduleForms = [];
    if (newState.module !== '') {
      newState.allForms.forEach((f, i) => {
        if (f.module === newState.module) {
          moduleForms.push(f);
        }
      });
    }
    newState.moduleForms = moduleForms;

    let totalItems = moduleForms.length;
    let skip = (newState.currentPage - 1) * newState.items4Page;
    if ((skip + newState.items4Page) > totalItems) {
      skip = 0;
      newState.currentPage = 1;
    }
    let forms = [];
    for(let i = skip; (i < moduleForms.length) && (i < (skip + newState.items4Page)); i++) {
      forms.push(moduleForms[i]);
    }
    newState.forms = forms;
    this.setState(newState);
	}

  refreshModules = () => {
    if (this.props.user.signedIn) {
  		fetch(`/api/getModules?token=${this.props.user.token}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(modules => {
              let mods = modules.modules;
              let newState = this.state;
              newState.modules = mods;
              if (mods.length > 0) newState.module = mods[0]._id;
              else newState.module = '';
              this.setState(newState, this.refreshAllForms);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modules: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshUsers = () => {
    if (this.props.user.signedIn) {
  		fetch(`/api/getUsers?token=${this.props.user.token}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(users => {
              let newState = this.state;
              newState.users = users.users;
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener users: ${err.message}`);
            })
          }
  			});
    }
	}

  /*encodeHtmlEntity(str) {
    var buf = [];
    for (var i=str.length-1;i>=0;i--) {
      buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
  };

  decodeHtmlEntity(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    });
  };*/

  addForm = (form) => {
    if (this.props.user.signedIn) {
      let {name, desc, fields, users, viewers, module} = form;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/updForm/';
      if (this.state.dtm === dtm) {
        ftch = '/api/addForm/';
      }

      fetch(ftch, {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            name: name,
            desc: desc,
            module: module,
            usrs: JSON.stringify(users),
            viewers: JSON.stringify(viewers),
            fields: JSON.stringify(fields)
          }),
          headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(form => {
              this.refreshAllForms();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar form: ${err.message}`);
            });
          }
  			});
    }
  }

  updForm = (form) => {
    if (this.props.user.signedIn) {
      let {_id, name, desc, fields, users, viewers, module} = form;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/delForm/';
      if (this.state.dtm === dtm) {
        ftch = '/api/updForm/';
      }

      fetch(ftch, {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            id: _id,
            name: name,
            desc: desc,
            module: module,
            usrs: JSON.stringify(users),
            viewers: JSON.stringify(viewers),
            fields: JSON.stringify(fields)
          }),
          headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(form => {
              let f = form.form;
              let newState = this.state;
              for(let i = 0; i < newState.forms.length; i++) {
                if (newState.forms[i]._id === _id) {
                  newState.forms[i].name = f.name;
                  newState.forms[i].desc = f.desc;
                  newState.forms[i].module = f.module;
                  newState.forms[i].users = f.users;
                  newState.forms[i].viewers = f.viewers;
                  newState.forms[i].fields = f.fields;
                  newState.forms[i].date = f.date;
                  break;
                }
              }
              for(let i = 0; i < newState.allForms.length; i++) {
                if (newState.allForms[i]._id === _id) {
                  newState.allForms[i].name = f.name;
                  newState.allForms[i].desc = f.desc;
                  newState.allForms[i].module = f.module;
                  newState.allForms[i].users = f.users;
                  newState.allForms[i].viewers = f.viewers;
                  newState.allForms[i].fields = f.fields;
                  newState.allForms[i].date = f.date;
                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar form: ${err.message}`);
            });
          }
  			});
    }
  }

  delForm = (_id) => {
    if (this.props.user.signedIn) {
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = `/api/updForm/${this.props.user.token}/${_id}`;
      if (this.state.dtm === dtm) {
        ftch = `/api/delForm/${this.props.user.token}/${_id}`;
      }

      fetch(ftch, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshAllForms();
                // this.refreshForms();
              } else {
                this.props.showError('No fue posible eliminar el formulario: revise sus relaciones con otros formularios.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar form: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    // this.refreshAllForms();
    // this.refreshForms();
    this.refreshUsers();
    this.refreshModules();
  }

  handleChangeModule = event => {
    this.setState({
      [event.target.id]: event.target.value
    }, this.refreshForms);
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, () => {this.refreshForms();});
  }

  updPage = () => {
    let {currentPage, forms} = this.state;

    if ((currentPage !== 1) && (forms.length === 0)) {
      let newState = this.state;
      newState.currentPage = 1;
      this.setState(newState, () => {this.refreshForms();});
    }
  }

  render() {
    let {modules} = this.state;

    let moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    let showForms = this.state.forms.map((f, i) => (<ShowForm key={i} updForm={this.updForm} delForm={this.delForm} form={f} users={this.state.users} forms={this.state.allForms} modules={this.state.modules} />));

    return(
      <div>
        <div className="row-fluid">
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Listado de formularios <span className="label label-primary">{this.state.forms.length}</span></h3>

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

            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.moduleForms.length / this.state.items4Page)} currentPage={this.state.currentPage} />
              {showForms}
            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.moduleForms.length / this.state.items4Page)} currentPage={this.state.currentPage} />

          </div>
          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>

          <div className="clearfix visible-xs"></div>

          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Creando nuevo formulario</h3>
            <NewForm addForm={this.addForm} users={this.state.users} forms={this.state.allForms} modules={this.state.modules} />
          </div>
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
        </div>
      </div>
    );
  }
}

export default withToast(AdmonForms);
