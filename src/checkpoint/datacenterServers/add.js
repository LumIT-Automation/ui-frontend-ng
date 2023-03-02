import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  datacenterServersFetch,
  datacenterServerAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
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


  //SETTERS
  nameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }
  firstAddressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.firstAddress = e.target.value
    this.setState({request: request})
  }
  lastAddressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.lastAddress = e.target.value
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.name) {
      errors.nameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      this.setState({errors: errors})
    }

    if (!request.firstAddress || !validators.ipv4(request.firstAddress)) {
      errors.firstAddressError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.firstAddressError
      this.setState({errors: errors})
    }

    if (!request.lastAddress || !validators.ipv4(request.lastAddress)) {
      errors.lastAddressError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.lastAddressError
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.datacenterServerAdd()
    }
  }


  //DISPOSAL ACTION
  datacenterServerAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "ipv4-address-first": this.state.request.firstAddress,
      "ipv4-address-last": this.state.request.lastAddress,
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(datacenterServerAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-servers/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(datacenterServersFetch(true)), 2030)
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
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD ADDRESS RANGE</p>}
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
               title="Address range added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.nameError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>First address:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.firstAddressError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="address" id='address' onChange={e => this.firstAddressSet(e)} />
                  :
                    <Input defaultValue={this.state.request.firstAddress} style={{width: 250}} name="address" id='name' onChange={e => this.firstAddressSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Last address:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.lastAddressError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="address" id='address' onChange={e => this.lastAddressSet(e)} />
                  :
                    <Input defaultValue={this.state.request.lastAddress} style={{width: 250}} name="address" id='name' onChange={e => this.lastAddressSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Address Range
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.datacenterServerAddError ? <Error component={'add datacenterServer'} error={[this.props.datacenterServerAddError]} visible={true} type={'datacenterServerAddError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  datacenterServerAddError: state.checkpoint.datacenterServerAddError
}))(Add);
