import React, { Component } from "react";
import { Panel, ListGroup, ListGroupItem, Button, Glyphicon } from "react-bootstrap";

import EditUser from './EditUser';

// import withToast from '../components/withToast';

class ShowUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false, // editando?
    };
  }

  render() {
    const { user } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updUser} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditUser updUser={updUser} user={user} />;
    } else {
      let fecha = 'Al iniciar sistema';
      if (user.date !== undefined) {
        const date = new Date(user.date);
        fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      }

      bEdit = <Button bsStyle='success' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <ListGroup>
        <ListGroupItem>
          <p>{user.email}</p>
        </ListGroupItem>
        <ListGroupItem>
          <p>Creado: {fecha}</p>
        </ListGroupItem>
      </ListGroup>;
    }


    return (
      <Panel header={user.name}>
        <ListGroup>
          <ListGroupItem>
            <div className="text-center" style={{height: '20px'}}>
              {bEdit}
              <Button bsStyle='danger' bsSize='xsmall' style={{float: 'right'}} onClick={() => this.props.delUser(user._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
            </div>
          </ListGroupItem>
        </ListGroup>
        {content}
      </Panel>);
  }
}

export default ShowUser;
// export default withToast(ShowUser);
