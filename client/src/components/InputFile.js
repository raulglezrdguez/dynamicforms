import React, {Component} from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import ReactDOM from 'react-dom';

class InputFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: '',
      fileName: ''
    };
  }

  async componentDidMount() {
    this.arrangeState(this.props.value);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeState(nextProps.value);
  }

  arrangeState = (file) => {
    if (typeof file === 'object') {
      this.setState({
        file: file,
        fileName: file.name
      });
    } else {
      this.setState({
        file: '',
        fileName: ''
      }, () => {
        let file = ReactDOM.findDOMNode(this.imageFile);
        file.value = '';
      });
    }
  }

  handleImageChange = (e) => {
    e.preventDefault();

    let file = e.target.files[0];
    this.arrangeState(file);

    this.props.onChange(this.props.field, file);
  }

  render() {
    let {field, data} = this.props;
    let {fileName} = this.state;
    let filePreview = null;
    if (fileName) {
      filePreview = <p>{fileName}</p>;
    } else if (data !== '') {
      let dt = data.split(',');
      if ((dt[0] !== undefined) && (typeof dt[0] === 'string')) {
        filePreview = <p>{dt[0]}</p>;
      }
    }

    return (
      <FormGroup controlId={field}>
        <ControlLabel>{field}</ControlLabel>
        <FormControl
          ref = {imageFile => { this.imageFile = imageFile }}
          type="file"
          onChange={this.handleImageChange}
          accept=".zip,.rar"
        />
        {filePreview}
      </FormGroup>
    )
  }
}

export default InputFile;
