import React, {Component} from 'react';
import { Alert, Collapse } from 'react-bootstrap';

export default class Toast extends Component {

	async componentDidUpdate() {
		if (this.props.showing) {
			clearTimeout(this.dismissTimer);
			this.dismissTimer = setTimeout(this.props.onDismiss, this.props.seconds * 1000);
		}
	}

	async componentWillUnmount() {
		clearTimeout(this.dismissTimer);
	}

	render() {
		return (
			<Collapse in={this.props.showing}>
				<div style={{ position: 'fixed', top: 30, left: 0, right: 0, textAlign: 'center' }}>
					<Alert
						style={{ display: 'inline-block', width: 480 }}
						bsStyle={this.props.bsStyle}
						onDismiss={this.props.onDismiss} >
						{this.props.message}
					</Alert>
				</div>
			</Collapse>
		);
	}
}
