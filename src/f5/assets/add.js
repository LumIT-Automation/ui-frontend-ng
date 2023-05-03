import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Input, Row, Col, Radio, Select } from 'antd'
import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  assetsFetch,
  assetsError,
  assetAddError,
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const loadingIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      assets: [],
      request: {
        address: '',
        fqdn: '',
        baseurl: '',
        datacenter: '',
        environment: '',
        position: '',
        tlsverify: '',
        username: '',
        password: ''
      },
      tlsverifyChoices: ['yes', 'no'],
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
  }

  //SETTER
  set = async (value, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = value
    await this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    for (const [key, value] of Object.entries(request)) {
      if (value) {
        if (key === 'fqdn' && !validators.fqdn(request.fqdn)) {
          errors[`${key}Error`] = true
          this.setState({errors: errors})
        }
        else if (key === 'address' && !validators.ipv4(request.address)) {
          errors[`${key}Error`] = true
          this.setState({errors: errors})
        }
        else {
          delete errors[`${key}Error`]
          this.setState({errors: errors})
        }
      }
      else {
        errors[`${key}Error`] = true
        this.setState({errors: errors})
      }
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.assetAddHandler()
    }
  }


  assetAddHandler = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let b = {}

    b.data = {
      "address": request.address,
      "fqdn": request.fqdn,
      "baseurl": request.baseurl,
      "datacenter": request.datacenter,
      "environment": request.environment,
      "position": request.position,
      "username": request.username,
      "password": request.password
    }

    if (request.tlsverify === 'yes') {
      b.data.tlsverify = 1
    }
    else {
      b.data.tlsverify = 0
    }

    console.log(b)
    await this.setState({loading: true})
    let assetAdd = await this.assetAdd(b)
    if (assetAdd.status && assetAdd.status !== 201 ) {
      this.props.dispatch(assetAddError(assetAdd))
      await this.setState({loading: false})
      //return
    }
    else {
      await this.setState({loading: false, response: true})
      this.response()
    }
  }

  //DISPOSAL ACTION
  assetAdd = async (b) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token, b )
    return r
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

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              suffix={(key === 'username') ? <UserOutlined className="site-form-item-icon" /> : null }
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
              onChange={event => this.set(event.target.value, key)}
              onPressEnter={() => this.validation(action)}
            />
          )
          break;

      case 'input.password':
        return (
          <Input.Password
            style=
            {this.state.errors[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
            onChange={event => this.set(event.target.value, key)}
            onPressEnter={() => this.validation(action)}
          />
        )
        break;

        case 'radio':
          return (
            <Radio.Group
              onChange={event => this.set(event.target.value, key)}
              value={this.state.request[`${key}`]}
              style={this.state.errors[`${key}Error`] ?
                {border: `1px solid red`}
              :
                {}
              }
            >
              <React.Fragment>
                {this.state[`${choices}`].map((n, i) => {
                  return (
                    <Radio.Button key={i} value={n}>{n}</Radio.Button>
                  )
                })
                }
              </React.Fragment>
          </Radio.Group>
          )
          break;

        case 'select':
          return (
            <Select
              value={this.state.request[`${key}`]}
              showSearch
              style=
              { this.state.errors[`${key}Error`] ?
                {width: "100%", border: `1px solid red`}
              :
                {width: "100%"}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set(event, key)}
            >
              <React.Fragment>
              { choices === 'assets' ?
                this.state.assets.map((v,i) => {
                  let str = `${v.fqdn} - ${v.address}`
                  return (
                    <Select.Option key={i} value={v.id}>{str}</Select.Option>
                  )
                })
              :
                this.state[`${choices}`].map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
              }
              </React.Fragment>
            </Select>
          )

        default:
      }
    }

    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD ASSET</p>}
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
             title="Asset Added"
           />
        }
        { !this.state.loading && !this.state.response &&
          <React.Fragment>
            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Fqdn:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'fqdn')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'address')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Baseurl:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'baseurl')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenter:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'datacenter')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Environment:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'environment')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Position:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'position')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>TLS verify:</p>
              </Col>
              <Col span={8}>
                {createElement('radio', 'tlsverify', 'tlsverifyChoices')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Username:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'username')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password:</p>
              </Col>
              <Col span={8}>
                {createElement('input.password', 'password')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => this.validation()} >
                  Add Asset
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.assetAddError ? <Error component={'asset add f5'} error={[this.props.assetAddError]} visible={true} type={'assetAddError'} /> : null }
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
 	assetAddError: state.f5.assetAddError,
}))(Add);
