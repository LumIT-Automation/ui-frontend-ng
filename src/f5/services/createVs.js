import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  //routeDomains,
  routeDomainsError,

  dataGroupsError,

  l4ServiceCreateError,
  l7ServiceCreateError
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class CreateF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dr: false,
      routeDomains: [],
      snats: ['automap', 'none', 'snat'],
      lbMethods: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      monitorTypes: ['tcp-half-open', 'http', 'https'],
      request: {
        serviceName: '',
        snat: '',
        destination: '',
        destinationPort: '',
        lbMethod: '',
        monitorType: ''
      },
      errors: {},
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
    console.log(routeDomainsFetched)
    await this.setState({routeDomainsLoading: false})
    if (routeDomainsFetched.status && routeDomainsFetched.status !== 200 ) {
      this.props.dispatch(routeDomainsError(routeDomainsFetched))
      return
    }
    else {
      await this.setState({routeDomains: routeDomainsFetched.data.items})
      //this.props.dispatch(routeDomains( routeDomainsFetched ))
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

  set = async (value, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = value
    await this.setState({request: request})

    if (key === 'snat' && value !== 'snat') {
      request = JSON.parse(JSON.stringify(this.state.request))
      delete request.code
      delete request.snatPoolAddress
      await this.setState({dgChoices: [], dgName: null, request: request})
    }

    if (key === 'monitorType' && value === 'tcp-half-open') {
      request = JSON.parse(JSON.stringify(this.state.request))
      delete request.monitorSendString
      delete request.monitorReceiveString
      await this.setState({request: request})
    }

  }

  writeDrSet = async e => {
    await this.setState({dr: e})
  };

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

  nodeAdd = async () => {
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

      await this.setState({request: request})
    }
  }

  nodeRemove = async r => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let list = nodes.filter(n => {
      return r !== n.id
    })

    request.nodes = list
    await this.setState({request: request})
  }

  nodeAddressSet = async (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].address = e.target.value

    request.nodes = nodes
    await this.setState({request: request})
  }

  nodeNameSet = async (nodeId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].name = e.target.value

    request.nodes = nodes
    await this.setState({request: request})
  }

  nodePortSet = async (nodeId, p) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].port = p.target.value

    request.nodes = nodes
    await this.setState({request: request})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let nodes = JSON.parse(JSON.stringify(this.state.request.nodes))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    for (const [key, value] of Object.entries(request)) {
      console.log(key)
      console.log(value)
      if (key === 'nodes' || key === 'source' || key === 'routeDomain') {
        continue
      }
      else {
        if (value !== '') {
          if (key === 'destination' && !validators.ipv4(request.destination)) {
            errors[`${key}Error`] = true
            this.setState({errors: errors})
          }
          else if (key === 'destinationPort' && !validators.port(request.destinationPort)) {
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
      this.createService()
    }
  }


  //DISPOSAL ACTION
  createService = async () => {
    let serviceName = this.state.request.serviceName

    let b = {}
    b.data = {
      "virtualServer": {
        "name": `vs_${serviceName}`,
        "type": this.props.type,
        "snat": this.state.request.snat,
        "routeDomainId": this.state.request.routeDomain,
        "destination": `${this.state.request.destination}:${this.state.request.destinationPort}`,
        "mask": '255.255.255.255',
        "source": this.state.request.source
      },
      "profiles": [],
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

    if (this.props.type === 'L4') {
      b.data.profiles.push(
        {
          "name": `fastl4_${serviceName}`,
          "type": "fastl4",
          "idleTimeout": 300
        }
      )
    }
    else if (this.props.type === 'L7') {
      b.data.profiles.push(
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
        }
      )
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

    let url = `f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`

    if (this.state.dr) {
      url = `f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/?drReplica=1`
    }

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
    await rest.doXHR(url, this.props.token, b )
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
    console.log(this.state.request)
    console.log(this.state.errors)

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => this.set(event.target.value, key)}
              onPressEnter={() => this.validation(action)}
            />
          )
          break;

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={this.state.request[`${key}`]}
              onChange={event => this.set(event.target.value, key)}
              style=
              { this.state.errors[`${key}Error`] ?
                {borderColor: `red`}
              :
                {}
              }
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
              { choices === 'routeDomains' ?
                this.state.routeDomains.map((r,i) => {
                  return (
                    <Select.Option key={i} value={r.id}>{r.name}</Select.Option>
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

        <Button type="primary" onClick={() => this.details()}>{this.props.type} CREATE</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.type} CREATE</p>}
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
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('input', 'serviceName')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={8} span={6}>
                      <Checkbox
                        onChange={e => this.writeDrSet(e.target.checked)}
                        disabled={(this.props.asset.assetsDr && this.props.asset.assetsDr.length > 0) ? false : true}
                        value={this.state.dr}
                      >
                        Write in dr
                      </Checkbox>
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Route Domain (optional):</p>
                    </Col>
                    <Col span={8}>
                      { this.state.routeDomainsLoading ?
                        <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                      :
                        <Col span={24}>
                          {createElement('select', 'routeDomain', 'routeDomains')}
                        </Col>
                      }
                    </Col>
                  </Row>
                  <br/>

                  <React.Fragment>
                    <Row>
                      <Col offset={6} span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat:</p>
                      </Col>
                      <Col span={8}>
                        {createElement('select', 'snat', 'snats')}
                      </Col>
                    </Row>
                    <br/>

                    { this.state.request.snat === 'snat' ?
                      <React.Fragment>
                        <Row>
                          <Col offset={6} span={3}>
                            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snatpool address:</p>
                          </Col>
                          <Col span={7}>
                            {createElement('input', 'snatPoolAddress')}
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

                  </React.Fragment>

                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination IP:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('input', 'destination')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination Port:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('input', 'destinationPort')}
                    </Col>
                  </Row>
                  <br/>

                  {this.props.type === 'L7' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={5} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Certificate (optional):</p>
                        </Col>
                        <Col span={8}>
                          {createElement('textArea', 'certificate')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={6} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key (optional):</p>
                        </Col>
                        <Col span={8}>
                          {createElement('textArea', 'key')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }


                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Load Balancing Methods:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('select', 'lbMethod', 'lbMethods')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('select', 'monitorType', 'monitorTypes')}
                    </Col>
                  </Row>
                  <br/>

                { ((this.state.request.monitorType === 'http') || (this.state.request.monitorType === 'https')) ?
                  <React.Fragment>
                    <br/>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor send string:</p>
                      </Col>
                      <Col span={7}>
                        {createElement('textArea', 'monitorSendString')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor receive string:</p>
                      </Col>
                      <Col span={7}>
                        {createElement('textArea', 'monitorReceiveString')}
                      </Col>
                    </Row>
                    <br/>

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
                        <Col offset={6} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                        </Col>
                        <Col span={8}>
                          { this.state.errors[n.id] && this.state.errors[n.id].addressError ?
                            <Input
                              key={i}
                              defaultValue={n.address}
                              style={{display: 'block', borderColor: 'red'}}
                              onChange={e => this.nodeAddressSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.address}
                              style={{display: 'block'}}
                              onChange={e => this.nodeAddressSet(n.id, e)}
                            />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={6} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                        </Col>
                        <Col span={8}>
                          { this.state.errors[n.id] && this.state.errors[n.id].nameError ?
                            <Input
                              key={i}
                              defaultValue={n.name}
                              style={{display: 'block', borderColor: 'red'}}
                              onChange={e => this.nodeNameSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.name}
                              style={{display: 'block'}}
                              onChange={e => this.nodeNameSet(n.id, e)}
                            />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col offset={6} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                        </Col>
                        <Col span={8}>
                          { this.state.errors[n.id] && this.state.errors[n.id].portError ?
                            <Input
                              key={i}
                              defaultValue={n.port}
                              style={{display: 'block', borderColor: 'red'}}
                              onChange={e => this.nodePortSet(n.id, e)}
                            />
                          :
                            <Input
                              key={i}
                              defaultValue={n.port}
                              style={{display: 'block'}}
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
                      Create {this.props.type} Load Balancer
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
            { this.props.l7ServiceCreateError ? <Error component={'create loadbalancer'} error={[this.props.l7ServiceCreateError]} visible={true} type={'l7ServiceCreateError'} /> : null }
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
  dataGroups: state.f5.dataGroups,

  routeDomainsError: state.f5.routeDomainsError,
  dataGroupsError: state.f5.dataGroupsError,
  l4ServiceCreateError: state.f5.l4ServiceCreateError,
  l7ServiceCreateError: state.f5.l7ServiceCreateError,
}))(CreateF5Service);
