import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Input, Row, Col, Radio } from 'antd'
import { LoadingOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  assetsFetch,
  assetModifyError
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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
    let request = JSON.parse(JSON.stringify(this.props.obj))
    request.tlsverify = request.tlsverify.toString()
    this.setState({request: request})
  }


  //SETTER
  addressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.address = e.target.value
    this.setState({request: request})
  }

  fqdnSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.fqdn = e.target.value
    this.setState({request: request})
  }

  datacenterSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.datacenter = e.target.value
    this.setState({request: request})
  }

  environmentSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.environment = e.target.value
    this.setState({request: request})
  }

  positionSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.position = e.target.value
    this.setState({request: request})
  }

  tlsverifySet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.tlsverify = e.target.value
    this.setState({request: request})
  }

  usernameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.username = e.target.value
    this.setState({request: request})
  }

  passwordSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.password = e.target.value
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.address || !validators.ipv4(request.address)) {
      errors.addressError = true
      errors.addressColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.addressError
      delete errors.addressColor
      this.setState({errors: errors})
    }

    if (!request.fqdn || !validators.fqdn(request.fqdn)) {
      errors.fqdnError = true
      errors.fqdnColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.fqdnError
      delete errors.fqdnColor
      this.setState({errors: errors})
    }

    if (!request.datacenter) {
      errors.datacenterError = true
      errors.datacenterColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.datacenterError
      delete errors.datacenterColor
      this.setState({errors: errors})
    }

    if (!request.environment) {
      errors.environmentError = true
      errors.environmentColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.environmentError
      delete errors.environmentColor
      this.setState({errors: errors})
    }

    if (!request.position) {
      errors.positionError = true
      errors.positionColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.positionError
      delete errors.positionColor
      this.setState({errors: errors})
    }

    if (!request.tlsverify) {
      errors.tlsverifyError = true
      errors.tlsverifyColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.tlsverifyError
      delete errors.tlsverifyColor
      this.setState({errors: errors})
    }

    if (!request.username) {
      errors.usernameError = true
      errors.usernameColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.usernameError
      delete errors.usernameColor
      this.setState({errors: errors})
    }

    if (!request.password) {
      errors.passwordError = true
      errors.passwordColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.passwordError
      delete errors.passwordColor
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.assetModify()
    }
  }


  //DISPOSAL ACTION
  assetModify = async () => {
    let b = {}

    b.data = {
      "address": this.state.request.address,
      "fqdn": this.state.request.fqdn,
      "baseurl": `https://${this.state.request.address}/mgmt/`,
      "tlsverify": this.state.request.tlsverify,
      "datacenter": this.state.request.datacenter,
      "environment": this.state.request.environment,
      "position": this.state.request.position,
      "username": this.state.request.username,
      "password": this.state.request.password
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(assetModifyError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/asset/${this.props.obj.id}/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(assetsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {},
      errors: {}
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify asset</p>}
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
             title="Asset Modified"
           />
        }
        { !this.state.loading && !this.state.response &&
          <React.Fragment>
            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.addressError ?
                  <Input style={{width: 250, borderColor: this.state.errors.addressColor}} name="address" id='address' onChange={e => this.addressSet(e)} />
                :
                  <Input defaultValue={this.state.request.address} style={{width: 250}} name="address" id='name' onChange={e => this.addressSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Fqdn:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.fqdnError ?
                  <Input style={{width: 250, borderColor: this.state.errors.fqdnColor}} name="fqdn" id='fqdn' onChange={e => this.fqdnSet(e)} />
                :
                  <Input defaultValue={this.state.request.fqdn} style={{width: 250}} name="fqdn" id='fqdn' onChange={e => this.fqdnSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenter:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.datacenterError ?
                  <Input style={{width: 250, borderColor: this.state.errors.datacenterColor}} name="datacenter" id='datacenter' onChange={e => this.datacenterSet(e)} />
                :
                  <Input defaultValue={this.state.request.datacenter} style={{width: 250}} name="datacenter" id='datacenter' onChange={e => this.datacenterSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Environment:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.environmentError ?
                  <Input style={{width: 250, borderColor: this.state.errors.environmentColor}} name="environment" id='environment' onChange={e => this.environmentSet(e)} />
                :
                  <Input defaultValue={this.state.request.environment} style={{width: 250}} name="environment" id='environment' onChange={e => this.environmentSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Position:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.positionError ?
                  <Input style={{width: 250, borderColor: this.state.errors.positionColor}} name="position" id='position' onChange={e => this.positionSet(e)} />
                :
                  <Input defaultValue={this.state.request.position} style={{width: 250}} name="position" id='position' onChange={e => this.positionSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tls verify:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.tlsverifyError ?
                  <Radio.Group style={{marginTop: 5, backgroundColor: this.state.errors.tlsverifyColor}} value={this.state.request.tlsverify} name="tlsverify" onChange={e => this.tlsverifySet(e)}>
                    <Radio key='1' value='1'>Yes</Radio>
                    <Radio key='0' value='0'>No</Radio>
                  </Radio.Group>
                :
                  <Radio.Group style={{marginTop: 5}} value={this.state.request.tlsverify} name="tlsverify" onChange={e => this.tlsverifySet(e)}>
                    <Radio key='1' id='tlsverify' value='1'>Yes</Radio>
                    <Radio key='0' id='tlsverify' value='0'>No</Radio>
                  </Radio.Group>
                }
              </Col>
            </Row>
            <br/>


            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Username:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.usernameError ?
                  <Input suffix={<UserOutlined className="site-form-item-icon" />} style={{width: 250, borderColor: this.state.errors.usernameColor}} name="username" id='username' onChange={e => this.usernameSet(e)} />
                :
                  <Input suffix={<UserOutlined className="site-form-item-icon" />} defaultValue={this.state.request.username} style={{width: 250}} name="username" id='username' onChange={e => this.usernameSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.passwordError ?
                  <Input.Password style={{width: 250, borderColor: this.state.errors.passwordColor}} name="password" id='password' onChange={e => this.passwordSet(e)} />
                :
                  <Input.Password defaultValue={this.state.request.password} style={{width: 250}} name="password" id='password' onChange={e => this.passwordSet(e)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => this.validation()} >
                  Modify Asset
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.assetModifyError ? <Error component={'asset modify f5'} error={[this.props.assetModifyError]} visible={true} type={'assetModifyError'} /> : null }
          </React.Fragment>
        :
          null
        }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
 	assetModifyError: state.f5.assetModifyError,
}))(Modify);
