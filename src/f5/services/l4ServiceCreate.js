import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  routeDomains,
  routeDomainsError,

  dataGroupsError,

  l4ServiceCreateError,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class CreateF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      lbMethods: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      monitorTypes: ['tcp-half-open', 'http', 'https'],
      request: {}
    };
  }

  componentDidMount() {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let list = []
    list.push({id: 1})
    request.nodes = list
    request.routeDomain = ''
    request.source = '0.0.0.0/0'
    this.setState({request: request})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    let request = JSON.parse(JSON.stringify(this.state.request))
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.main()
      }
    }
    if ( (this.state.request && !this.state.request.nodes) || this.state.request.nodes.length <= 0) {
      let list = []
      list.push({id: 1})
      request.nodes = list
      this.setState({request: request})
    }
    if (!('routeDomain' in request)) {
      request.routeDomain = ''
      this.setState({request: request})
    }
    if (!('source' in request)) {
      request.source = '0.0.0.0/0'
      this.setState({request: request})
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {
    await this.setState({routeDomainsLoading: true})
    let routeDomainsFetched = await this.routeDomainsFetch()
    await this.setState({routeDomainsLoading: false})
    if (routeDomainsFetched.status && routeDomainsFetched.status !== 200 ) {
      this.props.dispatch(routeDomainsError(routeDomainsFetched))
      return
    }
    else {
      this.props.dispatch(routeDomains( routeDomainsFetched ))
    }

    await this.setState({dataGroupsLoading: true})
    let dataGroupsCommon = await this.dataGroupsFetch('Common')
    await this.setState({dataGroupsLoading: false})
    if (dataGroupsCommon.status && dataGroupsCommon.status !== 200 ) {
      this.props.dispatch(dataGroupsError(dataGroupsCommon))
      return
    }
    else {
      let list = dataGroupsCommon.data.items.filter(d => d.type === 'ip')
      await this.setState({dataGroupsTypeIp: list})
    }


    if (this.props.partition !== 'Common') {
      await this.setState({dataGroupsLoading: true})
      let dataGroupsPartition = await this.dataGroupsFetch(this.props.partition)
      await this.setState({dataGroupsLoading: false})
      if (dataGroupsPartition.status && dataGroupsPartition.status !== 200 ) {
        this.props.dispatch(dataGroupsError(dataGroupsPartition))
        return
      }
      else {
        let list = dataGroupsPartition.data.items.filter(d => d.type === 'ip')
        let dgCommon = JSON.parse(JSON.stringify(this.state.dataGroupsTypeIp))
        list.forEach((item, i) => {
          dgCommon.push(item)
        });
        await this.setState({dataGroupsTypeIp: dgCommon})
      }
    }
  }


  //FETCH
  routeDomainsFetch = async () => {
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

  dataGroupsFetch = async partition => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${partition}/datagroups/internal/`, this.props.token)
    return r
  }


  //SETTERS
  serviceNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serviceName = e.target.value
    this.setState({request: request})
  }

  routeDomainSet = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.routeDomain = id.toString()
    this.setState({request: request})
  }

  snatSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.snat = e
    await this.setState({request: request})
    if (e !== 'snat') {
      request = JSON.parse(JSON.stringify(this.state.request))
      delete request.code
      delete request.snatPoolAddress
      await this.setState({dgChoices: [], dgName: null, request: request})
    }
  }

  snatPoolAddressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.snatPoolAddress = e.target.value
    this.setState({request: request})
  }

  dgNameSet = async e => {
    await this.setState({dgName: e})
    let irule = `when CLIENT_ACCEPTED {\n\tif {[findclass [IP::client_addr] ${this.state.dgName}] eq "" } {\n\tsnat none\n}\n}`
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.code = irule
    await this.setState({request: request})
  }

  codeSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    if (e.target.value === '') {
      delete request.code
    }
    else {
      request.code = e.target.value
    }
    await this.setState({request: request})
  }

  lbMethodSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.lbMethod = e
    this.setState({request: request})
  }

  destinationSet = async e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.destination = e.target.value
    await this.setState({request: request})
  }

  destinationPortSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.destinationPort = e.target.value
    this.setState({request: request})
  }

  monitorTypeSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorType = e
    this.setState({request: request})
  }

  monitorSendStringSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorSendString = e.target.value
    this.setState({request: request})
  }

  monitorReceiveStringSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.monitorReceiveString = e.target.value
    this.setState({request: request})
  }

  nodeAdd = () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = request.nodes
    let id = 0
    let n = 0

    if (nodes) {
      nodes.forEach(node => {
        if (node.id > id) {
          id = node.id
        }
      });
      n = id + 1

      let node = {id: n}
      nodes.push(node)
      request.nodes = nodes

      this.setState({request: request})
    }
  }

  nodeRemove = r => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let list = nodes.filter(n => {
      return r !== n.id
    })

    request.nodes = list

    this.setState({request: request})
  }

  nodeAddressSet = (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].address = e.target.value

    request.nodes = nodes
    this.setState({request: request})
  }

  nodeNameSet = (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].name = e.target.value

    request.nodes = nodes
    this.setState({request: request})
  }

  nodePortSet = (nodeId, p) => {
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

    if (!request.serviceName) {
      errors.serviceNameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.serviceNameError
      this.setState({errors: errors})
    }

    if (!request.snat) {
      errors.snatError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.snatError
      this.setState({errors: errors})
    }

    if (request.snat && request.snat === 'snat') {
      if (!request.snatPoolAddress || !validators.ipv4(request.snatPoolAddress)) {
        errors.snatPoolAddressError = true
        this.setState({errors: errors})
      }
      else {
        delete errors.snatPoolAddressError
        this.setState({errors: errors})
      }

      try {
        let ips = []
        let list = []

        ips.push(this.state.request.destination)
        this.state.request.nodes.forEach((node, i) => {
          ips.push(node.address)
        })

        this.state.dataGroupsTypeIp.forEach((dg, i) => {
          dg.records.forEach((record, i) => {
            if (record.name) {
              if (validators.ipInSubnet(record.name, ips)) {
                list.push(dg.name)
              }
            }
          });
        })
        await this.setState({dgChoices: list})
      }
      catch (error) {
        console.log(error)
      }

      if (this.state.dgChoices && this.state.dgChoices.length > 0) {
        if (!this.state.dgName) {
          errors.dgNameError = true
          this.setState({errors: errors})
        }
        else {
          delete errors.dgNameError
          this.setState({errors: errors})
        }

        if (!this.state.request.code){
          errors.codeError = true
          this.setState({errors: errors})
        }
        else {
          delete errors.codeError
          this.setState({errors: errors})
        }
      }
    }


    if (!request.destination || !validators.ipv4(request.destination)) {
      errors.destinationError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.destinationError
      this.setState({errors: errors})
    }

    if (!request.destinationPort || !validators.port(request.destinationPort)) {
      errors.destinationPortError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.destinationPortError
      this.setState({errors: errors})
    }

    if (!request.lbMethod) {
      errors.lbMethodError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.lbMethodError
      this.setState({errors: errors})
    }

    if (!request.monitorType) {
      errors.monitorTypeError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorTypeError
      this.setState({errors: errors})
    }

    if ((request.monitorType === 'http' || request.monitorType === 'https') && !request.monitorSendString) {
      errors.monitorSendStringError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorSendStringError
      this.setState({errors: errors})
    }

    if ((request.monitorType === 'http' || request.monitorType === 'https') && !request.monitorReceiveString) {
      errors.monitorReceiveStringError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorReceiveStringError
      this.setState({errors: errors})
    }

    if (nodes.length > 0) {
      nodes.forEach((node, i) => {
        errors[node.id] = {}

        if (node.address && validators.ipv4(node.address)) {
          delete errors[node.id].addressError
          this.setState({errors: errors})
        }
        else {
          errors[node.id].addressError = true
          this.setState({errors: errors})
        }

        if (!node.name) {
          errors[node.id].nameError = true
          this.setState({errors: errors})
        }
        else {
          delete errors[node.id].nameError
          this.setState({errors: errors})
        }

        if (node.port && validators.port(node.port) ) {
          delete errors[node.id].portError
          this.setState({errors: errors})
        }
        else {
          errors[node.id].portError = true
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
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.l4ServiceCreate()
    }
  }


  //DISPOSAL ACTION
  l4ServiceCreate = async () => {
    let serviceName = this.state.request.serviceName

    let b = {}
    b.data = {
      "virtualServer": {
        "name": `vs_${serviceName}`,
        "type": 'L4',
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

    if ((this.state.request.monitorType === 'http') || (this.state.request.monitorType === 'https')) {
      b.data.monitor.send = this.state.request.monitorSendString
      b.data.monitor.recv = this.state.request.monitorReceiveString
    }

    if (this.state.request.snat === 'snat') {
      b.data.snatPool = {
        "name": `snat_${serviceName}`,
        "members": [
          this.state.request.snatPoolAddress
        ]
      }
    }

    if (this.state.request.code) {
      if ( (this.state.request.code !== '') || (this.state.request.code !== undefined) ) {
        b.data.irules = [
          {
            "name": `irule_${serviceName}`,
            "code": this.state.request.code
          }
        ]
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
        this.props.dispatch(l4ServiceCreateError(error))
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
      dgChoices: null,
      dgName: null,
      errors: {}
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>L4 CREATE</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>L4 CREATE</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='f5'/>

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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                  </Col>
                  <Col span={16}>
                    {this.state.errors.serviceNameError ?
                      <Input style={{width: 450, borderColor: 'red'}} name="serviceName" id='serviceName' onChange={e => this.serviceNameSet(e)} />
                    :
                      <Input defaultValue={this.state.request.serviceName} style={{width: 450}} name="serviceName" id='serviceName' onChange={e => this.serviceNameSet(e)} />
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


              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat:</p>
                  </Col>
                  <Col span={16}>
                    <React.Fragment>
                      {this.state.errors.snatError ?
                        <Select
                          defaultValue={this.state.request.snat}
                          value={this.state.request.snat}
                          showSearch
                          style={{width: 450, border: `1px solid red`}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.snatSet(n)}
                        >
                          <React.Fragment>
                            <Select.Option key={'none'} value={'none'}>none</Select.Option>
                            <Select.Option key={'automap'} value={'automap'}>automap</Select.Option>
                            <Select.Option key={'snat'} value={'snat'}>snat</Select.Option>
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
                          onSelect={n => this.snatSet(n)}
                        >
                          <React.Fragment>
                            <Select.Option key={'none'} value={'none'}>none</Select.Option>
                            <Select.Option key={'automap'} value={'automap'}>automap</Select.Option>
                            <Select.Option key={'snat'} value={'snat'}>snat</Select.Option>
                          </React.Fragment>
                        </Select>
                      }
                    </React.Fragment>
                  </Col>
                </Row>
                <br/>

                { this.state.request.snat === 'snat' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snatpool address:</p>
                      </Col>
                      <Col span={6}>
                        <React.Fragment>
                          {this.state.errors.snatPoolAddressError ?
                            <Input
                              style={{width: '100%', borderColor: 'red'}}
                              value={this.state.request.snatPoolAddress}
                              onChange={e => this.snatPoolAddressSet(e)}
                            />
                          :
                            <Input
                              style={{width: '100%'}}
                              value={this.state.request.snatPoolAddress}
                              onChange={e => this.snatPoolAddressSet(e)}
                            />
                          }
                          <br/>
                        </React.Fragment>
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                { (this.state.request.snat === 'snat' && this.state.dgChoices && this.state.dgChoices.length > 0) ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snatpool Datagroup:</p>
                      </Col>

                      <Col span={6}>
                      { this.state.errors.dgNameError ?
                        <React.Fragment>
                          <Select
                            value={this.state.dgName}
                            showSearch
                            style={{width: '100%', border: `1px solid red`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.dgNameSet(n)}
                          >
                            <React.Fragment>
                              {this.state.dgChoices.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                          <br/>
                        </React.Fragment>
                      :
                        <React.Fragment>
                          <Select
                            value={this.state.dgName}
                            showSearch
                            style={{width: '100%'}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.dgNameSet(n)}
                          >
                            <React.Fragment>
                              {this.state.dgChoices.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                          <br/>
                        </React.Fragment>
                      }
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat irule:</p>
                      </Col>
                      <Col span={6}>
                        { this.state.errors.codeError ?
                          <TextArea
                            rows={5}
                            value={this.state.request.code}
                            style={{width: '100%', border: `1px solid red`}}
                            name="code"
                            id='code'
                            onChange={e => this.codeSet(e)}
                          />
                        :
                          <TextArea
                            rows={5}
                            value={this.state.request.code}
                            style={{width: '100%'}}
                            name="code"
                            id='code'
                            onChange={e => this.codeSet(e)}
                          />
                        }
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                { /*this.props.configuration && this.props.configuration[0] && this.props.configuration[0].key === 'iruleHide' && this.props.configuration[0].value ?
                  null
                :
                  <React.Fragment>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>irule (optional):</p>
                      </Col>
                      <Col span={16}>
                        <TextArea
                          rows={5}
                          defaultValue={this.state.request.code}
                          value={this.state.request.code}
                          style={{width: 450}}
                          name="code"
                          id='code'
                          onChange={e => this.codeSet(e)}
                        />
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                */}

              </React.Fragment>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination IP:</p>
                  </Col>
                  <Col span={16}>
                  {this.state.errors.destinationError ?
                    <Input style={{width: 450, borderColor: 'red'}} name="destination" id='destination' onChange={e => this.destinationSet(e)} />
                  :
                    <Input defaultValue={this.state.request.destination} style={{width: 450}} name="destination" id='destination' onChange={e => this.destinationSet(e)} />
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
                    <Input
                      style={{width: 450, borderColor: 'red'}}
                      value={this.state.request.destinationPort}
                      onChange={e => this.destinationPortSet(e)}
                    />
                  :
                    <Input
                      style={{width: 450}}
                      value={this.state.request.destinationPort}
                      onChange={e => this.destinationPortSet(e)}
                    />
                  }
                  </Col>
                </Row>
                <br/>

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
                              style={{width: 450, border: `1px solid red`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.lbMethodSet(n)}
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
                              onSelect={n => this.lbMethodSet(n)}
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

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.monitorTypesLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                      <React.Fragment>
                        { this.state.monitorTypes && this.state.monitorTypes.length > 0 ?
                          <React.Fragment>
                            {this.state.errors.monitorTypeError ?
                              <Select
                                defaultValue={this.state.request.monitorType}
                                value={this.state.request.monitorType}
                                showSearch
                                style={{width: 450, border: `1px solid red`}}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                filterSort={(optionA, optionB) =>
                                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                }
                                onSelect={n => this.monitorTypeSet(n)}
                              >
                                <React.Fragment>
                                  {this.state.monitorTypes.map((n, i) => {
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
                                onSelect={n => this.monitorTypeSet(n)}
                              >
                                <React.Fragment>
                                  {this.state.monitorTypes.map((n, i) => {
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

                { ((this.state.request.monitorType === 'http') || (this.state.request.monitorType === 'https')) ?
                  <React.Fragment>
                    <br/>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor send string:</p>
                      </Col>
                      <Col span={16}>
                      {this.state.errors.monitorSendStringError ?
                        <Input.TextArea style={{width: 450, borderColor: 'red' }} name="monitorSendString" id='monitorSendString' onChange={e => this.monitorSendStringSet(e)} />
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorSendString} style={{width: 450}} name="monitorSendString" id='monitorSendString' onChange={e => this.monitorSendStringSet(e)} />
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
                        <Input.TextArea style={{width: 450, borderColor: 'red'}} name="monitorReceiveString" id='monitorReceiveString' onChange={e => this.monitorReceiveStringSet(e)} />
                      :
                        <Input.TextArea defaultValue={this.state.request.monitorReceiveString} style={{width: 450}} name="monitorReceiveString" id='monitorReceiveString' onChange={e => this.monitorReceiveStringSet(e)} />
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
                    <Button type="primary" shape='round' onClick={() => this.nodeAdd()}>
                      +
                    </Button>
                  </Col>
                </Row>
                <br/>

                { this.state.request.nodes ?
                  this.state.request.nodes.map((n, i) => {

                  return (
                    <React.Fragment>
                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                        </Col>
                        <Col span={16}>
                          { this.state.errors[n.id] && this.state.errors[n.id].addressError ?
                            <Input
                              key={i}
                              defaultValue={n.address}
                              style={{display: 'block', width: 450, borderColor: 'red'}}
                              onChange={e => this.nodeAddressSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.address}
                              style={{display: 'block', width: 450}}
                              onChange={e => this.nodeAddressSet(n.id, e)}
                            />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                        </Col>
                        <Col span={16}>
                          { this.state.errors[n.id] && this.state.errors[n.id].nameError ?
                            <Input
                              key={i}
                              defaultValue={n.name}
                              style={{display: 'block', width: 450, borderColor: 'red'}}
                              onChange={e => this.nodeNameSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.name}
                              style={{display: 'block', width: 450}}
                              onChange={e => this.nodeNameSet(n.id, e)}
                            />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                        </Col>
                        <Col span={16}>
                          { this.state.errors[n.id] && this.state.errors[n.id].portError ?
                            <Input
                              key={i}
                              defaultValue={n.port}
                              style={{display: 'block', width: 450, borderColor: 'red'}}
                              onChange={e => this.nodePortSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.port}
                              style={{display: 'block', width: 450}}
                              onChange={e => this.nodePortSet(n.id, e)}
                            />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={2} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove node:</p>
                        </Col>
                        <Col span={16}>
                          <Button type="danger" shape='round' onClick={() => this.nodeRemove(n.id)}>
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
                    <Button type="primary" shape='round' onClick={() => this.validation()} >
                      Create Load Balancer
                    </Button>
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
            { this.props.routeDomainsError ? <Error component={'create loadbalancer'} error={[this.props.routeDomainsError]} visible={true} type={'routeDomainsError'} /> : null }
            { this.props.dataGroupsError ? <Error component={'create loadbalancer'} error={[this.props.dataGroupsError]} visible={true} type={'dataGroupsError'} /> : null }
            { this.props.l4ServiceCreateError ? <Error component={'create loadbalancer'} error={[this.props.l4ServiceCreateError]} visible={true} type={'l4ServiceCreateError'} /> : null }
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

  configuration: state.f5.configuration,

  asset: state.f5.asset,
  partition: state.f5.partition,
  routeDomains: state.f5.routeDomains,
  dataGroups: state.f5.dataGroups,

  routeDomainsError: state.f5.routeDomainsError,
  dataGroupsError: state.f5.dataGroupsError,
  l4ServiceCreateError: state.f5.l4ServiceCreateError,
}))(CreateF5Service);
