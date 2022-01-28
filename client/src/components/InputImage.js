import React, {Component} from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import ReactDOM from 'react-dom';

import './InputImage.css';

class InputImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: '',
      imagePreviewUrl: ''
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
      let reader = new FileReader();

      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }

      reader.readAsDataURL(file);
    } else {
      this.setState({
        file: '',
        imagePreviewUrl: ''
      }, () => {
        let image = ReactDOM.findDOMNode(this.image);
        image.value = '';
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
    let {imagePreviewUrl} = this.state;
    let imagePreview = null;
    if (imagePreviewUrl) {
      imagePreview = <img src={imagePreviewUrl} alt='preview' className='imgThumb' />;
    } else if (data !== '') {
      let dt = data.split(',');
      let src = '';
      let ext = 'jpg';
      if ((dt[0] !== undefined) && (typeof dt[0] === 'string')) {
        ext = dt[0].split('.').pop();
      }
      if ((dt[1] !== undefined) && (typeof dt[1] === 'string')) {
        src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + dt[1] + '-' + field + '_thumb.' + ext;
      }
      imagePreview = <img src={src} alt='preview' className='imgThumb' />;
    }

    return (
      <FormGroup controlId={field}>
        <ControlLabel>{field}</ControlLabel>
        <FormControl
          ref = {image => { this.image = image }}
          type="file"
          onChange={this.handleImageChange}
          accept=".png,.jpg"
        />
        {imagePreview}
      </FormGroup>
    )
  }
}

export default InputImage;
