import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  nodesFetch,
  routeDomains,
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
    await this.setState({routeDomainsLoading: true})
    let fetchedRouteDomains = await this.routeDomainsGet()
    await this.setState({routeDomainsLoading: false})
    if (fetchedRouteDomains.status && fetchedRouteDomains.status !== 200 ) {
      let error = Object.assign(fetchedRouteDomains, {
        component: 'nodeAdd',
        vendor: 'f5',
        errorType: 'routeDomainsError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      this.props.dispatch(routeDomains( fetchedRouteDomains ))
    }
  }


  //FETCH
  routeDomainsGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/routedomains/`, this.props.token)
    return r
  }


  //SETTERS
  nameSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    await this.setState({request: request})
  }
  addressSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.address = e.target.value
    await this.setState({request: request})
  }
  routeDomainSet = async id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.routeDomain = id.toString()
    await this.setState({request: request})
  }
  setStatus = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))

    console.log(e)
    try {
      if (e === 'Enabled' ){
        request.session = 'user-enabled'
        request.state = 'unchecked'
      }
      if (e === 'Disabled' ){
        request.session = 'user-disabled'
        request.state = 'unchecked'
      }
      if (e === 'Foffline' ){
        request.session = 'user-disabled'
        request.state = 'user-down'
      }
    }catch(error) {
      console.log(e)
    }

    await this.setState({request: request})
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

    if (!request.address || !validators.ipv4(request.address)) {
      errors.addressError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.addressError
      this.setState({errors: errors})
    }

    if (!request.session) {
      errors.sessionError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.sessionError
      this.setState({errors: errors})
    }

    if (!request.state) {
      errors.stateError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.stateError
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.nodeAdd()
    }
  }


  //DISPOSAL ACTION
  nodeAdd = async () => {
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
        error = Object.assign(error, {
          component: 'nodeAdd',
          vendor: 'f5',
          errorType: 'nodeAddError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(nodesFetch(true)), 2030)
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
      if (this.props.error && this.props.error.component === 'nodeAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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
          maskClosable={false}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Node Added"
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
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.addressError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="address" id='address' onChange={e => this.addressSet(e)} />
                  :
                    <Input defaultValue={this.state.request.address} style={{width: 250}} name="address" id='name' onChange={e => this.addressSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Route Domain (optional):</p>
                </Col>
                <Col span={16}>
                  { this.state.routeDomainsLoading ?
                    <Spin indicator={rdIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.props.routeDomains && this.props.routeDomains.length > 0 ?
                        <Select
                          value={this.state.request.routeDomain}
                          showSearch
                          style={{width: 250}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.routeDomainSet(n)}
                        >
                          <React.Fragment>
                            {this.props.routeDomains.map((n, i) => {
                              return (
                                <Select.Option key={i} value={n.id}>{n.name}</Select.Option>
                              )
                            })
                            }
                          </React.Fragment>
                        </Select>
                      :
                        null
                      }
                    </React.Fragment>
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
                    style={{width: 250, border: `1px solid red`}}
                    onChange={a => this.setStatus(a)}
                  >
                    <Select.Option key={'Enabled'} value={'Enabled'}>Enabled</Select.Option>
                    <Select.Option key={'Disabled'} value={'Disabled'}>Disabled</Select.Option>
                    <Select.Option key={'Foffline'} value={'Foffline'}>Force Offline</Select.Option>
                  </Select>
                :
                  <Select
                    style={{width: 250}}
                    onChange={a => this.setStatus(a)}
                  >
                  <Select.Option key={'Enabled'} value={'Enabled'}>Enabled</Select.Option>
                  <Select.Option key={'Disabled'} value={'Disabled'}>Disabled</Select.Option>
                  <Select.Option key={'Foffline'} value={'Foffline'}>Force Offline</Select.Option>
                  </Select>
                }
                </Col>
              </Row>
              <br/>


              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Node
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            {errors()}
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
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
  routeDomains: state.f5.routeDomains,
}))(Add);
