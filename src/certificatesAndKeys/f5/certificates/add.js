import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Input, Button, Card, Radio, Spin, Result, Modal, Row, Col } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import Rest from '../../../_helpers/Rest'
import Error from '../../../concerto/error'

import {
  err
} from '../../../concerto/store'

import { certificatesFetch } from '../../../f5/store'


const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const { TextArea } = Input



class Add extends React.Component {

  constructor(props) {
    super(props)
      this.state = {
        request: {},
        errors: {}
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

  certificateNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.certificateName = e.target.value
    this.setState({request: request})
  }

  sourceTypeSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    if (e.target.value === 'pasteText') {
      request.sourceType = e.target.value
      delete request.file
    } else if (e.target.value === 'upload') {
      request.sourceType = e.target.value
      delete request.text
    }
    this.setState({request: request})
  }

  textSet = event => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.text = event.target.value
    this.setState({request: request})
  }

  fileUpload = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let file, reader, contents

    try {
      file = e.target.files[0]
      request.file = file
      request.fileName = file.name
      request.size = file.size
      request.type = file.type

      reader = new FileReader();
      reader.onload = (e) => {
        contents = e.target.result;
        request.text = contents
      };
      reader.readAsText(file);
      await this.setState({request: request})
    }
    catch(error) {
      console.log(error)
    }
  }

  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.certificateName) {
      errors.certificateNameError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.certificateNameError
      await this.setState({errors: errors})
    }
    if (!request.sourceType) {
      errors.sourceTypeError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.sourceTypeError
      await this.setState({errors: errors})
    }
    if (!request.text) {
      errors.textError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.textError
      await this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.certificateInstall()
    }
  }

  certificateInstall =  async () => {
    let certificateName = `${this.state.request.certificateName}`
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
        error = Object.assign(error, {
          component: 'certAdd',
          vendor: 'f5',
          errorType: 'certificateAddError'
        })
        this.props.dispatch(err(error))
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

    let errors = () => {
      if (this.props.error && this.props.error.component === 'certAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add certificate</p>}
          centered
          destroyOnClose={true}
          open={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
          maskClosable={false}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 47%'}}/> }
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
                  {this.state.errors.certificateNameError ?
                    <Input value={this.state.request.certificateName} style={{borderColor: 'red'}} onChange={e => this.certificateNameSet(e)}/>
                  :
                    <Input value={this.state.request.certificateName} onChange={e => this.certificateNameSet(e)}/>
                  }
                </Col>
              </Row>
              <br/>
            </React.Fragment>



            { (this.state.request.certificateName) ?
              <React.Fragment>
                {this.state.errors.sourceTypeError ?
                  <Row>
                    <Col offset={7} span={10}>
                      <Radio.Group style={{backgroundColor: 'red'}} onChange={e => this.sourceTypeSet(e)} value={this.state.request.sourceType}>
                        <Radio value={"upload"}>Upload</Radio>
                        <Radio value={"pasteText"}>Paste text</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                :
                  <Row>
                    <Col offset={7} span={10}>
                      <Radio.Group onChange={e => this.sourceTypeSet(e)} value={this.state.request.sourceType}>
                        <Radio value={"upload"}>Upload</Radio>
                        <Radio value={"pasteText"}>Paste text</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                }
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.sourceType === "upload" ?
              <React.Fragment>
                {this.state.errors.textError ?
                  <Row>
                    <Col offset={7} span={10}>
                      <Input type="file" style={{borderColor: 'red'}} onChange={e => this.fileUpload(e)} />
                    </Col>
                  </Row>
                :
                  <Row>
                    <Col offset={7} span={10}>
                      <Input type="file" onChange={e => this.fileUpload(e)} />
                    </Col>
                  </Row>
                }
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.sourceType === "pasteText" ?
              <React.Fragment>
                {this.state.errors.textError ?
                  <Row>
                    <Col offset={1} span={22}>
                      <TextArea value={this.state.request.text} rows={22} style={{borderColor: 'red'}} onChange={e => this.textSet(e)} />
                    </Col>
                  </Row>
                :
                  <Row>
                    <Col offset={1} span={22}>
                      <TextArea value={this.state.request.text} rows={22} onChange={e => this.textSet(e)} />
                    </Col>
                  </Row>
                }
                <br/>
              </React.Fragment>
            :
              null
            }

            {this.state.request.file ?
              <React.Fragment>
                <Row>
                  <Col offset={7} span={10}>
                    <Card>
                        <p>Name: {this.state.request.fileName}</p>
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

            <Row>
              <Col offset={7} span={4}>
                <Button type="primary" onClick={() => this.validation()}>Install certificate</Button>
              </Col>
            </Row>

          </React.Fragment>
        }

        {this.state.visible ?
          <React.Fragment>
            {errors()}
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
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
}))(Add);
