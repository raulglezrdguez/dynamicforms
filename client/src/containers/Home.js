import React, { Component } from "react";
import { Link } from "react-router-dom";

// import withToast from '../components/withToast';

import "./Home.css";

class Home extends Component {

  render() {
    let begin = <Link to="/report" className="btn btn-success btn-lg">Comenzar</Link>;
    if (this.props.user.signedIn && this.props.user.rol === 'administrator') {
      begin = <Link to="/admforms" className="btn btn-success btn-lg">Comenzar</Link>;
    }
    let lander = this.props.user.signedIn
              ? <div className="lander">
                  <h3>Bienvenido a la pagina de Formularios dinámicos</h3>
                  <p>Haga clic en el botón <strong>Comenzar</strong> para definir los formularios.</p>
                  <div>
                    {begin}
                  </div>
                </div>
              : <div className="lander">
                  <h3>Bienvenido a la pagina de Formularios dinámicos</h3>
                  <p>Debe loguearse para trabajar como administrador o utilizar los formularios como cliente.</p>
                  <div>
                    <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                    <Link to="/report" className="btn btn-success btn-lg">Reportes</Link>
                  </div>
                </div>;
    return (
      <div className="Home">
        {lander}
      </div>
    );
  }
}

export default Home;
// export default withToast(Home);
