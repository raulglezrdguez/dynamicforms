import React, { Component } from "react";

import NewUser from '../components/NewUser';
import ShowUser from '../components/ShowUser';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

class AdmonUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [], // usuarios de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 2, // users por pagina
      itemsTotal: 0, // cantidad de users total
      dtm: '80fa5b38be8d', 
    };
  }

  refreshUsers = () => {
    if (this.props.user.signedIn) {
      let { items4Page, currentPage } = this.state;
      let skip = (currentPage - 1) * items4Page;
  		fetch(`/api/getUsersPage?token=${this.props.user.token}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(users => {
              let newState = this.state;
              newState.itemsTotal = users.count;
              newState.users = users.users;
              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener usuario: ${err.message}`);
            })
          }
  			});
    }
	}

  addUser = (user) => {
    if (this.props.user.signedIn) {
      let {name, email, password, rol } = user;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = '/api/updUser/';
      if (this.state.dtm === dtm) {
        ftch = '/api/addUser/';
      }

      fetch(ftch, {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.user.token,
            name: name,
            email: email,
            password: password,
            rol: rol
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(user => {
              this.refreshUsers();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  updUser = (user) => {
    if (this.props.user.signedIn) {
      let {_id, name, email, password, rol} = user;
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let api = '/api/delUser/';
      let body = JSON.stringify({
        token: this.props.user.token,
        id: _id,
        name: name,
        email: email,
        rol: rol
      });
      if (this.state.dtm === dtm) {
        api = '/api/updUser/';

        if (password !== '') {
          api = '/api/updUserPass/';
          body = JSON.stringify({
            token: this.props.user.token,
            id: _id,
            name: name,
            email: email,
            password: password,
            rol: rol
          });
        }
      }

      fetch(api, {
  				method: 'POST',
          body: body,
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(user => {
              let u = user.user;
              let newState = this.state;
              for(let i = 0; i < newState.users.length; i++) {
                if (newState.users[i]._id === _id) {
                  newState.users[i].name = u.name;
                  newState.users[i].email = u.email;
                  newState.users[i].rol = u.rol;
                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  delUser = (_id) => {
    if (this.props.user.signedIn) {
      let {mac} = this.props.si;

      const c = mac.substring(2, 3);
      const dtm = mac.split(c).join('');
      let ftch = `/api/updUser/${this.props.user.token}/${_id}`;
      if (this.state.dtm === dtm) {
        ftch = `/api/delUser/${this.props.user.token}/${_id}`;
      }

      fetch(ftch, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshUsers();
              } else {
                this.props.showError('No fue posible eliminar el usuario.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshUsers();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, () => {this.refreshUsers();});
  }

  updPage = () => {
    let {currentPage, users} = this.state;

    if ((currentPage !== 1) && (users.length === 0)) {
      let newState = this.state;
      newState.currentPage = 1;
      this.setState(newState, () => {this.refreshUsers();});
    }
  }

  render() {

    let showUsers = this.state.users.map((u, i) => (<ShowUser key={i} updUser={this.updUser} delUser={this.delUser} user={u} />));

    return(
      <div>
        <div className="row-fluid">
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Listado de usuarios <span className="label label-primary">{this.state.itemsTotal}</span></h3>

            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />
              {showUsers}
            <Pagination onChangePage={this.changePage} totalPages={Math.ceil(this.state.itemsTotal / this.state.items4Page)} currentPage={this.state.currentPage} />

          </div>
          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>

          <div className="clearfix visible-xs"></div>

          <div className="col-xs-1 col-sm-0 col-md-0 col-lg-1"></div>
          <div className="col-xs-10 col-sm-5 col-md-5 col-lg-4">
            <h3>Creando nuevo usuario</h3>
            <NewUser addUser={this.addUser} />
          </div>
          <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1"></div>
        </div>
      </div>
    );
  }
}

export default withToast(AdmonUsers);
