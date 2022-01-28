import React, { Component } from "react";

import NewModule from '../components/NewModule';
import ShowModule from '../components/ShowModule';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

class AdmonModules extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modules: [], // modules de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 2, // modules por pagina
      itemsTotal: 0, // cantidad de modules total
      dtm: '80fa5b38be8d', 
    };
  }

  refreshModules = () => {
    if (this.props.user.signedIn) {
      let { items4Page, currentPage } = this.state;
      let skip = (currentPage - 1) * items4Page;
  		fetch(`/api/getModulesPage?token=${this.props.user.token}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.itemsTotal = modules.count;
              newState.modules = modules.modules;
              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message}`);
            })
          }
  			});
    }
	}

  addModule = (module) => {
    if (this.props.user.signedIn) {
      let {name, desc } = module;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/updModule/';
      if (this.state.dtm === dtm) {
        ftch = '/api/addModule/';
      }

      fetch(ftch, {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            name: name,
            desc: desc
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(module => {
              this.refreshModules();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar modulo: ${err.message}`);
            });
          }
  			});
    }
  }

  updModule = (module) => {
    if (this.props.user.signedIn) {
      let {_id, name, desc} = module;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/delModule/';
      if (this.state.dtm === dtm) {
        ftch = '/api/updModule/';
      }

      fetch(ftch, {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            id: _id,
            name: name,
            desc: desc
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(module => {
              let m = module.module;
              let newState = this.state;
              for(let i = 0; i < newState.modules.length; i++) {
                if (newState.modules[i]._id === _id) {
                  newState.modules[i].name = m.name;
                  newState.modules[i].desc = m.desc;
                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar modulo: ${err.message}`);
            });
          }
  			});
    }
  }

  delModule = (_id) => {
    if (this.props.user.signedIn) {
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = `/api/updModule/${this.props.user.token}/${_id}`;
      if (this.state.dtm === dtm) {
        ftch = `/api/delModule/${this.props.user.token}/${_id}`;
      }

      fetch(ftch, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshModules();
              } else {
                this.props.showError('No fue posible eliminar el modulo.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar modulo: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshModules();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, () => {this.refreshModules();});
  }

  updPage = () => {
    let {currentPage, modules} = this.state;

    if ((currentPage !== 1) && (modules.length === 0)) {
      let newState = this.state;
      newState.currentPage = 1;
      this.setState(newState, () => {this.refreshModules();});
    }
  }

  render() {

    let showModules = this.state.modules.map((m, i) => (<ShowModule key={i} updModule={this.updModule} delModule={this.delModule} module={m} />));

    return(
      <div>
        <div className="row-fluid">
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Listado de modulos <span className="label label-primary">{this.state.itemsTotal}</span></h3>

            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />
              {showModules}
            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />

          </div>
          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>

          <div className="clearfix visible-xs"></div>

          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Creando nuevo modulo</h3>
            <NewModule addModule={this.addModule} />
          </div>
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
        </div>
      </div>
    );
  }
}

export default withToast(AdmonModules);
