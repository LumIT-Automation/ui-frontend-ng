import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/infobloxError"

import {
  ipDetailError,
  networksError,
  containersError,
  networkError,
  containerError,
  nextAvailableIpError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Space, Modal, Input, Button, Select, Spin, Divider, Table, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const netLoadIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />



class RequestIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      counter: 1,
      requests: [],
      response: [],
      macAddress: '00:00:00:00:00:00',
      macAddress2: '00:00:00:00:00:00',
    };
  }

  componentDidMount() {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    requests.push({id:1, macAddress: '00:00:00:00:00:00'})
    this.setState({requests: requests})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible === true){
      if (this.state.requests && this.state.requests.length === 0) {
        let requests = JSON.parse(JSON.stringify(this.state.requests))
        requests.push({id:1, macAddress: '00:00:00:00:00:00'})
        this.setState({requests: requests})
      }
      if (this.props.asset && (this.props.asset !== prevProps.asset) ) {
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
    this.setState({networkLoading: true})
    let networks = await this.fetchNetworks()
    let containers = await this.fetchContainers()
    let real, realNetworks, realContainers

    if (networks) {
      realNetworks = await this.realNet(networks)
    }
    if (containers) {
      realContainers = await this.realCont(containers)
    }

    if (networks && containers) {
      real = realNetworks.concat(realContainers)
    }

    if (real) {
      this.setState({real: real, networkLoading: false, networks: networks, containers: containers})
    }

  }

  fetchNetworks = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        this.props.dispatch(networksError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/networks/`, this.props.token)
    return r
  }

  fetchContainers = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        this.props.dispatch(containersError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-containers/`, this.props.token)
    return r
  }

  realNet = items => {
    let list = []

    items.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let o = e
          list.push(o)
        }
      }
    })
    return list
  }

  realCont = items => {
    let list = []

    items.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let o = e
          o.isContainer = true
          list.push(o)
        }
      }
    })
    return list
  }

  setRequests = () => {
    //let n = this.state.counter + 1
    let id = 0
    let n = 0
    this.state.requests.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n, macAddress: '00:00:00:00:00:00', objectTypes: null}
    let list = JSON.parse(JSON.stringify(this.state.requests))
    list.push(r)
    this.setState({requests: list})
  }

  removeRequest = r => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let newList = requests.filter(n => {
      return r.id !== n.id
    })
    this.setState({requests: newList})
  }


  fetchNetwork = async network => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data[0]
      },
      error => {
        this.props.dispatch(networkError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network/${network}/`, this.props.token)
    return r
  }

  fetchContainer = async container => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data[0]
      },
      error => {
        this.props.dispatch(containerError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-container/${container}/`, this.props.token)
    return r
  }


  setNetwork = async (network, e, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    this.setState({objectTypes: null})

    let objectTypes = []
    let prefix = network.split('/')
    prefix = prefix[0]
    let subnetMask
    let gateway

    if (e) {
      const result = this.state.real.find( real => real.network === network )
      if (result.isContainer) {
        this.state.networks.forEach((item, i) => {
          if (item.network_container === network ) {
            if (item.extattrs && item.extattrs['Object Type'] ) {
              objectTypes.push(item.extattrs['Object Type'].value)
            }
          }
        })
        let unique = objectTypes.filter((v, i, a) => a.indexOf(v) === i);
        //this.setState({objectTypes: unique})
        request.objectTypes = unique
      }
      else {
        //this.setState({objectTypes: null})
        request.objectTypes = null
      }
      let info = await this.fetchNetwork(prefix)

      if (info && info.extattrs) {
        if (info.extattrs.Mask) {
          subnetMask = info.extattrs.Mask.value
        }
        if (info.extattrs.Gateway) {
          gateway = info.extattrs.Gateway.value
        }
      }
      delete errors.networkError
    }
    else {
      errors.networkError = 'error'
    }
    request.prefix = prefix
    request.subnetMask = subnetMask
    request.gateway = gateway
    request.network = network
    request.errors = errors
    //this.setState({prefix: prefix, subnetMask: subnetMask, gateway: gateway, network: network, errors: errors})
  }

  setObjectType = async (e, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let objectType

    if (e) {
      objectType = e
      delete errors.objectTypeError
    }
    else {
      errors.objectTypeError = 'error'
    }
    request.objectType = objectType
    request.errors = errors
    if (objectType === 'Heartbeat') {
      request.macAddress2 = '00:00:00:00:00:00'
    }
    this.setState({errors: errors})
  }

  setServerName = (e, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let serverName

    if (e) {
      serverName = e.target.value
      delete errors.serverNameError
    }
    else {
      errors.serverNameError = 'error'
    }
    request.serverName = serverName
    request.errors = errors
    //this.setState({serverName: serverName, errors: errors})
  }

  setServerName2 = (e, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let serverName

    if (e) {
      serverName = e.target.value
      delete errors.serverName2Error
    }
    else {
      errors.serverName2Error = 'error'
    }
    request.serverName2 = serverName
    request.errors = errors
    //this.setState({serverName: serverName, errors: errors})
  }

  setMacAddress = (m, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let mac = m.target.value

    const validMacAddressRegex = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    const macRegex = new RegExp(validMacAddressRegex);

    if (macRegex.test(mac)) {
      let macAddress = mac
      request.macAddress = macAddress
      delete errors.macAddressError
      //this.setState({macAddress: mac, errors: errors})
    }
    else {
      request.macAddress = ''
      errors.macAddressError = 'error'
    }
    request.errors = errors
  }

  setMacAddress2 = (m, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let mac = m.target.value

    const validMacAddressRegex = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    const macRegex = new RegExp(validMacAddressRegex);

    if (macRegex.test(mac)) {
      let macAddress = mac
      request.macAddress2 = macAddress
      delete errors.macAddress2Error
      //this.setState({macAddress: mac, errors: errors})
    }
    else {
      request.macAddress2 = ''
      errors.macAddress2Error = 'error'
    }
    request.errors = errors
  }

  setReference = (e, id) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = this.state.requests.find( r => r.id === id )
    let reference

    if (e) {
      reference = e.target.value
      delete errors.referenceError
    }
    else {
      errors.referenceError = 'error'
    }
    request.reference = reference
    request.errors = errors
    //this.setState({reference: reference, errors: errors})
  }


  sendRequests = async () => {
    this.setState({loading: true})
    let response = []

    for await (const request of this.state.requests) {
      request.isLoading = true
        this.setState({foo: true})
      try {
        const resp = await this.nextAvailableIp(request)
        let res = await this.updateResponse(resp, request.id)
        request.isLoading = false
        this.setState({foo: false})
        response.push(res)
      } catch(resp) {
        request.isLoading = false
        this.setState({foo: false})
      }
    }


    this.setState({response: response, loading: false})
  }

  nextAvailableIp = async r => {
    let re
    let b

    if (r.objectType !== 'Heartbeat') {
      b = {
        "data": {
          "network": `${r.prefix}`,
          "object_type": `${r.objectType}`,
          "number": 1,
          "mac": [
              `${r.macAddress}`
          ],
          "extattrs": [
            {
              "Name Server": {
                  "value": `${r.serverName}`
              },
              "Reference": {
                  "value": `${r.reference}`
              }
            }
          ]
        }
      }
    }
    else {
      b = {
        "data": {
          "network": `${r.prefix}`,
          "object_type": `${r.objectType}`,
          "number": 2,
          "mac": [
              `${r.macAddress}`, `${r.macAddress2}`
          ],
          "extattrs": [
            {
              "Name Server": {
                  "value": `${r.serverName}`
              },
              "Reference": {
                  "value": `${r.reference}`
              }
            },
            {
              "Name Server": {
                  "value": `${r.serverName2}`
              },
              "Reference": {
                  "value": `${r.reference}`
              }
            },
          ]
        }
      }
    }

    let rest = new Rest(
      "POST",
      resp => {
        re = resp
      },
      error => {
        this.props.dispatch(nextAvailableIpError(error))
        re = error
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4s/?next-available`, this.props.token, b )
    return re
  }

  updateResponse = async (resp, id) => {

    if (resp.data && resp.data.length > 0) {
      let ips = []

      resp.data.forEach(result => {

        let str = result.result
        let st = str.split(':')
        let s = st[1]
        let ip = s.split('/')
        ip = ip[0]

        ips.push({ip: ip})

      })

      let request = this.state.requests.find( r => r.id === id )
      let res = Object.assign({}, request)
      res.ips = ips
      return res
    }
    else {
      let request = this.state.requests.find( r => r.id === id )
      let res = Object.assign({}, request)
      res.ips = ['no ip']
      return res
    }

    //response.push(request)
    //this.setState({response: response})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      objectTypes: null,
      requests: [],
      response: [],
      errors: []
    })
  }


/*

<React.Fragment>
</React.Fragment>

*/

  render() {
    const requests = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        name: 'dable',
        description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
      },
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        render: (name, obj)  => (
          <React.Fragment>
          { this.state.networkLoading ?
              <Spin indicator={netLoadIcon} style={{margin: 'auto auto'}}/>
              :
              <React.Fragment>
                <Select
                  showSearch
                  defaultValue={obj.network}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  key={obj.id}
                  style={{ width: '300px' }}
                  onChange={(value, event) => this.setNetwork(value, event, obj.id)}>
                  { this.state.real ?
                    this.state.real.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
                      )
                    })
                    :
                    null
                  }
                </Select>
              </React.Fragment>
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Object Type',
        align: 'center',
        dataIndex: 'objectType',
        key: 'objectType',
        render: (name, obj)  => (
          <Select defaultValue={obj.objectType} key={obj.id} style={{ width: '100%' }} onChange={e => this.setObjectType(e, obj.id)}>
            <Select.Option key={'-'} value={null}>-</Select.Option>
            { obj.objectTypes ?
              obj.objectTypes.map((n, i) => {
              return (
                <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })
              :
              null
            }
          </Select>
        ),
      },
      {
        title: 'Server Name',
        align: 'center',
        dataIndex: 'serverName',
        key: 'serverName',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.objectType === 'Heartbeat') ?
          <React.Fragment>
            <Input placeholder={obj.serverName} id='snHeartbeat1' style={{ width: '150px' }} onChange={e => this.setServerName(e, obj.id)} />
            <Divider/>
            <Input placeholder={obj.serverName} id='snHeartbeat2' style={{ width: '150px' }} onChange={e => this.setServerName2(e, obj.id)} />
          </React.Fragment>
            :
            <Input placeholder={obj.serverName} id='serverName' style={{ width: '150px' }} onChange={e => this.setServerName(e, obj.id)} />
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'macAddress',
        key: 'macAddress',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.objectType === 'Heartbeat') ?
          <React.Fragment>
            <Input defaultValue={obj.macAddress} id='macAddress' style={{ width: '150px' }} onChange={e => this.setMacAddress(e, obj.id)} />
            <Divider/>
            <Input defaultValue={obj.macAddress2} id='macAddress' style={{ width: '150px', margitnTop: '10px' }} onChange={e => this.setMacAddress2(e, obj.id)} />
          </React.Fragment>
            :
            <Input defaultValue={obj.macAddress} id='macAddress' style={{ width: '150px' }} onChange={e => this.setMacAddress(e, obj.id)} />
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Reference',
        align: 'center',
        dataIndex: 'reference',
        key: 'reference',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.objectType === 'Heartbeat') ?
            <Input placeholder={obj.reference} id='reference' style={{ width: '150px' }} onChange={e => this.setReference(e, obj.id)} />
            :
            <Input placeholder={obj.reference} id='reference' style={{ width: '150px' }} onChange={e => this.setReference(e, obj.id)} />
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Remove request',
        align: 'center',
        dataIndex: 'remove',
        key: 'remove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.removeRequest(obj)}>
            -
          </Button>
        ),
      },
    ]

    const response = [
      {
        title: 'IP address',
        align: 'center',
        dataIndex: ['ips', 'ip'],
        key: 'ip',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.ips.length > 1) ?
            obj.ips.map((ip, i) => {
            return (
              <React.Fragment>
                {ip.ip}
                <br/>
              </React.Fragment>
            )
            })
            :
            <React.Fragment>
              {obj.ips[0].ip}
            </React.Fragment>
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
      },
      {
        title: 'subnet Mask',
        align: 'center',
        dataIndex: 'subnetMask',
        key: 'subnetMask',
      },
      {
        title: 'Gateway',
        align: 'center',
        dataIndex: 'gateway',
        key: 'gateway',
      },
      {
        title: 'Server Name',
        align: 'center',
        dataIndex: 'serverName',
        key: 'serverName',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.ips.length > 1) ?
              <React.Fragment>
                {obj.serverName}
                <br/>
                {obj.serverName2}
              </React.Fragment>
            :
            <React.Fragment>
              {obj.serverName}
            </React.Fragment>
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Mac Address',
        align: 'center',
        dataIndex: 'macAddress',
        key: 'macAddress',
        render: (name, obj)  => (
          <React.Fragment>
          { (obj.ips.length > 1) ?
              <React.Fragment>
                {obj.macAddress}
                <br/>
                {obj.macAddress2}
              </React.Fragment>
            :
            <React.Fragment>
              {obj.macAddress}
            </React.Fragment>
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Object Type',
        align: 'center',
        dataIndex: 'objectType',
        key: 'objectType',
      },
    ];


    return (
      <React.Fragment>
        <Button type="primary" onClick={() => this.details()}>REQUEST IP</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>REQUEST IP</p>}
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

          { ( this.props.asset && this.props.asset.id ) ?
            <React.Fragment>
              <React.Fragment>
                <Button type="primary" onClick={() => this.setRequests()}>
                  +
                </Button>
                <br/>
                <br/>
                <Table
                  columns={requests}
                  dataSource={this.state.requests}
                  bordered
                  rowKey="id"
                  scroll={{x: 'auto'}}
                  pagination={false}
                  style={{marginBottom: 10}}
                />
                <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => this.sendRequests()}>
                  Request Ip
                </Button>
                <br/>
              </React.Fragment>
              { this.state.response.length !== 0  ?
                <React.Fragment>
                  <Divider/>
                  <Table
                    columns={response}
                    dataSource={this.state.response}
                    bordered
                    rowKey="id"
                    scroll={{x: 'auto'}}
                    pagination={false}
                    style={{marginBottom: 10}}
                  />
                </React.Fragment>
              :
                null
              }
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.networksError ? <Error component={'ipRequest'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
            { this.props.containersError ? <Error component={'ipRequest'} error={[this.props.containersError]} visible={true} type={'containersError'} /> : null }
            { this.props.networkError ? <Error component={'ipRequest'} error={[this.props.networkError]} visible={true} type={'networkError'} /> : null }
            { this.props.containerError ? <Error component={'ipRequest'} error={[this.props.containerError]} visible={true} type={'containerError'} /> : null }
            { this.props.nextAvailableIpError ? <Error component={'ipRequest'} error={[this.props.nextAvailableIpError]} visible={true} type={'nextAvailableIpError'} /> : null }
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
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  asset: state.infoblox.asset,

  networksError: state.infoblox.networksError,
  containersError: state.infoblox.containersError,

  networkError: state.infoblox.networkError,
  containerError: state.infoblox.containerError,
  nextAvailableIpError: state.infoblox.nextAvailableIpError,
}))(RequestIp);
