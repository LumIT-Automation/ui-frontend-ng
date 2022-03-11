import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  networksError,
  containersError,
  networkError,
  containerError,
  nextAvailableIpError,
} from '../store.infoblox'

import AssetSelector from '../assetSelector'

import { Space, Modal, Input, Button, Select, Spin, Divider, Table, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const netLoadIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />
const responseIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
    let networks = await this.networksGet()
    let containers = await this.containersGet()
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

  networksGet = async () => {
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

  containersGet = async () => {
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


  //SETTER
  requestAdd = () => {
    //let n = this.state.counter + 1
    let id = 0
    let n = 0
    this.state.requests.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n, macAddress: '00:00:00:00:00:00'}
    let list = JSON.parse(JSON.stringify(this.state.requests))
    list.push(r)
    this.setState({requests: list})
  }

  requestRemove = r => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let newList = requests.filter(n => {
      return r.id !== n.id
    })
    this.setState({requests: newList})
  }


  networkGet = async network => {
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

  conatinerGet = async container => {
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
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-container/${container}/networks/`, this.props.token)
    return r
  }




  setNetworkManager = async (network, e, id) => {
    let reset = await this.reset(id)
    if (reset) {
      this.setNetwork(network, id)
    }
  }

  reset = async (id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    delete request.objectType
    request.objectTypesLoading = true
    request.blocked = false
    this.setState({blocked: true, requests: requests, objectTypes: []})
    return request
  }

  setNetwork = async (network, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )

    let objectTypes = []
    let prefix = network.split('/')
    prefix = prefix[0]
    let subnetMask
    let gateway

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
      request.objectTypesLoading = false
    }
    else {
      //this.setState({objectTypes: null})
      delete request.objectTypes
      request.objectTypesLoading = false
    }
    let info = await this.networkGet(prefix)

    if (info && info.extattrs) {
      if (info.extattrs.Mask) {
        subnetMask = info.extattrs.Mask.value
      }
      if (info.extattrs.Gateway) {
        gateway = info.extattrs.Gateway.value
      }
    }
    delete request.networkError
    delete request.networkColor

    request.prefix = prefix
    request.subnetMask = subnetMask
    request.gateway = gateway
    request.network = network
    delete request.blocked
    this.setState({requests: requests, blocked: false})
  }

  setObjectType = async (objectType, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.objectType = objectType
    delete request.objectTypeError
    delete request.objectTypeColor

    if (objectType === 'Heartbeat') {
      request.macAddress2 = '00:00:00:00:00:00'
      request.serverName2 = ''
    }
    else {
      delete request.macAddress2
      delete request.serverName2
    }
    this.setState({requests: requests})
  }

  setServerName = (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.serverName = e.target.value
    delete request.serverNameError
    delete request.serverNameColor
    this.setState({requests: requests})
  }

  setServerName2 = (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.serverName2 = e.target.value
    delete request.serverName2Error
    delete request.serverName2Color
    this.setState({requests: requests})
  }

  setMacAddress = (m, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.macAddress = m.target.value
    delete request.macAddressError
    delete request.macAddressColor
    this.setState({requests: requests})
  }

  setMacAddress2 = (m, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.macAddress2 = m.target.value
    delete request.macAddress2Error
    delete request.macAddress2Color
    this.setState({requests: requests})
  }



  //validation

  validation = async () => {
    let valid = await this.validationCheck()
    if (valid) {
      this.sendRequests()
    }
  }

  validationCheck = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let validators = new Validators()
    let ok = true

    requests.forEach((request, i) => {
      if (!request.network) {
        request.networkError = 'error'
        request.networkColor = 'red'
        ok = false
      }
      if (!request.objectType) {
        request.objectTypeError = 'error'
        request.objectTypeColor = 'red'
        ok = false
      }
      if (!request.serverName) {
        request.serverNameError = 'error'
        request.serverNameColor = 'red'
        ok = false
      }
      if (!validators.macAddress(request.macAddress)) {
        request.macAddressError = 'error'
        request.macAddressColor = 'red'
        ok = false
      }
      if (request.objectType === 'Heartbeat') {
        if (!request.serverName2) {
          request.serverName2Error = 'error'
          request.serverName2Color = 'red'
          ok = false
        }
        if (!validators.macAddress(request.macAddress2)) {
          request.macAddress2Error = 'error'
          request.macAddress2Color = 'red'
          ok = false
        }
      }
    })

    this.setState({requests: requests})
    return ok
  }

  sendRequests = async () => {
    this.setState({loading: true, response: false, responseLoading: true})
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
    this.setState({response: response, loading: false, responseLoading: false})
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
              }
            },
            {
              "Name Server": {
                  "value": `${r.serverName2}`
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
        description: '',
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
                { this.state.blocked && !obj.blocked ?
                  <Select defaultValue={obj.network} style={{ width: '300px'}} disabled/>
                :
                  <React.Fragment>
                  {obj.networkError ?
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
                      style={{ width: '300px', border: `1px solid ${obj.networkColor}` }}
                      onChange={(value, event) => this.setNetworkManager(value, event, obj.id)}>
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
                    :
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
                      onChange={(value, event) => this.setNetworkManager(value, event, obj.id)}>
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
                  }
                  </React.Fragment>
                }
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
          <React.Fragment>
            {obj.objectTypesLoading ?
              <Spin indicator={netLoadIcon} style={{margin: 'auto auto'}}/>
            :
            <React.Fragment>
              {!obj.network ?
                <Select style={{ width: '100%'}} disabled/>
              :
                <React.Fragment>
                  {obj.objectTypeError ?
                    <Select defaultValue={obj.objectType} key={obj.id} style={{ width: '100%', border: `1px solid ${obj.objectTypeColor}` }} onChange={e => this.setObjectType(e, obj.id)}>
                      { obj.objectTypes ?
                        obj.objectTypes.map((n, i) => {
                        return (
                          <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        :
                        <Select.Option key={'-'} value={'-'}>-</Select.Option>
                      }
                    </Select>
                  :
                    <Select defaultValue={obj.objectType} key={obj.id} style={{ width: '100%' }} onChange={e => this.setObjectType(e, obj.id)}>
                      { obj.objectTypes ?
                        obj.objectTypes.map((n, i) => {
                        return (
                          <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        :
                        <Select.Option key={'-'} value={'-'}>-</Select.Option>
                      }
                    </Select>
                  }
                </React.Fragment>
              }
            </React.Fragment>
            }
          </React.Fragment>
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
                {obj.serverNameError ?
                  <Input placeholder={obj.serverName} style={{ width: '150px', borderColor: obj.serverNameColor }} onChange={e => this.setServerName(e, obj.id)} />
                :
                  <Input placeholder={obj.serverName} style={{ width: '150px' }} onChange={e => this.setServerName(e, obj.id)} />
                }
                <Divider/>
                {obj.serverName2Error ?
                  <Input placeholder={obj.serverName2} style={{ width: '150px', borderColor: obj.serverName2Color }} onChange={e => this.setServerName2(e, obj.id)} />
                :
                  <Input placeholder={obj.serverName2} style={{ width: '150px' }} onChange={e => this.setServerName2(e, obj.id)} />
                }
              </React.Fragment>
            :
              <React.Fragment>
                {obj.serverNameError ?
                  <Input placeholder={obj.serverName} style={{ width: '150px', borderColor: obj.serverNameColor }} onChange={e => this.setServerName(e, obj.id)} />
                :
                  <Input placeholder={obj.serverName} style={{ width: '150px' }} onChange={e => this.setServerName(e, obj.id)} />
                }
              </React.Fragment>
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
              {obj.macAddressError ?
                <Input defaultValue={obj.macAddress} style={{ width: '150px', borderColor: obj.macAddressColor }} onChange={e => this.setMacAddress(e, obj.id)} />
              :
                <Input defaultValue={obj.macAddress} style={{ width: '150px' }} onChange={e => this.setMacAddress(e, obj.id)} />
              }
              <Divider/>
              {obj.macAddress2Error ?
                <Input defaultValue={obj.macAddress2} style={{ width: '150px', borderColor: obj.macAddress2Color }} onChange={e => this.setMacAddress2(e, obj.id)} />
              :
                <Input defaultValue={obj.macAddress2} style={{ width: '150px' }} onChange={e => this.setMacAddress2(e, obj.id)} />
              }
            </React.Fragment>
          :
            <React.Fragment>
              {obj.macAddressError ?
                <Input defaultValue={obj.macAddress} style={{ width: '150px', borderColor: obj.macAddressColor }} onChange={e => this.setMacAddress(e, obj.id)} />
              :
                <Input defaultValue={obj.macAddress} style={{ width: '150px' }} onChange={e => this.setMacAddress(e, obj.id)} />
              }
            </React.Fragment>
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
          <Button type="danger" onClick={() => this.requestRemove(obj)}>
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
                <Button type="primary" onClick={() => this.requestAdd()}>
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
                <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => this.validation()}>
                  Request Ip
                </Button>
                <br/>
              </React.Fragment>
              { this.state.response.length !== 0  ?
                <React.Fragment>
                  {this.state.responseLoading ?
                    <Spin indicator={responseIcon} style={{margin: '10% 45%'}}/>
                  :
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
                  }
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
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  asset: state.infoblox.asset,

  networksError: state.infoblox.networksError,
  containersError: state.infoblox.containersError,

  networkError: state.infoblox.networkError,
  containerError: state.infoblox.containerError,
  nextAvailableIpError: state.infoblox.nextAvailableIpError,
}))(RequestIp);
