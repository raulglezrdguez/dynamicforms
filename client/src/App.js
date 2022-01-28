import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";

import { Nav, Navbar, NavDropdown, MenuItem } from "react-bootstrap";

import Routes from "./Routes";
import RouteNavItem from "./components/RouteNavItem";

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: { signedIn: false, name: '', token: '', rol: '', id: '' },
      si: {}
    };

  }

  redirectUser = () => {
    const {user} = this.state;

    switch (user.rol) {
      case 'administrator':
        this.props.history.push("/admusers");
        break;
      default:
        this.props.history.push("/client");
    }
  }

  onSignin = data => {
		let user = { signedIn: true, name: data.name, token: data.token, rol: data.rol, id: data.id };
		this.setState({ user }, this.redirectUser );
	}

  onSignout = () => {
		fetch(`/api/signout/${this.state.user.token}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}).then(response => {
				if (response.ok) {
					this.setState({ user: { signedIn: false, name: '', token: '', id: '' } }, () => {
						this.props.history.push("/login");
					});
				}
			});
	}

  getSi = () => {
    fetch('/api/getDyData/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
			}).then(response => {
				if (response.ok) {
          response.json().then(si => {
            let newState = this.state;
            newState.si = si.data;
            this.setState(newState);
          });
				}
			});
  }

  componentDidMount() {
    this.getSi();
  }

  render() {
    const childProps = {
      user: this.state.user,
			onSignin: this.onSignin,
			onSignout: this.onSignout,
      si: this.state.si
    };

    let menu = null;
    if (this.state.user.signedIn) {
      switch (this.state.user.rol) {
        case 'administrator':
          menu = <Nav>
            <NavDropdown title='Administracion' id="admon-dropdown">
              <MenuItem eventKey={2} onClick={() => this.props.history.push("/admforms")}>Formularios</MenuItem>
              <MenuItem eventKey={3} onClick={() => this.props.history.push("/admmodules")}>Módulos</MenuItem>
              <MenuItem eventKey={4} onClick={() => this.props.history.push("/admusers")}>Usuarios</MenuItem>
            </NavDropdown>
            <RouteNavItem eventKey={5} href="/client">Clientes</RouteNavItem>
            <RouteNavItem eventKey={6} href="/report">Reportes</RouteNavItem>
          </Nav>
          break;
        default:
          menu = <Nav>
            <RouteNavItem eventKey={2} href="/client">Clientes</RouteNavItem>
            <RouteNavItem eventKey={3} href="/report">Reportes</RouteNavItem>
          </Nav>
      }
    } else {
      menu = <Nav>
        <RouteNavItem eventKey={3} href="/report">Reportes</RouteNavItem>
      </Nav>
    }

    let currentYear = new Date().getFullYear();

    return (
      <div className="App">
          <div>
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
            </header>
            <div className="App container">
              <Navbar fluid collapseOnSelect>
                <Navbar.Header>
                  <Navbar.Brand>
                    <Link to="/">Inicio</Link>
                  </Navbar.Brand>
                  <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                  {menu}
                  <Nav pullRight>
                    {this.state.user.signedIn
                      ? <NavDropdown title={this.state.user.name} id="user-dropdown">
                					<MenuItem eventKey={1} onClick={this.onSignout}>Salir</MenuItem>
                				</NavDropdown>
                      : <RouteNavItem eventKey={1} href="/login">Login</RouteNavItem>}
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </div>
          </div>

          <div>
            <Routes childProps={childProps} />
          </div>

          <div className="row-fluid">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <div className="App-footer">
                <p>Joven Club &copy; {currentYear}</p>
              </div>
            </div>
          </div>

      </div>
    );
  }
}

export default withRouter(App);


/*


<div class="example3">
  <nav class="navbar navbar-inverse navbar-static-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar3">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="http://disputebills.com"><img src="https://res.cloudinary.com/candidbusiness/image/upload/v1455406304/dispute-bills-chicago.png" alt="Dispute Bills">
        </a>
      </div>
      <div id="navbar3" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <li class="active"><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>
            <ul class="dropdown-menu" role="menu">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li class="divider"></li>
              <li class="dropdown-header">Nav header</li>
              <li><a href="#">Separated link</a></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </li>
        </ul>
      </div>
      <!--/.nav-collapse -->
    </div>
    <!--/.container-fluid -->
  </nav>
</div>




css

.example3 .navbar-brand {
  height: 80px;
}

.example3 .nav >li >a {
  padding-top: 30px;
  padding-bottom: 30px;
}
.example3 .navbar-toggle {
  padding: 10px;
  margin: 25px 15px 25px 0;
}



*/
