import React, { Component } from "react";
import { Panel, ListGroup, ListGroupItem, Button, Glyphicon } from "react-bootstrap";

import EditModule from './EditModule';

// import withToast from '../components/withToast';

class ShowModule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false, // editando?
    };
  }

  render() {
    const { module } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updModule} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditModule updModule={updModule} module={module} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' style={{float: 'left'}} onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <ListGroup>
        <ListGroupItem>
          <p>{module.desc}</p>
        </ListGroupItem>
      </ListGroup>;
    }

    return (
      <Panel header={module.name}>
        <ListGroup>
          <ListGroupItem>
            <div className="text-center" style={{height: '20px'}}>
              {bEdit}
              <Button bsStyle='danger' bsSize='xsmall' style={{float: 'right'}} onClick={() => this.props.delModule(module._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
            </div>
          </ListGroupItem>
        </ListGroup>
        {content}
      </Panel>);
  }
}

export default ShowModule;
// export default withToast(ShowModule);
