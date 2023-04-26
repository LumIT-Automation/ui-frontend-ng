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
  assetModifyError,
  drAddError,
  drModifyError,
  drDeleteError
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

  details = async () => {
    await this.setState({visible: true})
    let request = JSON.parse(JSON.stringify(this.props.obj))
    request.tlsverify = request.tlsverify.toString()
    await this.setState({request: request})
  }


  //SETTER
  set = async (e, type) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[type] = e.target.value
    await this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.fqdn || !validators.fqdn(request.fqdn)) {
        errors.fqdnError = true
        this.setState({errors: errors})
      }
    else {
      delete errors.fqdnError
      this.setState({errors: errors})
    }

    if (!request.address || !validators.ipv4(request.address)) {
      errors.addressError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.addressError
      this.setState({errors: errors})
    }

    if (!request.baseurl) {
      errors.baseurlError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.baseurlError
      this.setState({errors: errors})
    }

    if (!request.datacenter) {
      errors.datacenterError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.datacenterError
      this.setState({errors: errors})
    }

    if (!request.environment) {
      errors.environmentError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.environmentError
      this.setState({errors: errors})
    }

    if (!request.position) {
      errors.positionError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.positionError
      this.setState({errors: errors})
    }

    if (!request.tlsverify) {
      errors.tlsverifyError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.tlsverifyError
      this.setState({errors: errors})
    }

    if (!request.username) {
      errors.usernameError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.usernameError
      this.setState({errors: errors})
    }

    if (!request.password) {
      errors.passwordError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.passwordError
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
    let request = JSON.parse(JSON.stringify(this.state.request))
    let b = {}

    b.data = {
      "address": request.address,
      "fqdn": request.fqdn,
      "baseurl": request.baseurl,
      "tlsverify": request.tlsverify,
      "datacenter": request.datacenter,
      "environment": request.environment,
      "position": request.position,
      "username": request.username,
      "password": request.password
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
          maskClosable={false}
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
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Fqdn:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.fqdnError ?
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'fqdn')} />
                :
                  <Input defaultValue={this.state.request.fqdn} style={{width: 250}} onChange={e => this.set(e, 'fqdn')} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.addressError ?
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'address')} />
                :
                  <Input defaultValue={this.state.request.address} style={{width: 250}} onChange={e => this.set(e, 'address')} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Baseurl:</p>
              </Col>
              <Col span={16}>
                {this.state.errors.baseurlError ?
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'baseurl')} />
                :
                  <Input defaultValue={this.state.request.baseurl} style={{width: 250}} onChange={e => this.set(e, 'baseurl')} />
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
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'datacenter')} />
                :
                  <Input defaultValue={this.state.request.datacenter} style={{width: 250}} onChange={e => this.set(e, 'datacenter')} />
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
                  <Input style={{width: 250, borderColor: 'red'}} style={{width: 250}} onChange={e => this.set(e, 'environment')} />
                :
                  <Input defaultValue={this.state.request.environment} style={{width: 250}} onChange={e => this.set(e, 'environment')} />
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
                  <Input style={{width: 250, borderColor: 'red'}} style={{width: 250}} onChange={e => this.set(e, 'position')} />
                :
                  <Input defaultValue={this.state.request.position} style={{width: 250}} onChange={e => this.set(e, 'position')} />
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
                  <Radio.Group style={{marginTop: 5, backgroundColor: 'red'}} value={this.state.request.tlsverify} onChange={e => this.set(e, 'tlsverify')}>
                    <Radio key='1' value='1'>Yes</Radio>
                    <Radio key='0' value='0'>No</Radio>
                  </Radio.Group>
                :
                  <Radio.Group style={{marginTop: 5}} value={this.state.request.tlsverify} onChange={e => this.set(e, 'tlsverify')}>
                    <Radio key='1' value='1'>Yes</Radio>
                    <Radio key='0' value='0'>No</Radio>
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
                  <Input suffix={<UserOutlined className="site-form-item-icon" />} style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'username')} />
                :
                  <Input suffix={<UserOutlined className="site-form-item-icon" />} defaultValue={this.state.request.username} style={{width: 250}} onChange={e => this.set(e, 'username')}/>
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
                  <Input.Password style={{width: 250, borderColor: 'red'}} onChange={e => this.set(e, 'password')}/>
                :
                  <Input.Password defaultValue={this.state.request.password} style={{width: 250}} onChange={e => this.set(e, 'password')} />
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
