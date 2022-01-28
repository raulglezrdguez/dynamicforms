import React, { Component } from 'react';
import Toast from './Toast'

export default function withToast(OriginalComponent) {
	return class WithToast extends Component {

		constructor(props) {
			super(props);

			this.state = {
				toastVisible: false,
				toastMessage: '',
				toastType: 'success',
				toastSeconds: 3
			};
		}

		showSuccess = message => {
			this.setState({ toastVisible: true, toastMessage: message, toastType: 'warning' });
		}

		showError = message => {
			this.setState({ toastVisible: true, toastMessage: message, toastType: 'danger' });
		}

		dismissToast = () => {
			this.setState({ toastVisible: false });
		}

		render() {
			return (
				<div>
					<OriginalComponent
						showError = { this.showError }
						showSuccess = { this.showSuccess }
						{...this.props}
					/>

					<Toast
						showing={this.state.toastVisible}
						message={this.state.toastMessage}
						onDismiss={this.dismissToast}
						bsStyle={this.state.toastType}
						seconds={this.state.toastSeconds}
					/>
				</div>
			);
		}
	}
}
