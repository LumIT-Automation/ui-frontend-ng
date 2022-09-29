import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  hostsFetch,
  hostAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const rdIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
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
    this.main()
  }

  main = async () => {

  }


  //FETCH


  //SETTERS
  nameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }
  addressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.address = e.target.value
    this.setState({request: request})
  }
  routeDomainSet = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.routeDomain = id.toString()
    this.setState({request: request})
  }
  setStatus = e => {
    let request = Object.assign({}, this.state.request);
    request.session = e[0]
    request.state = e[1]
    this.setState({request: request})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.name) {
      errors.nameError = true
      errors.nameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      delete errors.nameColor
      this.setState({errors: errors})
    }

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

    if (!request.session) {
      errors.sessionError = true
      errors.sessionColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.sessionError
      delete errors.sessionColor
      this.setState({errors: errors})
    }

    if (!request.state) {
      errors.stateError = true
      errors.stateColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.stateError
      delete errors.stateColor
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.hostAdd()
    }
  }


  //DISPOSAL ACTION
  hostAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let b = {}
    b.data = {
      "address": this.state.request.address,
      "name": this.state.request.name,
      "session": this.state.request.session,
      "state": this.state.request.state
    }

    if(request.routeDomain) {
      b.data.address = `${this.state.request.address}%${request.routeDomain}`
    }


    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(hostAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/hosts/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(hostsFetch(true)), 2030)
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
          title={<p style={{textAlign: 'center'}}>ADD NODE</p>}
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
               title="Host Added"
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
                    <Input style={{width: 250, borderColor: this.state.errors.nameColor}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

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
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Session:</p>
                </Col>
                <Col span={16}>
                {this.state.errors.sessionError ?
                  <Select
                    style={{width: 250, border: `1px solid ${this.state.errors.sessionColor}`}}
                    onChange={a => this.setStatus(a)}
                  >
                    <Select.Option key={'Enabled'} value={['user-enabled', 'unchecked']}>Enabled</Select.Option>
                    <Select.Option key={'Disabled'} value={['user-disabled', 'unchecked']}>Disabled</Select.Option>
                    <Select.Option key={'Foffline'} value={['user-disabled', 'user-down']}>Force Offline</Select.Option>
                  </Select>
                :
                  <Select
                    style={{width: 250}}
                    onChange={a => this.setStatus(a)}
                  >
                    <Select.Option key={'Enabled'} value={['user-enabled', 'unchecked']}>Enabled</Select.Option>
                    <Select.Option key={'Disabled'} value={['user-disabled', 'unchecked']}>Disabled</Select.Option>
                    <Select.Option key={'Foffline'} value={['user-disabled', 'user-down']}>Force Offline</Select.Option>
                  </Select>
                }
                </Col>
              </Row>
              <br/>


              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Host
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.hostAddError ? <Error component={'add host'} error={[this.props.hostAddError]} visible={true} type={'hostAddError'} /> : null }
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
  hostAddError: state.checkpoint.hostAddError
}))(Add);
