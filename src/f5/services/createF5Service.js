import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../error/f5Error'

import {
  certificates,
  certificatesError,
  keys,
  keysError,
  routeDomains,
  routeDomainsError,
  createL4ServiceError,
  createL7ServiceError
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
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.main()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {

    await this.setState({certificatesLoading: true})
    let fetchedCertificates = await this.fetchCertificates()
    await this.setState({certificatesLoading: false})
    if (fetchedCertificates.status && fetchedCertificates.status !== 200 ) {
      this.props.dispatch(certificatesError(fetchedCertificates))
      return
    }
    else {
      this.props.dispatch(certificates( fetchedCertificates ))
    }

    await this.setState({keysLoading: true})
    let fetchedKeys = await this.fetchKeys()
    await this.setState({keysLoading: false})
    if (fetchedKeys.status && fetchedKeys.status !== 200 ) {
      this.props.dispatch(keysError(fetchedKeys))
      return
    }
    else {
      this.props.dispatch(keys( fetchedKeys ))
    }

    await this.setState({routeDomainsLoading: true})
    let fetchedRouteDomains = await this.fetchRouteDomains()
    await this.setState({routeDomainsLoading: false})
    if (fetchedRouteDomains.status && fetchedRouteDomains.status !== 200 ) {
      this.props.dispatch(routeDomainsError(fetchedRouteDomains))
      return
    }
    else {
      this.props.dispatch(routeDomains( fetchedRouteDomains ))
    }
  }



  //FETCH
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



  //SETTERS
  setServiceType = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serviceType = e
    this.setState({request: request})
  }

  setServiceName = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serviceName = e.target.value
    this.setState({request: request})
  }

  routeDomain = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.routeDomain = id
    this.setState({request: request})
  }

  setSnat = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.snat = e
    this.setState({request: request})
  }

  setLbMethod = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.lbMethod = e
    this.setState({request: request})
  }

  setDestination = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.destination = e.target.value
    this.setState({request: request})
  }

  setDestinationPort = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.destinationPort = e.target.value
    this.setState({request: request})
  }

  certificate = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.certificate = e
    this.setState({request: request})
  }

  key = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.key = e
    this.setState({request: request})
  }

  setMonitorType = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorType = e
    this.setState({request: request})
  }

  setMonitorSendString = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorSendString = e.target.value
    this.setState({request: request})
  }

  setMonitorReceiveString = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorReceiveString = e.target.value
    this.setState({request: request})
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

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].address = e.target.value

    request.nodes = nodes
    this.setState({request: request})
  }

  setNodeName = (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].name = e.target.value

    request.nodes = nodes
    this.setState({request: request})
  }

  setNodePort = (nodeId, p) => {
    console.log(p.target.value)
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].port = p.target.value

    request.nodes = nodes
    this.setState({request: request})
  }



  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.serviceType) {
      errors.serviceTypeError = true
      errors.serviceTypeColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.serviceTypeError
      delete errors.serviceTypeColor
      this.setState({errors: errors})
    }

    if (!request.serviceName) {
      errors.serviceNameError = true
      errors.serviceNameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.serviceNameError
      delete errors.serviceNameColor
      this.setState({errors: errors})
    }

    if (!request.snat) {
      errors.snatError = true
      errors.snatColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.snatError
      delete errors.snatColor
      this.setState({errors: errors})
    }

    if (!request.lbMethod) {
      errors.lbMethodError = true
      errors.lbMethodColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.lbMethodError
      delete errors.lbMethodColor
      this.setState({errors: errors})
    }

    if (!request.destination || !validators.ipv4(request.destination)) {
      errors.destinationError = true
      errors.destinationColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.destinationError
      delete errors.destinationColor
      this.setState({errors: errors})
    }

    if (!request.destinationPort || !validators.port(request.destinationPort)) {
      errors.destinationPortError = true
      errors.destinationPortColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.destinationPortError
      delete errors.destinationPortColor
      this.setState({errors: errors})
    }

    if (!request.monitorType) {
      errors.monitorTypeError = true
      errors.monitorTypeColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorTypeError
      delete errors.monitorTypeColor
      this.setState({errors: errors})
    }

    if (request.monitorType === 'L7' && !request.monitorSendString) {
      errors.monitorSendStringError = true
      errors.monitorSendStringColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorSendStringError
      delete errors.monitorSendStringColor
      this.setState({errors: errors})
    }

    if (request.monitorType === 'L7' && !request.monitorReceiveString) {
      errors.monitorReceiveStringError = true
      errors.monitorReceiveStringColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorReceiveStringError
      delete errors.monitorReceiveStringColor
      this.setState({errors: errors})
    }

    if (nodes.length > 0) {
      nodes.forEach((node, i) => {
        let index = nodes.findIndex((obj => obj.id === node.id))
        errors[node.id] = {}

        if (node.address && validators.ipv4(node.address)) {
          delete errors[node.id].addressError
          delete errors[node.id].addressColor
          this.setState({errors: errors})
        }
        else {
          errors[node.id].addressError = true
          errors[node.id].addressColor = 'red'
          this.setState({errors: errors})
        }

        if (!node.name) {
          errors[node.id].nameError = true
          errors[node.id].nameColor = 'red'
          this.setState({errors: errors})
        }
        else {
          delete errors[node.id].nameError
          delete errors[node.id].nameColor
          this.setState({errors: errors})
        }

        if (node.port && validators.port(node.port) ) {
          delete errors[node.id].portError
          delete errors[node.id].portColor
          this.setState({errors: errors})
        }
        else {
          errors[node.id].portError = true
          errors[node.id].portColor = 'red'
          this.setState({errors: errors})
        }
        if (Object.keys(errors[node.id]).length === 0) {
          delete errors[node.id]
          this.setState({errors: errors})
        }
      })
    }

    return errors
  }

  validation = async () => {
    console.log(this.state.errors)
    let validation = await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.createService()
    }

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
          "name": `vs_${serviceName}`,
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
          "name": `mon_${serviceName}`,
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
        this.props.dispatch(createL4ServiceError(error))
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
          "name": `vs_${serviceName}`,
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
          "name": `mon_${serviceName}`,
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
        this.props.dispatch(createL4ServiceError(error))
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
          "name": `vs_${serviceName}`,
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
          "name": `mon_${serviceName}`,
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
        this.props.dispatch(createL7ServiceError(error))
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
          "name": `vs_${serviceName}`,
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
          "name": `mon_${serviceName}`,
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
        this.props.dispatch(createL7ServiceError(error))
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
                        <React.Fragment>
                          {this.state.errors.serviceTypeError ?
                            <Select
                              defaultValue={this.state.request.serviceType}
                              value={this.state.request.serviceType}
                              showSearch
                              style={{width: 450, border: `1px solid ${this.state.errors.serviceTypeColor}`}}
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
                          }
                        </React.Fragment>
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
                      <Input style={{width: 450, borderColor: this.state.errors.serviceNameColor}} name="serviceName" id='serviceName' onChange={e => this.setServiceName(e)} />
                    :
                      <Input defaultValue={this.state.request.serviceName} style={{width: 450}} name="serviceName" id='serviceName' onChange={e => this.setServiceName(e)} />
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
                          onSelect={n => this.routeDomain(n)}
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.snatsLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                      <React.Fragment>
                        { this.state.snats && this.state.snats.length > 0 ?
                          <React.Fragment>
                            {this.state.errors.snatError ?
                              <Select
                                defaultValue={this.state.request.snat}
                                value={this.state.request.snat}
                                showSearch
                                style={{width: 450, border: `1px solid ${this.state.errors.snatColor}`}}
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
                            }
                          </React.Fragment>
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
                    <Input style={{width: 450, borderColor: 'red'}} name="destination" id='destination' onChange={e => this.setDestination(e)} />
                  :
                    <Input defaultValue={this.state.request.destination} style={{width: 450}} name="destination" id='destination' onChange={e => this.setDestination(e)} />
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
                    <Input style={{width: 450, borderColor: 'red'}} name="destinationPort" id='destinationPort' onChange={e => this.setDestinationPort(e)} />
                  :
                    <Input defaultValue={this.state.request.destinationPort} style={{width: 450}} name="destinationPort" id='destinationPort' onChange={e => this.setDestinationPort(e)} />
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
                                onSelect={n => this.certificate(n)}
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
                                onSelect={n => this.key(n)}
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
                        <React.Fragment>
                          {this.state.errors.lbMethodError ?
                            <Select
                              defaultValue={this.state.request.lbMethod}
                              value={this.state.request.lbMethod}
                              showSearch
                              style={{width: 450, border: `1px solid ${this.state.errors.lbMethodColor}`}}
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
                          }
                        </React.Fragment>
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
                            <React.Fragment>
                              {this.state.errors.monitorTypeError ?
                                <Select
                                  defaultValue={this.state.request.monitorType}
                                  value={this.state.request.monitorType}
                                  showSearch
                                  style={{width: 450, border: `1px solid ${this.state.errors.monitorTypeColor}`}}
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
                              }
                            </React.Fragment>
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
                            <React.Fragment>
                              {this.state.errors.monitorTypeError ?
                                <Select
                                  defaultValue={this.state.request.monitorType}
                                  value={this.state.request.monitorType}
                                  showSearch
                                  style={{width: 450, border: `1px solid ${this.state.errors.monitorTypeColor}`}}
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
                              }
                            </React.Fragment>
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
                        <Input.TextArea style={{width: 450, borderColor: this.state.errors.monitorSendStringColor }} name="monitorSendString" id='monitorSendString' onChange={e => this.setMonitorSendString(e)} />
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorSendString} style={{width: 450}} name="monitorSendString" id='monitorSendString' onChange={e => this.setMonitorSendString(e)} />
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
                        <Input.TextArea style={{width: 450, borderColor: this.state.errors.monitorReceiveStringColor}} name="monitorReceiveString" id='monitorReceiveString' onChange={e => this.setMonitorReceiveString(e)} />
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorReceiveString} style={{width: 450}} name="monitorReceiveString" id='monitorReceiveString' onChange={e => this.setMonitorReceiveString(e)} />
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
                    <Button type="primary" shape='round' onClick={() => this.addNode()}>
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
                          { this.state.errors[n.id] && this.state.errors[n.id].addressError ?
                            <Input key={address}  style={{display: 'block', width: 450, borderColor: this.state.errors[n.id].addressColor}} onChange={e => this.setNodeAddress(n.id, e)} />
                          :
                            <Input defaultValue={n.address} key={address} style={{display: 'block', width: 450}} onChange={e => this.setNodeAddress(n.id, e)} />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                        </Col>
                        <Col span={16}>
                          { this.state.errors[n.id] && this.state.errors[n.id].nameError ?
                            <Input key={name} name={name} id={name} style={{display: 'block', width: 450, borderColor: this.state.errors[n.id].nameColor}} onChange={e => this.setNodeName(n.id, e)} />
                          :
                            <Input defaultValue={n.name} key={name} name={name} id={name} style={{display: 'block', width: 450}} onChange={e => this.setNodeName(n.id, e)} />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                        </Col>
                        <Col span={16}>
                          { this.state.errors[n.id] && this.state.errors[n.id].portError ?
                            <Input key={port} name={port} id={port} style={{display: 'block', width: 450, borderColor: this.state.errors[n.id].portColor}} onChange={e => this.setNodePort(n.id, e)} />
                          :
                            <Input defaultValue={n.port} key={port} name={port} id={port} style={{display: 'block', width: 450}} onChange={e => this.setNodePort(n.id, e)} />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove node:</p>
                        </Col>
                        <Col span={16}>
                          <Button type="danger" shape='round' onClick={() => this.removeNode(n.id)}>
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
                    { /*this.state.request.serviceType &&
                      this.state.request.serviceName &&
                      this.state.request.snat &&
                      this.state.request.destination &&
                      this.state.request.destinationPort &&
                      this.state.request.lbMethod &&
                      this.state.request.monitorType
                      */


                      <Button type="primary" shape='round' onClick={() => this.validation()} >
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
            { this.props.certificatesError ? <Error component={'create loadbalancer'} error={[this.props.certificatesError]} visible={true} type={'certificatesError'} /> : null }
            { this.props.keysError ? <Error component={'create loadbalancer'} error={[this.props.keysError]} visible={true} type={'keysError'} /> : null }
            { this.props.routeDomainsError ? <Error component={'create loadbalancer'} error={[this.props.routeDomainsError]} visible={true} type={'routeDomainsError'} /> : null }

            { this.props.createL4ServiceError ? <Error component={'create loadbalancer'} error={[this.props.createL4ServiceError]} visible={true} type={'createL4ServiceError'} /> : null }
            { this.props.createL7ServiceError ? <Error component={'create loadbalancer'} error={[this.props.createL7ServiceError]} visible={true} type={'createL7ServiceError'} /> : null }
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