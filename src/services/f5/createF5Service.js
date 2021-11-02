import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setCertificates, setKeys, setRouteDomains } from '../../_store/store.f5'

import AssetSelector from '../../f5/assetSelector'

import { Modal, Alert, Form, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}



class CreateF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      membersNumber: 0,
      members: [],
      body: {
        service: 'F5 - Create Service',
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
    if (this.props.asset && (this.props.asset !== prevProps.asset) ) {
      this.fetchCertificates()
      this.fetchKeys()
      this.fetchRouteDomains()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  fetchCertificates = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setCertificates( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token)
  }

  fetchKeys = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setKeys( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
  }

  fetchRouteDomains = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setRouteDomains( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/routedomains/`, this.props.token)
  }

  setServiceType = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.serviceType = e
      delete errors.serviceTypeError
    }
    else {
      errors.serviceTypeError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setServiceName = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.serviceName = e.target.value
      delete errors.serviceNameError
    }
    else {
      errors.serviceNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setRouteDomain = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e.toString()) {
      body.routeDomain = e
      delete errors.routeDomainError
    }
    else {
      errors.routeDomainError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setSnat = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.snat = e
      delete errors.snatError
    }
    else {
      errors.snatError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setDestination = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      body.destination = ipv4
      delete errors.destinationError
    }
    else {
      errors.destinationError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setDestinationPort = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPortError = 'error'
    }
    else {
      body.destinationPort = e.target.value
      delete errors.destinationPortError
    }
    this.setState({body: body, errors: errors})
  }

  setCertificateName = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.certificateName = e
      delete errors.certificateNameError
    }
    else {
      errors.certificateNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setKeyName = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.keyName = e
      delete errors.keyNameError
    }
    else {
      errors.keyNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }
/*
  setDestinationPoolPort = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPoolPortError = 'error'
    }
    else {
      body.destinationPoolPort = e.target.value
      delete errors.destinationPoolPortError
    }
    this.setState({body: body, errors: errors})
  }
*/
  setLbMethod = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'round-robin':
        body.lbMethod = 'round-robin'
        delete errors.lbMethodError
        break
      case 'least-connections-member':
        body.lbMethod = 'least-connections-member'
        delete errors.lbMethodError
        break
      case 'observed-member':
        body.lbMethod = 'observed-member'
        delete errors.lbMethodError
        break
      case 'predictive-member':
        body.lbMethod = 'predictive-member'
        delete errors.lbMethodError
        break
      default:
        errors.lbMethodError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setMonitorType = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'tcp-half-open':
        body.monitorType = 'tcp-half-open'
        delete errors.monitorTypeError
        break
      case 'http':
        body.monitorType = 'http'
        delete errors.monitorTypeError
        break

      default:
        errors.monitorTypeError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setMonitorSendString = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.monitorSendString = e.target.value
      delete errors.monitorSendStringError
    }
    else {
      errors.monitorSendStringError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setMonitorReceiveString = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.monitorReceiveString = e.target.value
      delete errors.monitorReceiveStringError
    }
    else {
      errors.moonitorReceiveStringError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  oneMoreMember = () => {
    let membersNumber = this.state.membersNumber
    let members = this.state.members
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    membersNumber = membersNumber + 1
    members.push({id: membersNumber})
    delete errors.membersNumberError
    this.setState({membersNumber: membersNumber, errors: errors, body: body})
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
    let body = Object.assign([], this.state.body);
    let newList = []

    list.forEach((item, i) => {
      newList.push({name: item.name, address: item.address, port: item.port})
    })

    body.members = newList

    if (this.state.body.serviceType === 'L4') {
      this.setState({body: body}, () => this.createL4Service())
    } else if (this.state.body.serviceType === 'L7') {
      this.setState({body: body}, () => this.createL7Service())
    }
  }


  createL4Service = async () => {
    let serviceName = this.state.body.serviceName

    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.body.serviceType,
          "snat": this.state.body.snat,
          "routeDomainId": this.state.body.routeDomain,
          "destination": `${this.state.body.destination}:${this.state.body.destinationPort}`,
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
            "loadBalancingMode": this.state.body.lbMethod,
            "nodes": this.state.body.members
        },
        "monitor": {
            "name": `${this.state.body.monitorType}_${serviceName}`,
            "type": this.state.body.monitorType
        }
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {

        this.setState({loading: false, success: true})
        this.success()
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  createL7Service = async () => {
    let serviceName = this.state.body.serviceName
    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.body.serviceType,
          "snat": this.state.body.snat,
          "destination": `${this.state.body.destination}:${this.state.body.destinationPort}`,
          "mask": '255.255.255.255',
          "source": this.state.body.source
        },
        "profiles": [
            {
                "name": `tcp-wan-optimized_${serviceName}`,
                "type": "tcp",
                "defaultsFrom": "/Common/tcp-wan-optimized",
                "context": "clientside"
            },
            {
                "name": `tcp-lan-optimized_${serviceName}`,
                "type": "tcp",
                "defaultsFrom": "/Common/tcp-lan-optimized",
                "context": "serverside"
            },
            {
                "name": `http_${serviceName}`,
                "type": "http",
                "defaultsFrom": "/Common/http"
            },
            {
                "name": `client-ssl_${serviceName}`,
                "type": "client-ssl",
                "cert": this.state.body.certificateName,
                "key": this.state.body.keyName,
                "chain": "",
                "context": "clientside"
            }
        ],
        "pool": {
            "name": `pool_${serviceName}`,
            "loadBalancingMode": this.state.body.lbMethod,
            "nodes": this.state.body.members
        },
        "monitor": {
            "name": `${this.state.body.monitorType}_${serviceName}`,
            "type": this.state.body.monitorType,
            "send": `${this.state.body.monitorSendString}`,
            "recv": `${this.state.body.monitorReceiveString}`
        }
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {

        this.setState({loading: false, success: true})
        this.success()
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }


  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      success: false,
      body: {},
      errors: []
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>CREATE LOAD BALANCER</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>CREATE LOAD BALANCER</p>}
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
            { !this.state.loading && this.state.success &&
              <Result
                 status="success"
                 title="Service Created"
               />
            }
            { !this.state.loading && !this.state.success &&
              <Form
                {...layout}
                name="basic"
                initialValues={{

                }}
                onFinish={null}
                onFinishFailed={null}
              >
                <Form.Item
                  label="Service Type"
                  name='serviceType'
                  key="serviceType"
                  validateStatus={this.state.errors.serviceTypeError}
                  help={this.state.errors.serviceTypeError ? 'Please select a valid Service Type' : null }
                >
                  <Select id='serviceType' onChange={e => this.setServiceType(e)}>
                    <Select.Option key={'L7'} value={'L7'}>Layer 7</Select.Option>
                    <Select.Option key={'L4'} value={'L4'}>Layer 4</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Service Name"
                  name='serviceName'
                  key="serviceName"
                  validateStatus={this.state.errors.serviceNameError}
                  help={this.state.errors.serviceNameError ? 'Please input a valid Service Name' : null }
                >
                  <Input id='name' onChange={e => this.setServiceName(e)} />
                </Form.Item>

                { this.state.body.serviceName ?
                <React.Fragment>

                <Form.Item
                  label="Route Domain"
                  name='routeDomain'
                  key="routeDomain"
                  validateStatus={this.state.errors.routeDomainError}
                  help={this.state.errors.routeDomainError ? 'Please select a valid routeDomain' : null }
                >
                <Select id='snat' onChange={e => this.setRouteDomain(e)}>
                {this.props.routeDomains.map((n, i) => {
                  return (
                    <Select.Option  key={i} value={n.id}>{n.id}</Select.Option>
                    )
                  })}
                </Select>
                </Form.Item>

                <Form.Item
                  label="Snat"
                  name='snat'
                  key="snat"
                  validateStatus={this.state.errors.snatError}
                  help={this.state.errors.snatError ? 'Please select a valid Snat' : null }
                >
                  <Select id='snat' onChange={e => this.setSnat(e)}>
                    <Select.Option key={'none'} value={'none'}>none</Select.Option>
                    <Select.Option key={'automap'} value={'automap'}>automap</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Destination"
                  name='destination'
                  key="destination"
                  validateStatus={this.state.errors.destinationError}
                  help={this.state.errors.destinationError ? 'Please input a valid destination' : null }
                >
                    <Input id='destination' onBlur={e => this.setDestination(e)} />
                </Form.Item>

                <Form.Item
                  label="Destination Port"
                  name='destinationPort'
                  key="destinationPort"
                  validateStatus={this.state.errors.destinationPortError}
                  help={this.state.errors.destinationPortError ? 'Please input a valid destination Port' : null }
                >
                  <Input id='destinationPort' onBlur={e => this.setDestinationPort(e)} />
                </Form.Item>

                { this.state.body.serviceType === 'L7' ?
                  <Form.Item
                    label="Certificate"
                    name='certificate'
                    key="certificate"
                    validateStatus={this.state.errors.certificateError}
                    help={this.state.errors.certificateError ? 'Please select a valid certificate' : null }
                  >
                  <Select id='snat' onChange={e => this.setCertificateName(e)}>
                  {this.props.certificates.map((n, i) => {
                    return (
                      <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                      )
                    })}
                  </Select>
                  </Form.Item>
                  :
                  null
                }

                { this.state.body.serviceType === 'L7' ?
                  <Form.Item
                    label="Key"
                    name='key'
                    key="key"
                    validateStatus={this.state.errors.keyError}
                    help={this.state.errors.keyError ? 'Please select a valid key' : null }
                  >
                  <Select id='snat' onChange={e => this.setKeyName(e)}>
                  {this.props.keys.map((n, i) => {
                    return (
                      <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                      )
                    })}
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

                { this.state.body.monitorType === 'http' ?
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

                { this.state.body.monitorType === 'http' ?
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

                </React.Fragment>
                :
                null
              }


                <Form.Item
                  wrapperCol={ {offset: 8 }}
                  name="button"
                  key="button"
                >
                  <Button type="primary" onClick={() => this.removeMembersId()}>
                    Create Service
                  </Button>
                </Form.Item>

              </Form>
            }

            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} /> : <Error visible={false} errors={null}/>}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  certificates : state.f5.certificates,
  keys : state.f5.keys,
  routeDomains: state.f5.routeDomains
}))(CreateF5Service);
