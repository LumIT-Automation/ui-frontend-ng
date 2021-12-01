import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/f5Error"

import {
  setCertificates,
  setCertificatesError,
  setKeys,
  setKeysError,
  setRouteDomains,
  setRouteDomainsError,
  setCreateL4ServiceError,
  setCreateL7ServiceError
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
      serviceTypes: ['L4', 'L7'],
      snats: ['none', 'automap'],
      lbMethods: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      monitorTypesL7: ['tcp-half-open', 'http'],
      monitorTypesL4: ['tcp-half-open'],
      request: {
        routeDomain: null,
        certificate: null,
        key: null,
        source: "0.0.0.0/0",
        nodes: []
      }
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state.request.routeDomain)
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


  setServiceType = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.serviceType = e
      delete errors.serviceTypeError
    }
    else {
      errors.serviceTypeError = 'Please select a valid ServiceType'
    }
    this.setState({request: request, errors: errors})
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

  setRouteDomain = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (id) {
      request.routeDomain = id
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

  setLbMethod = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.lbMethod = e
      delete errors.lbMethodError
    }
    else {
      errors.lbMethodError = 'Please select a valid Snat'
    }

    this.setState({request: request, errors: errors})
  }

  setDestination = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    const ipv4 = e.target.value
    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(ipv4)) {
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
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e.target.value !== '' && !isNaN(e.target.value) && e.target.value >= 0 && e.target.value < 65536 ) {
      request.destinationPort = e.target.value
      delete errors.destinationPortError
    }
    else {
      request.destinationPort = null
      errors.destinationPortError = 'Please input a valid destination port'
    }

    this.setState({request: request, errors: errors})
  }

  setCertificate = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.certificate = e
      delete errors.certificateError
    }
    else {
      errors.certificateError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setKey = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.key = e
      delete errors.keyError
    }
    else {
      errors.keyError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitorType = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e) {
      request.monitorType = e
      delete errors.monitorTypeError
    }
    else {
      errors.monitorTypeError = 'Please select a valid Monitor Type'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitorSendString = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e.target.value !== '' ) {
      request.nonitorSendString = e.target.value
      delete errors.nonitorSendStringError
    }
    else {
      request.nonitorSendString = null
      errors.nonitorSendStringError = 'Please input a valid monitor send string'
    }

    this.setState({request: request, errors: errors})
  }

  setMonitorReceiveString = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (e.target.value !== '' ) {
      request.nonitorReceiveString = e.target.value
      delete errors.nonitorReceiveStringError
    }
    else {
      request.nonitorReceiveString = null
      errors.nonitorReceiveStringError = 'Please input a valid monitor receive string'
    }

    this.setState({request: request, errors: errors})
  }


  addNode = () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))
    let id = 0
    let n = 0

    this.state.request.nodes.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let node = {id: n}
    nodes.push(node)
    request.nodes = nodes

    this.setState({request: request})
  }

  removeNode = r => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let list = nodes.filter(n => {
      return r !== n.id
    })

    request.nodes = list

    this.setState({request: request})
  }


  setNodeAddress = (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    const ipv4 = e.target.value
    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(ipv4)) {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].address = ipv4
      delete nodes[index].addressColor
      delete nodes[index].addressError
    }
    else {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].address = null
      nodes[index].addressColor = 'red'
      nodes[index].addressError = 'Please input a valid ip address'
    }
    request.nodes = nodes
    this.setState({request: request})
  }

  setNodeName = (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    const name = e.target.value

    if (name) {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].name = name
      delete nodes[index].nameColor
      delete nodes[index].nameError
    }
    else {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].name = null
      nodes[index].nameColor = 'red'
      nodes[index].nameError = 'Please input a valid node name'
    }
    request.nodes = nodes
    this.setState({request: request})
  }

  setNodePort = (nodeId, p) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    const port = parseInt(p.target.value)

    if (p.target.value !== '' && !isNaN(p.target.value) && p.target.value >= 0 && p.target.value < 65536) {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].port = port
      delete nodes[index].portColor
      delete nodes[index].portError
    }
    else {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes[index].port = null
      nodes[index].portColor = 'red'
      nodes[index].portError = 'Please input a valid port'
    }
    request.nodes = nodes
    this.setState({request: request})
  }


  createService = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    if (this.state.request.serviceType === 'L4') {
      if (this.state.request.routeDomain) {
        this.createL4Service()
      }
      else {
        this.createL4ServiceNoRD()
      }
    }
    if (this.state.request.serviceType === 'L7') {
      if (this.state.request.routeDomain) {
        this.createL7Service()
      }
      else {
        this.createL7ServiceNoRD()
      }
    }
  }


  createL4Service = async () => {
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
          "nodes": this.state.request.nodes
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
        this.props.dispatch(setCreateL4ServiceError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  createL4ServiceNoRD = async () => {
    let serviceName = this.state.request.serviceName

    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.request.serviceType,
          "snat": this.state.request.snat,
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
          "nodes": this.state.request.nodes
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
        this.props.dispatch(setCreateL4ServiceError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  createL7Service = async () => {
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
          "source": this.state.request.source
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
            "cert": this.state.request.certificate,
            "key": this.state.request.key,
            "chain": "",
            "context": "clientside"
          }
        ],
        "pool": {
          "name": `pool_${serviceName}`,
          "loadBalancingMode": this.state.request.lbMethod,
          "nodes": this.state.request.nodes
        },
        "monitor": {
          "name": `${this.state.request.monitorType}_${serviceName}`,
          "type": this.state.request.monitorType,
          "send": `${this.state.request.monitorSendString}`,
          "recv": `${this.state.request.monitorReceiveString}`
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
        this.props.dispatch(setCreateL7ServiceError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  createL7ServiceNoRD = async () => {
    let serviceName = this.state.request.serviceName
    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.request.serviceType,
          "snat": this.state.request.snat,
          "destination": `${this.state.request.destination}:${this.state.request.destinationPort}`,
          "mask": '255.255.255.255',
          "source": this.state.request.source
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
            "cert": this.state.request.certificate,
            "key": this.state.request.key,
            "chain": "",
            "context": "clientside"
          }
        ],
        "pool": {
          "name": `pool_${serviceName}`,
          "loadBalancingMode": this.state.request.lbMethod,
          "nodes": this.state.request.nodes
        },
        "monitor": {
          "name": `${this.state.request.monitorType}_${serviceName}`,
          "type": this.state.request.monitorType,
          "send": `${this.state.request.monitorSendString}`,
          "recv": `${this.state.request.monitorReceiveString}`
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
        this.props.dispatch(setCreateL7ServiceError(error))
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
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Service Created"
                 />
              }
              { !this.state.loading && !this.state.response &&
                <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Type:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.serviceTypesLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.serviceTypes && this.state.serviceTypes.length > 0 ?
                        <Select
                          defaultValue={this.state.request.serviceType}
                          value={this.state.request.serviceType}
                          showSearch
                          style={{width: 450}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.setServiceType(n)}
                        >
                          <React.Fragment>
                            {this.state.serviceTypes.map((n, i) => {
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                  </Col>
                  <Col span={16}>
                  {this.state.errors.serviceNameError ?
                    <React.Fragment>
                      <Input style={{width: 450, borderColor: 'red'}} name="serviceName" id='serviceName' onBlur={e => this.setServiceName(e)} />
                      <p style={{color: 'red'}}>{this.state.errors.serviceNameError}</p>
                    </React.Fragment>
                  :
                    <Input defaultValue={this.state.request.serviceName} style={{width: 450}} name="serviceName" id='serviceName' onBlur={e => this.setServiceName(e)} />
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
                              console.log(n)
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
                    <Input defaultValue={this.state.request.destination} style={{width: 450}} name="destination" id='destination' onBlur={e => this.setDestination(e)} />
                  }
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination Port:</p>
                  </Col>
                  <Col span={16}>
                  {this.state.errors.destinationPortError ?
                    <React.Fragment>
                      <Input style={{width: 450, borderColor: 'red'}} name="destinationPort" id='destinationPort' onBlur={e => this.setDestinationPort(e)} />
                      <p style={{color: 'red'}}>{this.state.errors.destinationPortError}</p>
                    </React.Fragment>
                  :
                    <Input defaultValue={this.state.request.destinationPort} style={{width: 450}} name="destinationPort" id='destinationPort' onBlur={e => this.setDestinationPort(e)} />
                  }
                  </Col>
                </Row>
                <br/>

                { this.state.request.serviceType === 'L7' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Certificate:</p>
                      </Col>
                      <Col span={16}>
                        { this.state.certificatesLoading ?
                          <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                        :
                        <React.Fragment>
                          { this.props.certificates && this.props.certificates.length > 0 ?
                            <Select
                              defaultValue={this.state.request.certificate}
                              value={this.state.request.certificate}
                              showSearch
                              style={{width: 450}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setCertificate(n)}
                            >
                              <React.Fragment>
                                {this.props.certificates.map((n, i) => {
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
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                      </Col>
                      <Col span={16}>
                        { this.state.keysLoading ?
                          <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                        :
                        <React.Fragment>
                          { this.props.keys && this.props.keys.length > 0 ?
                            <Select
                              defaultValue={this.state.request.key}
                              value={this.state.request.key}
                              showSearch
                              style={{width: 450}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setKey(n)}
                            >
                              <React.Fragment>
                                {this.props.keys.map((n, i) => {
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
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Load Balancing Methods:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.lbMethodsLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.lbMethods && this.state.lbMethods.length > 0 ?
                        <Select
                          defaultValue={this.state.request.lbMethod}
                          value={this.state.request.lbMethod}
                          showSearch
                          style={{width: 450}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.setLbMethod(n)}
                        >
                          <React.Fragment>
                            {this.state.lbMethods.map((n, i) => {
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

                { this.state.request.serviceType === 'L7' ?
                  <Row>
                    <Col offset={2} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                    </Col>
                    <Col span={16}>
                      { this.state.monitorTypesL7Loading ?
                        <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                      :
                      <React.Fragment>
                        { this.state.monitorTypesL7 && this.state.monitorTypesL7.length > 0 ?
                          <Select
                            defaultValue={this.state.request.monitorType}
                            value={this.state.request.monitorType}
                            showSearch
                            style={{width: 450}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.setMonitorType(n)}
                          >
                            <React.Fragment>
                              {this.state.monitorTypesL7.map((n, i) => {
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
                :
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.monitorTypesL4Loading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.monitorTypesL4 && this.state.monitorTypesL4.length > 0 ?
                        <Select
                          defaultValue={this.state.request.monitorType}
                          value={this.state.request.monitorType}
                          showSearch
                          style={{width: 450}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.setMonitorType(n)}
                        >
                          <React.Fragment>
                            {this.state.monitorTypesL4.map((n, i) => {
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
                }

                { this.state.request.monitorType === 'http' ?
                  <React.Fragment>
                    <br/>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor send string:</p>
                      </Col>
                      <Col span={16}>
                      {this.state.errors.monitorSendStringError ?
                        <React.Fragment>
                          <Input.TextArea style={{width: 450, borderColor: 'red'}} name="monitorSendString" id='monitorSendString' onBlur={e => this.setMonitorSendString(e)} />
                          <p style={{color: 'red'}}>{this.state.errors.monitorTypePortError}</p>
                        </React.Fragment>
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorSendString} style={{width: 450}} name="monitorSendString" id='monitorSendString' onBlur={e => this.setMonitorSendString(e)} />
                      }
                      </Col>
                    </Row>
                    <br/>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor receive string:</p>
                      </Col>
                      <Col span={16}>
                      {this.state.errors.monitorReceiveStringError ?
                        <React.Fragment>
                          <Input.TextArea style={{width: 450, borderColor: 'red'}} name="monitorReceiveString" id='monitorReceiveString' onBlur={e => this.setMonitorReceiveString(e)} />
                          <p style={{color: 'red'}}>{this.state.errors.monitorTypePortError}</p>
                        </React.Fragment>
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorReceiveString} style={{width: 450}} name="monitorReceiveString" id='monitorReceiveString' onBlur={e => this.setMonitorReceiveString(e)} />
                      }
                      </Col>
                    </Row>
                  </React.Fragment>
                :
                  null
                }

                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Add a node:</p>
                  </Col>
                  <Col span={16}>
                    <Button type="primary" onClick={() => this.addNode()}>
                      +
                    </Button>
                  </Col>
                </Row>
                <br/>

                { this.state.request.nodes ?
                  this.state.request.nodes.map((n, i) => {
                  let address = 'address' + n.id
                  let name = 'name' + n.id
                  let port = 'port' + n.id

                  return (
                    <React.Fragment>
                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                        </Col>
                        <Col span={16}>
                        { n.addressError ?
                          <React.Fragment>
                            <Input name={address} id={address} style={{display: 'block', width: 450, borderColor: n.addressColor}} onBlur={e => this.setNodeAddress(n.id, e)} />
                            <p style={{color: n.addressColor}}>{n.addressError}</p>
                          </React.Fragment>
                        :
                          <Input defaultValue={n.address} name={address} id={address} style={{display: 'block', width: 450, borderColor: n.addressColor}} onBlur={e => this.setNodeAddress(n.id, e)} />
                        }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                        </Col>
                        <Col span={16}>
                        { n.nameError ?
                          <React.Fragment>
                            <Input name={name} id={name} style={{display: 'block', width: 450, borderColor: n.nameColor}} onBlur={e => this.setNodeName(n.id, e)} />
                            <p style={{color: n.nameColor}}>{n.nameError}</p>
                          </React.Fragment>
                        :
                          <Input defaultValue={n.name} name={name} id={name} style={{display: 'block', width: 450, borderColor: n.nameColor}} onBlur={e => this.setNodeName(n.id, e)} />
                        }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                        </Col>
                        <Col span={16}>
                        { n.portError ?
                          <React.Fragment>
                            <Input name={port} id={port} style={{display: 'block', width: 450, borderColor: n.portColor}} onBlur={e => this.setNodePort(n.id, e)} />
                            <p style={{color: n.portColor}}>{n.portError}</p>
                          </React.Fragment>
                        :
                          <Input defaultValue={n.port} name={port} id={port} style={{display: 'block', width: 450, borderColor: n.portColor}} onBlur={e => this.setNodePort(n.id, e)} />
                        }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove node:</p>
                        </Col>
                        <Col span={16}>
                          <Button type="danger" onClick={() => this.removeNode(n.id)}>
                            -
                          </Button>
                        </Col>
                      </Row>

                      <br/>

                    </React.Fragment>
                  )
                  })
                  :
                  null
                }

                <Row>
                  <Col offset={8} span={16}>
                    { this.state.request.serviceType &&
                      this.state.request.serviceName &&
                      this.state.request.snat &&
                      this.state.request.destination &&
                      this.state.request.destinationPort &&
                      this.state.request.lbMethod &&
                      this.state.request.monitorType
                      ?
                      <Button type="primary" onClick={() => this.createService()} >
                        Create Load Balancer
                      </Button>
                    :
                      <Button type="primary" onClick={() => this.createService()} disabled>
                        Create Load Balancer
                      </Button>
                    }
                  </Col>
                </Row>
              </React.Fragment>

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

            { this.props.createL4ServiceError ? <Error component={'create loadbalancer'} error={[this.props.createL4ServiceError]} visible={true} type={'setCreateL4ServiceError'} /> : null }
            { this.props.createL7ServiceError ? <Error component={'create loadbalancer'} error={[this.props.createL7ServiceError]} visible={true} type={'setCreateL7ServiceError'} /> : null }
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

  createL4ServiceError: state.f5.createL4ServiceError,
  createL7ServiceError: state.f5.createL7ServiceError
}))(CreateF5Service);
