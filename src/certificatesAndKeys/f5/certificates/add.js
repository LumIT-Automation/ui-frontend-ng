import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../../_helpers/Rest"
import Error from '../../../error'

import { setError } from '../../../_store/store.error'
import { setCertificatesFetch } from '../../../_store/store.f5'

import { Form, Input, Button, Card, Space, Radio, Alert, Spin, Result, Modal } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const { TextArea } = Input



class Add extends React.Component {

  constructor(props) {
    super(props)
      this.state = {
        request: {}
      };
    }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  setFilename = e => {
    let request = Object.assign({}, this.state.request)
    request.fileName = e.target.value
    this.setState({request: request})
  }

  setSourceType = e => {
    let request = Object.assign({}, this.state.request)
    if (e.target.value === 'pasteText') {
      request.sourceValue = e.target.value
    } else if (e.target.value === 'upload') {
      request.sourceValue = e.target.value
    }
    this.setState({request: request})
  }

  setText = event => {
    let request = Object.assign({}, this.state.request)
    request.text = event.target.value
    this.setState({request: request})
  }

  uploadFile = event => {
    let request = Object.assign({}, this.state.request)
    request.selectedFile = event.target.files[0]
    this.setState({request: request}, () => this.readSingleFile(event))
  }

  readSingleFile = e => {
    let request = Object.assign({}, this.state.request)

    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      var contents = e.target.result;
      request.text = contents
    };
    reader.readAsText(file);
    this.setState({request: request})
  }

  installCertificate =  async () => {
    let certificateName = `${this.state.request.fileName}`
    let contentBase64 = btoa(this.state.request.text)

    let request = {
      "certificate": {
        "name": certificateName,
        "content_base64": contentBase64
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response() )
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token, b )
  }

  fileSummary = () => {
    if (this.state.request.selectedFile) {
      return (
        <Form.Item label="File Details">
          <Card>
              <p>Name: {this.state.request.selectedFile.name}</p>
              <p>Type: {this.state.request.selectedFile.type}</p>
              <p>Size: {this.state.request.selectedFile.size} Bytes</p>
          </Card>
        </Form.Item>

      );
    } else {
        if (this.state.request.sourceValue === "upload") {
          return (
            <Form.Item label="File Details" >
              <Card>

              </Card>
            </Form.Item>
          )
        }
    }
  }


  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(setCertificatesFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {


    return (
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} visible={true} />
        :
          <React.Fragment>

            <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

            <Modal
              title={<p style={{textAlign: 'center'}}>ADD CERTIFICATE</p>}
              centered
              destroyOnClose={true}
              visible={this.state.visible}
              footer={''}
              onOk={() => this.setState({visible: true})}
              onCancel={() => this.closeModal()}
              width={750}
            >
            { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !this.state.loading && this.state.response &&
              <Result
                 status="success"
                 title="Added"
               />
            }
            { !this.state.loading && !this.state.response &&
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
                layout="horizontal"
                initialValues={{ size: 'default' }}
                size={'default'}
              >

                  <Form.Item label="Certificate name" >
                    <Input onChange={e => this.setFilename(e)}/>
                  </Form.Item>

                { (this.state.request.fileName) ?
                  <Form.Item label="File source">
                  <Radio.Group onChange={e => this.setSourceType(e)} value={this.state.request.sourceValue}>
                    <Radio value={"upload"}>Upload</Radio>
                    <Radio value={"pasteText"}>Paste text</Radio>
                  </Radio.Group>
                  </Form.Item>
                  :
                  null
                }

                {this.state.request.sourceValue === "upload" ?
                  <Form.Item label="Upload File">
                    <Input type="file" onChange={this.uploadFile} />
                  </Form.Item>
                  :
                  null
                }

                {this.state.request.sourceValue === "pasteText" ?
                  <Form.Item label="Paste Text">
                    <TextArea rows={4} onChange={e => this.setText(e)} />
                  </Form.Item>
                  :
                  null
                }

                {this.fileSummary()}

                { (this.props.asset) ?
                  <Form.Item wrapperCol={ {offset: 8, span: 16 }}>
                    <Button type="primary" onClick={this.installCertificate}>Install {this.state.request.fileType}</Button>
                  </Form.Item>
                :
                  <Form.Item wrapperCol={ {offset: 8, span: 8 }}>
                    {
                      <Alert message="Asset not set" type="error" />
                    }
                  </Form.Item>
                }

              </Form>
            }
            </Modal>
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  asset: state.f5.asset,
}))(Add);
