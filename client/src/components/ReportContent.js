import React, { Component } from "react";

import './ReportContent.css';

class ReportContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: [], // valores de los campos
    };
  }

  getRefValue = (values, id) => {
    let {refValues} = this.props;
    let result = '';

    for(let i = 0; i < refValues.length; i++) {
      if (refValues[i].id === values) {
        for(let j = 0; j < refValues[i].values.length; j++) {
          if (refValues[i].values[j].id === id) {
            result = refValues[i].values[j].value;

            break;
          }
        }
      }
    }

    return result;
  }

  findRefValues = (values) => {
    let {refValues} = this.props;
    let result = null;

    for(let i = 0; i < refValues.length; i++) {
      if (refValues[i].id === values) {
        result = refValues[i];

        break;
      }
    }
    return result;
  }

  verifyProps = (props) => {
    let {fields, values } = props;
    let newState = this.state;
    newState.values = [];
      for(let i = 0; i < fields.length; i++) {
        let found = false;
        for(let j = 0; j < values.length; j++) {
          if (values[j][fields[i].field] !== undefined) {
            found = true;
            newState.values[fields[i].field] = values[j][fields[i].field];

            break;
          }
        }
        if (!found) newState.values[fields[i].field] = '';
      }
      this.setState(newState);
  }

  async componentDidMount() {
    this.verifyProps(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.verifyProps(nextProps);
  }

  render() {
    let {fields} = this.props;
    let {values} = this.state;

    let src = process.env.PUBLIC_URL + '/dyimages/sin_imagen.png';
    let pht = <img className='productImg' src={src} alt='sin imagen' />;

    let details = [];
    if (fields) {
      fields.forEach((f, i) => {
        if ((values[f.field] !== undefined) && (values[f.field] !== '')) {
          switch (f.type) {
            case 'txt':
            case 'num':
            case 'lst':
              details.push(<p key={i+1}>{f.field}: <strong>{values[f.field]}</strong></p>);
              break;
            case 'ref':
              details.push(<p key={i+1}>{f.field}: <strong>{this.getRefValue(f.values, values[f.field])}</strong></p>);
              break;
            case 'img':
              let ext = 'jpg';
              if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                ext = values[f.field].split('.').pop();
              }
              let src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + this.props.id + '-' + f.field + '_thumb.' + ext;
              let srcDownload = process.env.PUBLIC_URL + '/dyimages/' + this.props.id + '-' + f.field + '.' + ext;
              pht = <a href={srcDownload} target='_blank'><img className='productImg' src={src} alt='sin imagen' /></a>;
              break;
            case 'fle':
              let fileName = '';
              let fileExt = '';
              if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                fileName = values[f.field];
                fileExt = values[f.field].split('.').pop();
              }
              let fileDownload = process.env.PUBLIC_URL + '/dyfiles/' + this.props.id + '-' + f.field + '.' + fileExt;

              details.push(<p key={i+1}>{f.field}: <strong><a href={fileDownload} target='_blank'>{fileName}</a></strong></p>);
              break;
            case 'dte':
              details.push(<p key={i+1}>{f.field}: <strong>{values[f.field]}</strong></p>);
              break;
            case 'tme':
              details.push(<p key={i+1}>{f.field}: <strong>{values[f.field]}</strong></p>);
              break;
            default:
          }
        }
      });
      const date = new Date(this.props.date);
      let fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      details.push(<p key={fields.length+3}><strong>{fecha}</strong></p>);
    }



/*    let tdCells = [];

    tdCells = [<td key={0}>{position}</td>];
    if (fields) {
      fields.forEach((f, i) => {
        if ((values[f.field] !== undefined) && (values[f.field] !== '')) {
          switch (f.type) {
            case 'txt':
            case 'num':
            case 'lst':
              tdCells.push(<td key={i+1}>{values[f.field]}</td>);
              break;
            case 'ref':
              tdCells.push(<td key={i+1}>{this.getRefValue(f.values, values[f.field])}</td>);
              break;
            case 'img':
              let ext = 'jpg';
              if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                ext = values[f.field].split('.').pop();
              }
              let src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + this.props.id + '-' + f.field + '_thumb.' + ext;
              let srcDownload = process.env.PUBLIC_URL + '/dyimages/' + this.props.id + '-' + f.field + '.' + ext;
              tdCells.push(<td key={i+1}><a href={srcDownload} target='_blank'><img src={src} alt='sin imagen' /></a></td>);
              break;
            case 'fle':
              let fileName = '';
              let fileExt = '';
              if ((values[f.field] !== undefined) && (typeof values[f.field] === 'string')) {
                fileName = values[f.field];
                fileExt = values[f.field].split('.').pop();
              }
              let fileDownload = process.env.PUBLIC_URL + '/dyfiles/' + this.props.id + '-' + f.field + '.' + fileExt;

              tdCells.push(<td key={i+1}><a href={fileDownload} target='_blank'>{fileName}</a></td>);
              break;
            case 'dte':
              tdCells.push(<td key={i+1}>{values[f.field]}</td>);
              break;
            case 'tme':
              tdCells.push(<td key={i+1}>{values[f.field]}</td>);
              break;
            default:
              tdCells.push(<td key={i+1}></td>);
          }
        } else {
          tdCells.push(<td key={i+1}></td>);
        }
      });
      const date = new Date(this.props.date);
      let fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      tdCells.push(<td key={fields.length+3}>{fecha}</td>);
    }

*/
    return (
      <div className='product'>
          {pht}
        <div style={{float: 'left'}}>{details}</div>
      </div>
      );
  }
}

export default ReportContent;

/*
<tr align='left'>
  {tdCells}
</tr>
*/
