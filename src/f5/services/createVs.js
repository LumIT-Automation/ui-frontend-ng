import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

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
      existentNodes: [],
      snats: ['automap', 'none', 'snat'],
      lbMethods: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      monitorTypes: ['tcp-half-open', 'http', 'https'],

      serviceName: '',
      routeDomain: '',
      source: '0.0.0.0/0',
      snat: '',
      destination: '',
      destinationPort: '',
      lbMethod: '',
      monitorType: '',
      nodes: [{id:1}],
      errors: {},
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('PROPS', this.props)
    console.log('STATE', this.state)
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.main()
      }
    }
    if ( !this.state.nodes || this.state.nodes.length <= 0) {
      let list = [{id: 1}]
      this.setState({nodes: list})
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {
    try {
      await this.setState({routeDomainsLoading: true})
      let routeDomainsFetched = await this.dataGet('routedomains', this.props.partition)
      await this.setState({routeDomainsLoading: false})
      if (routeDomainsFetched.status && routeDomainsFetched.status !== 200 ) {
        let error = Object.assign(routeDomainsFetched, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'routeDomainsError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        await this.setState({routeDomains: routeDomainsFetched.data.items})
      }

      await this.setState({dataGroupsLoading: true})
      let dataGroupsCommon = await this.dataGet('datagroups', 'Common')
      await this.setState({dataGroupsLoading: false})
      if (dataGroupsCommon.status && dataGroupsCommon.status !== 200 ) {
        let error = Object.assign(dataGroupsCommon, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'dataGroupsError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        let list = dataGroupsCommon.data.items.filter(d => d.type === 'ip')
        await this.setState({dataGroupsTypeIp: list})
      }

      if (this.props.partition !== 'Common') {
        await this.setState({dataGroupsLoading: true})
        let dataGroupsPartition = await this.dataGet('datagroups', this.props.partition)
        await this.setState({dataGroupsLoading: false})
        if (dataGroupsPartition.status && dataGroupsPartition.status !== 200 ) {
          let error = Object.assign(dataGroupsPartition, {
            component: 'createVs',
            vendor: 'f5',
            errorType: 'dataGroupsError'
          })
          this.props.dispatch(err(error))
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

      await this.setState({nodesLoading: true})
      let nodesFetched = await this.dataGet('nodes', this.props.partition)
      await this.setState({nodesLoading: false})
      if (nodesFetched.status && nodesFetched.status !== 200 ) {
        let error = Object.assign(nodesFetched, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'nodesError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        await this.setState({existentNodes: nodesFetched.data.items})
      }


    }
    catch (error) {
      console.log(error)
    }
  }


  //FETCH
  dataGet = async (entity, partition) => {
    console.log(entity)
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
    if (entity === 'datagroups') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${partition}/datagroups/internal/`, this.props.token)
    }
    else if (entity === 'nodes') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${partition}/${entity}/`, this.props.token)
    }
    else {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${entity}/`, this.props.token)
    }
    return r
  }


  //SETTERS

  set = async (value, key) => {
    try {
      await this.setState({[key]: value})
    }
    catch (error) {
      console.log(error)
    }
    
    if (key === 'snat' && value !== 'snat') {
      await this.setState({dgChoices: [], dgName: null, code: '', snatPoolAddress: ''})
    }

    if (key === 'monitorType' && value === 'tcp-half-open') {
      await this.setState({monitorSendString: '', monitorReceiveString: ''})
    }

  }

  writeDrSet = async e => {
    await this.setState({dr: e})
  };

  dgNameSet = async e => {
    await this.setState({dgName: e})
    let irule = `when CLIENT_ACCEPTED {\n\tif {[findclass [IP::client_addr] ${this.state.dgName}] eq "" } {\n\tsnat none\n}\n}`
    await this.setState({code: irule})
  }

  codeSet = async e => {
    await this.setState({code: e.target.value})
  }

  nodeAdd = async () => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(nodes)
    await this.setState({nodes: list})
  }

  nodeRemove = async node => {
    console.log(node)
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(node, nodes)
    await this.setState({nodes: list})
  }


  
  nodeAddressSet = async (nodeId, e) => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].address = e.target.value

    await this.setState({nodes: nodes})
  }

  nodeNameSet = async (nodeId, e) => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))

    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].name = e.target.value

   await this.setState({nodes: nodes})
  }

  nodePortSet = async (nodeId, p) => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))
    let index = nodes.findIndex((obj => obj.id === nodeId))
    nodes[index].port = p.target.value

    await this.setState({nodes: nodes})
  }



  //VALIDATION
  validationCheck = async () => {
    let nodes = JSON.parse(JSON.stringify(this.state.nodes))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()


    if (!this.state.serviceName) {
      errors.serviceNameError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.serviceNameError
      this.setState({errors: errors})
    }

    if (!this.state.snat) {
      errors.snatError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.snatError
      this.setState({errors: errors})
    }

    if (this.state.snat === 'snat') {
      if (!this.state.snatPoolAddress || !validators.ipv4(this.state.snatPoolAddress)) {
        errors.snatPoolAddressError = true
        await this.setState({errors: errors})
      }
      else {
        delete errors.snatPoolAddressError
        this.setState({errors: errors})
      }

      try {
        let ips = []
        let list = []

        ips.push(this.state.destination)
        this.state.nodes.forEach((node, i) => {
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

        if (!this.state.code){
          errors.codeError = true
          this.setState({errors: errors})
        }
        else {
          delete errors.codeError
          this.setState({errors: errors})
        }
      }
    }

    if (!validators.ipv4(this.state.destination)) {
      errors.destinationError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.destinationError
      this.setState({errors: errors})
    }

    if (!validators.port(this.state.destinationPort)) {
      errors.destinationPortError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.destinationPortError
      this.setState({errors: errors})
    }

    if (!this.state.lbMethod) {
      errors.lbMethodError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.lbMethodError
      this.setState({errors: errors})
    }

    if (!this.state.monitorType) {
      errors.monitorTypeError = true
      await this.setState({errors: errors})
    } 
    else {
      delete errors.monitorTypeError
      this.setState({errors: errors})
    }

    if ((this.state.monitorType === 'http' || this.state.monitorType === 'https') && !this.state.monitorSendString) {
      errors.monitorSendStringError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.monitorSendStringError
      this.setState({errors: errors})
    }

    if ((this.state.monitorType === 'http' || this.state.monitorType === 'https') && !this.state.monitorReceiveString) {
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
    let serviceName = this.state.serviceName

    let b = {}
    b.data = {
      "virtualServer": {
        "name": `vs_${serviceName}`,
        "type": this.props.type,
        "snat": this.state.snat,
        "routeDomainId": this.state.routeDomain,
        "destination": `${this.state.destination}:${this.state.destinationPort}`,
        "mask": '255.255.255.255',
        "source": this.state.source
      },
      "profiles": [],
      "pool": {
        "name": `pool_${serviceName}`,
        "loadBalancingMode": this.state.lbMethod,
        "nodes": this.state.nodes
      },
      "monitor": {
        "name": `mon_${serviceName}`,
        "type": this.state.monitorType
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
      if (this.state.certificate && this.state.key) {
        b.data.profiles.push(
          {
            "name": `client-ssl_${serviceName}`,
            "type": "client-ssl",
            "certName": `cert_${serviceName}`,
            "cert": btoa(this.state.certificate),
            "keyName": `key_${serviceName}`,
            "key":  btoa(this.state.key),
            "chain": "",
            "chainName": "",
            "context": "clientside"
          }
        )
      }
    }

    if ((this.state.monitorType === 'http') || (this.state.monitorType === 'https')) {
      b.data.monitor.send = this.state.monitorSendString
      b.data.monitor.recv = this.state.monitorReceiveString
    }

    if (this.state.snat === 'snat') {
      b.data.snatPool = {
        "name": `snat_${serviceName}`,
        "members": [
          this.state.snatPoolAddress
        ]
      }
    }

    if (this.state.code) {
      if ( (this.state.code !== '') || (this.state.code !== undefined) ) {
        b.data.irules = [
          {
            "name": `irule_${serviceName}`,
            "code": this.state.code
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
        error = Object.assign(error, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'ServiceCreateError'
        })
        this.props.dispatch(err(error))
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
      dgChoices: null,
      dgName: null,
      dr: false,
      errors: {}
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'createVs') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }
    
    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              defaultValue={obj ? obj[key] : ''}
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => this.set(event.target.value, key)}
            />
          )

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={this.state[`${key}`]}
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

        case 'select':
          return (
            <Select
              value={this.state[`${key}`]}
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
                        disabled={(this.props.asset && this.props.asset.assetsDr && this.props.asset.assetsDr.length > 0) ? false : true}
                        checked={this.state.dr}
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

                    { this.state.snat === 'snat' ?
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

                    { (this.state.snat === 'snat' && this.state.dgChoices && this.state.dgChoices.length > 0) ?
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
                                value={this.state.code}
                                style={{width: '100%', border: `1px solid red`}}
                                name="code"
                                id='code'
                                onChange={e => this.codeSet(e)}
                              />
                            :
                              <TextArea
                                rows={5}
                                value={this.state.code}
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

                { ((this.state.monitorType === 'http') || (this.state.monitorType === 'https')) ?
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

                { this.state.nodes ?
                  this.state.nodes.map((n, i) => {

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
                          <Button type="danger" shape='round' onClick={() => this.nodeRemove(n)}>
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
                    <Button 
                      type="primary" 
                      shape='round'
                      disabled = {this.state.loading ? true : false} 
                      onClick={() => this.validation()} 
                    >
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

        {errors()}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
  dataGroups: state.f5.dataGroups,
}))(CreateF5Service);
