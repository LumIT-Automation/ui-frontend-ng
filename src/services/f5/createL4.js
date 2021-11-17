import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/f5Error'

import {
  setCertificates,
  setCertificatesError,
  setKeys,
  setKeysError,
  setRouteDomains,
  setRouteDomainsError,
} from '../../_store/store.f5'

import AssetSelector from '../../f5/assetSelector'

import { Modal, Alert, Row, Col, Form, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}



class CreateF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      snats: ['none', 'automap'],
      membersNumber: 0,
      members: [],
      request: {
        source: "0.0.0.0/0",
        members: []
      }
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state.request)
    if (this.props.asset && (this.props.asset !== prevProps.asset) ) {
      this.main()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {

    await this.setState({certificatesLoading: true})
    let certificates = await this.fetchCertificates()
    await this.setState({certificatesLoading: false})
    if (certificates.status && certificates.status !== 200 ) {
      this.props.dispatch(setCertificatesError(certificates))
      return
    }
    else {
      this.props.dispatch(setCertificates( certificates ))
    }

    await this.setState({keysLoading: true})
    let keys = await this.fetchKeys()
    await this.setState({keysLoading: false})
    if (keys.status && keys.status !== 200 ) {
      this.props.dispatch(setKeysError(keys))
      return
    }
    else {
      this.props.dispatch(setKeys( keys ))
    }

    await this.setState({routeDomainsLoading: true})
    let routeDomains = await this.fetchRouteDomains()
    console.log(routeDomains)
    await this.setState({routeDomainsLoading: false})
    if (routeDomains.status && routeDomains.status !== 200 ) {
      this.props.dispatch(setRouteDomainsError(routeDomains))
      return
    }
    else {
      this.props.dispatch(setRouteDomains( routeDomains ))
    }
  }

  fetchCertificates = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token)
    return r
  }

  fetchKeys = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
    return r
  }

  fetchRouteDomains = async () => {
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



  setServiceName = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e.target.value !== '') {
      request.serviceName = e.target.value
      delete errors.serviceNameError
    }
    else {
      request.serviceName = e.target.value
      errors.serviceNameError = 'Please input a valid Service Name'
    }
    this.setState({request: request, errors: errors})
  }

  setRouteDomain = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.routeDomain = e
      delete errors.routeDomainError
    }
    else {
      errors.routeDomainError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setSnat = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.snat = e
      delete errors.snatError
    }
    else {
      errors.snatError = 'Please select a valid Snat'
    }
    this.setState({request: request, errors: errors})
  }

  setDestination = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      request.destination = ipv4
      delete errors.destinationError
    }
    else {
      request.destination = null
      errors.destinationError = 'Please input a valid destination'
    }
    this.setState({request: request, errors: errors})
  }

  setDestinationPort = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPortError = 'error'
    }
    else {
      request.destinationPort = e.target.value
      delete errors.destinationPortError
    }
    this.setState({request: request, errors: errors})
  }

  setCertificateName = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      request.certificateName = e
      delete errors.certificateNameError
    }
    else {
      errors.certificateNameError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setKeyName = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      request.keyName = e
      delete errors.keyNameError
    }
    else {
      errors.keyNameError = 'error'
    }
    this.setState({request: request, errors: errors})
  }
