import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Input, Button, Card, Radio, Alert, Spin, Result, Modal, Row, Col } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import Rest from '../../../_helpers/Rest'
import Error from '../../../f5/error'

import { certificatesFetch, certificateAddError } from '../../../f5/store'


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

  fileNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.fileName = e.target.value
    this.setState({request: request})
  }

  sourceTypeSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    if (e.target.value === 'pasteText') {
      request.sourceValue = e.target.value
      delete request.selectedFile
    } else if (e.target.value === 'upload') {
      request.sourceValue = e.target.value
      delete request.text
    }
    this.setState({request: request})
  }

  textSet = event => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.text = event.target.value
    this.setState({request: request})
  }

  fileUpload = event => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.selectedFile = event.target.files[0]
    this.setState({request: request}, () => this.singleFileRead(event))
  }

  singleFileRead = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = this.state.request.selectedFile.name
    request.size = this.state.request.selectedFile.size
    request.type = this.state.request.selectedFile.type

    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = (e) => {
      let contents = e.target.result;
      request.text = contents
    };
    reader.readAsText(file);
    this.setState({request: request})
  }


  certificateInstall =  async () => {
    let certificateName = `${this.state.request.fileName}`
    let contentBase64 = btoa(this.state.request.text)

    let body = {
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
        this.props.dispatch(certificateAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/certificates/`, this.props.token, body )
  }


  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(certificatesFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {}
    })
  }


  render() {
    console.log(this.props.partition)

    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD CERTIFICATE</p>}
          centered
          destroyOnClose={true}
          open={this.state.visible}
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
          <React.Fragment>
            <React.Fragment>
              <Row>
                <Col offset={5} span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={10}>
                  <Input onChange={e => this.fileNameSet(e)}/>
                </Col>
              </Row>
              <br/>
            </React.Fragment>

            { (this.state.request.fileName) ?
              <React.Fragment>
                <Row>
                  <Col offset={7} span={10}>
                    <Radio.Group onChange={e => this.sourceTypeSet(e)} value={this.state.request.sourceValue}>
                      <Radio value={"upload"}>Upload</Radio>
                      <Radio value={"pasteText"}>Paste text</Radio>
                    </Radio.Group>
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.sourceValue === "upload" ?
              <React.Fragment>
                <Row>
                  <Col offset={7} span={10}>
                    <Input type="file" onChange={this.fileUpload} />
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.sourceValue === "pasteText" ?
              <React.Fragment>
                <Row>
                  <Col offset={1} span={22}>
                    <TextArea rows={22} onChange={e => this.textSet(e)} />
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.selectedFile ?
              <React.Fragment>
                <Row>
                  <Col offset={7} span={10}>
                    <Card>
                        <p>Name: {this.state.request.name}</p>
                        <p>Type: {this.state.request.type}</p>
                        <p>Size: {this.state.request.size} Bytes</p>
                    </Card>
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            { (this.props.asset && this.props.partition) ?
              <Row>
                <Col offset={7} span={4}>
                { this.state.request.fileName && (this.state.request.text || this.state.request.selectedFile) ?
                  <Button type="primary" onClick={this.certificateInstall}>Install {this.state.request.fileType}</Button>
                :
                  <Button type="primary" disabled >Install {this.state.request.fileType}</Button>
                }
                </Col>
              </Row>
            :
              <Row>
                <Col offset={2} span={6}>
                  <Alert message="Asset not set" type="error" />
                </Col>
              </Row>
            }
          </React.Fragment>
        }

        {this.state.visible ?
          <React.Fragment>
            { this.props.certificateAddError ? <Error component={'certificates add'} error={[this.props.certificateAddError]} visible={true} type={'certificateAddError'} /> : null }
          </React.Fragment>
        :
          null
        }


        </Modal>
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.f5.asset,
  partition: state.f5.partition,

  certificateAddError: state.f5.certificateAddError,
}))(Add);