/*
  setDestinationPoolPort = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPoolPortError = 'error'
    }
    else {
      request.destinationPoolPort = e.target.value
      delete errors.destinationPoolPortError
    }
    this.setState({request: request, errors: errors})
  }
*/
  setLbMethod = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'round-robin':
        request.lbMethod = 'round-robin'
        delete errors.lbMethodError
        break
      case 'least-connections-member':
        request.lbMethod = 'least-connections-member'
        delete errors.lbMethodError
        break
      case 'observed-member':
        request.lbMethod = 'observed-member'
        delete errors.lbMethodError
        break
      case 'predictive-member':
        request.lbMethod = 'predictive-member'
        delete errors.lbMethodError
        break
      default:
        errors.lbMethodError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitorType = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'tcp-half-open':
        request.monitorType = 'tcp-half-open'
        delete errors.monitorTypeError
        break
      case 'http':
        request.monitorType = 'http'
        delete errors.monitorTypeError
        break

      default:
        errors.monitorTypeError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitorSendString = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      request.monitorSendString = e.target.value
      delete errors.monitorSendStringError
    }
    else {
      errors.monitorSendStringError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitorReceiveString = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      request.monitorReceiveString = e.target.value
      delete errors.monitorReceiveStringError
    }
    else {
      errors.moonitorReceiveStringError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  oneMoreMember = () => {
    let membersNumber = this.state.membersNumber
    let members = this.state.members
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    membersNumber = membersNumber + 1
    members.push({id: membersNumber})
    delete errors.membersNumberError
    this.setState({membersNumber: membersNumber, errors: errors, request: request})
  }

  setMemberAddress = (memberId, e) => {
    let members = Object.assign([], this.state.members);
    let errors = Object.assign({}, this.state.errors);

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      let index = members.findIndex((obj => obj.id === memberId))
      members[index].address = ipv4
      delete errors.memberAddressError
    }
    else {
      errors.memberAddressError = 'error'
    }
    this.setState({members: members, errors: errors})
  }

  setMemberName = (memberId, e) => {
    let members = Object.assign([], this.state.members);
    let errors = Object.assign({}, this.state.errors);

    const name = e.target.value

    if (name) {
      let index = members.findIndex((obj => obj.id === memberId))
      members[index].name = name
      delete errors.memberNameError
    }
    else {
      errors.memberNameError = 'error'
    }
    this.setState({members: members, errors: errors})
  }

  setMemberPort = (memberId, p) => {
    let members = Object.assign([], this.state.members);
    let errors = Object.assign({}, this.state.errors);

    const port = parseInt(p.target.value)

    if (isNaN(port)) {
      errors.memberPortError = 'error'
    }
    else {
      let index = members.findIndex((obj => obj.id === memberId))
      members[index].port = port
      delete errors.memberPortError
    }
    this.setState({members: members, errors: errors})
  }

  removeMember = (memberId) => {
    let members = Object.assign([], this.state.members);
    let errors = Object.assign({}, this.state.errors);

    if (memberId) {
      let index = members.findIndex((obj => obj.id === memberId))
      members.splice(index, 1)
      delete errors.membersError
    }
    else {
      errors.membersError = 'error'
    }
    this.setState({members: members, errors: errors})
  }

  removeMembersId = () => {
    let list = Object.assign([], this.state.members);
    let request = Object.assign([], this.state.request);
    let newList = []

    list.forEach((item, i) => {
      newList.push({name: item.name, address: item.address, port: item.port})
    })

    request.members = newList

    if (this.state.request.serviceType === 'L4') {
      this.setState({request: request}, () => this.createService())
    }
  }


  createService = async () => {
    let serviceName = this.state.request.serviceName

    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.request.serviceType,
          "snat": this.state.request.snat,
          "routeDomainId": this.state.request.routeDomain,
          "destination": `${this.state.request.destination}:${this.state.request.destinationPort}`,
          "mask": '255.255.255.255',
          "source": '0.0.0.0/0'
        },
        "profiles": [
          {
            "name": `fastl4_${serviceName}`,
            "type": "fastl4",
            "idleTimeout": 300
          }
        ],
        "pool": {
            "name": `pool_${serviceName}`,
            "loadBalancingMode": this.state.request.lbMethod,
            "nodes": this.state.request.members
        },
        "monitor": {
            "name": `${this.state.request.monitorType}_${serviceName}`,
            "type": this.state.request.monitorType
        }
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {

        this.setState({loading: false, response: true})
        this.response()
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
      request: {},
      errors: []
    })
  }


  render() {
    console.log(this.props.certificatesError)
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>CREATE L4</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>CREATE L4</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >

          <AssetSelector />
          <Divider/>

          { ( (this.props.asset && this.props.asset.id) && this.props.partition ) ?
            <React.Fragment>
              { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Service Created"
                 />
              }
              { !this.state.loading && !this.state.response &&
              <Form
                {...layout}
                name="basic"
                initialValues={{

                }}
                onFinish={null}
                onFinishFailed={null}
              >

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                  </Col>
                  <Col span={16}>
                  {this.state.errors.serviceNameError ?
                    <React.Fragment>
                      <Input style={{width: 450, borderColor: 'red'}} name="serviceName" id='serviceName' onBlur={e => this.setServiceName(e)} />
                      <p style={{color: 'red'}}>{this.state.errors.serviceNameError}</p>
                    </React.Fragment>
                  :
                    <Input style={{width: 450}} name="serviceName" id='serviceName' onBlur={e => this.setServiceName(e)} />
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
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.props.routeDomains && this.props.routeDomains.length > 0 ?
                        <Select
                          defaultValue={this.state.request.routeDomain}
                          value={this.state.request.routeDomain}
                          showSearch
                          style={{width: 450}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.setRouteDomain(n)}
                        >
                          <React.Fragment>
                            {this.props.routeDomains.map((n, i) => {
                              return (
                                <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.snatsLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.snats && this.state.snats.length > 0 ?
                        <Select
                          defaultValue={this.state.request.snat}
                          value={this.state.request.snat}
                          showSearch
                          style={{width: 450}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.setSnat(n)}
                        >
                          <React.Fragment>
                            {this.state.snats.map((n, i) => {
                              console.log(n)
                              return (
                                <Select.Option key={i} value={n}>{n}</Select.Option>
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination IP:</p>
                  </Col>
                  <Col span={16}>
                  {this.state.errors.destinationError ?
                    <React.Fragment>
                      <Input style={{width: 450, borderColor: 'red'}} name="destination" id='destination' onBlur={e => this.setDestination(e)} />
                      <p style={{color: 'red'}}>{this.state.errors.destinationError}</p>
                    </React.Fragment>
                  :
                    <Input style={{width: 450}} name="destination" id='destination' onBlur={e => this.setDestination(e)} />
                  }
                  </Col>
                </Row>
                <br/>

                <Form.Item
                  label="Destination Port"
                  name='destinationPort'
                  key="destinationPort"
                  validateStatus={this.state.errors.destinationPortError}
                  help={this.state.errors.destinationPortError ? 'Please input a valid destination Port' : null }
                >
                  <Input id='destinationPort' onBlur={e => this.setDestinationPort(e)} />
                </Form.Item>

                { this.state.request.serviceType === 'L7' ?
                  <Form.Item
                    label="Certificate"
                    name='certificate'
                    key="certificate"
                    validateStatus={this.state.errors.certificateError}
                    help={this.state.errors.certificateError ? 'Please select a valid certificate' : null }
                  >
                  <Select id='certificate' onChange={e => this.setCertificateName(e)}>
                  {this.props.certificates ? this.props.certificates.map((n, i) => {
                    return (
                      <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                      )
                    })
                  :
                  null
                  }
                  </Select>
                  </Form.Item>
                  :
                  null
                }

                { this.state.request.serviceType === 'L7' ?
                  <Form.Item
                    label="Key"
                    name='key'
                    key="key"
                    validateStatus={this.state.errors.keyError}
                    help={this.state.errors.keyError ? 'Please select a valid key' : null }
                  >
                  <Select id='key' onChange={e => this.setKeyName(e)}>
                  {this.props.keys ? this.props.keys.map((n, i) => {
                    return (
                      <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                      )
                    })
                  :
                    null
                  }
                  </Select>
                  </Form.Item>
                  :
                  null
                }

                <Form.Item
                  label="Load Balancing Method"
                  name='lbMethod'
                  key="lbMethod"
                  validateStatus={this.state.errors.lbMethodError}
                  help={this.state.errors.lbMethodError ? 'Please input a valid Loadbalancing Method' : null }
                >
                  <Select id='lbMethod' onChange={a => this.setLbMethod(a)}>
                    <Select.Option key={'round-robin'} value={'round-robin'}>round-robin</Select.Option>
                    <Select.Option key={'least-connections-member'} value={'least-connections-member'}>least-connections-member</Select.Option>
                    <Select.Option key={'observed-member'} value={'observed-member'}>observed-member</Select.Option>
                    <Select.Option key={'predictive-member'} value={'predictive-member'}>predictive-member</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Monitor Type"
                  name='monitorType'
                  key="monitorType"
                  validateStatus={this.state.errors.monitorTypeError}
                  help={this.state.errors.monitorTypeError ? 'Please input a valid Monitor Type' : null }
                >
                  <Select id='monitorType' onChange={a => this.setMonitorType(a)}>
                    <Select.Option key={'tcp-half-open'} value={'tcp-half-open'}>tcp-half-open</Select.Option>
                    <Select.Option key={'http'} value={'http'}>http</Select.Option>
                  </Select>
                </Form.Item>

                { this.state.request.monitorType === 'http' ?
                  <Form.Item
                    label="Monitor send string"
                    name='monitorSendString'
                    key="monitorSendString"
                    validateStatus={this.state.errors.monitorSendStringError}
                    help={this.state.errors.monitorSendStringError ? 'Please input a valid monitor send string' : null }
                  >
                    <Input.TextArea rows={4} onChange={e => this.setMonitorSendString(e)} />
                  </Form.Item>
                  :
                  null
                }

                { this.state.request.monitorType === 'http' ?
                  <Form.Item
                    label="Monitor receive string"
                    name='monitorReceiveString'
                    key="monitorReceiveString"
                    validateStatus={this.state.errors.monitorReceiveStringError}
                    help={this.state.errors.monitorReceiveStringError ? 'Please input a valid monitor receive string' : null }
                  >
                    <Input.TextArea id='monitorReceiveString' rows={4} onChange={e => this.setMonitorReceiveString(e)} />
                  </Form.Item>
                  :
                  null
                }

                <Form.Item
                  label="One more member"
                  name='membersNumber'
                  key="membersNumber"
                  validateStatus={this.state.errors.membersNumberError}
                  help={this.state.errors.membersNumberError ? 'Please input a valid number of members' : null }
                >
                  <Button type="primary" onClick={() => this.oneMoreMember()}>
                    +
                  </Button>
                  {//<Input id='membersNumber' onBlur={e => this.setMembersNumber(e)} />
                  }
                </Form.Item>

                {
                  this.state.members.map((n, i) => {
                    let a = 'address' + n.id
                    let na = 'name' + n.id
                    let pa = 'port' + n.id
                    let r = 'remove' + n.id
                    return (
                      <React.Fragment>
                      <Form.Item
                        label="Address"
                        name={a}
                        key={a}
                        validateStatus={this.state.errors.memberAddressError}
                        help={this.state.errors.memberAddressError ? 'Please input a valid IP' : null }
                      >
                        <Input id={a} value={n.address} style={{display: 'block'}} onBlur={e => this.setMemberAddress(n.id, e)} />
                      </Form.Item>

                      <Form.Item
                        label="Name"
                        name={na}
                        key={na}
                        validateStatus={this.state.errors.memberNameError}
                        help={this.state.errors.memberNameError ? 'Please input a valid name' : null }
                      >
                        <Input id={na} style={{display: 'block'}} onBlur={e => this.setMemberName(n.id, e)} />
                      </Form.Item>

                      <Form.Item
                        label="Port"
                        name={pa}
                        key={pa}
                        validateStatus={this.state.errors.memberPortError}
                        help={this.state.errors.memberPortError ? 'Please input a valid port' : null }
                      >
                        <Input id='memberPort' placeholder='port' onBlur={e => this.setMemberPort(n.id, e)}/>
                      </Form.Item>

                      <Form.Item
                        label="Remove member"
                        name={r}
                        key={r}
                        validateStatus={this.state.errors.removeMemberError}
                        help={this.state.errors.removeMemberError ? 'Please input a valid number of members' : null }
                      >
                        <Button type="danger" onClick={() => this.removeMember(n.id)}>
                          -
                        </Button>
                        <Divider/>
                      </Form.Item>

                      </React.Fragment>
                    )
                  })
                }


                <Row>
                  <Col offset={8} span={16}>
                    { this.state.request.serviceName && this.state.request.snat && this.state.request.destination ?
                      <Button type="primary" onClick={() => this.createService()} >
                        Add Permission
                      </Button>
                    :
                      <Button type="primary" onClick={() => this.createService()} disabled>
                        Add Permission
                      </Button>
                    }
                  </Col>
                </Row>

              </Form>
            }

            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.certificatesError ? <Error component={'create loadbalancer'} error={[this.props.certificatesError]} visible={true} type={'setCertificatesError'} /> : null }
            { this.props.keysError ? <Error component={'create loadbalancer'} error={[this.props.keysError]} visible={true} type={'setKeysError'} /> : null }
            { this.props.routeDomainsError ? <Error component={'create loadbalancer'} error={[this.props.routeDomainsError]} visible={true} type={'setRouteDomainsError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  certificates: state.f5.certificates,
  certificatesError: state.f5.certificatesError,
  keys: state.f5.keys,
  keysError: state.f5.keysError,
  routeDomains: state.f5.routeDomains,
  routeDomainsError: state.f5.routeDomainsError,
}))(CreateF5Service);
