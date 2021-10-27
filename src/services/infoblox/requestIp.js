import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import AssetSelector from './assetSelector'

import { Modal, Input, Button, Select, Spin, Divider, Table, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class RequestIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      counter: 1,
      requests: [],
      response: [],
      macAddress: '00:00:00:00:00:00',
    };
  }

  componentDidMount() {
    console.log('mount')
    let requests = Object.assign([], this.state.requests)
    requests.push({id:1, macAddress: '00:00:00:00:00:00'})
    this.setState({requests: requests})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('didupdate')
    if (this.state.requests && this.state.requests.length === 0) {
      let requests = Object.assign([], this.state.requests)
      requests.push({id:1, macAddress: '00:00:00:00:00:00'})
      this.setState({requests: requests})
    }
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
    this.setState({networkLoading: true})
    let networks = await this.fetchNetworks()
    let containers = await this.fetchContainers()
    let realNetworks = await this.realNet(networks)
    let realContainers = await this.realCont(containers)
    let real = realNetworks.concat(realContainers)
    this.setState({real: real, networkLoading: false, networks: networks, containers: containers})
  }

  fetchNetworks = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
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
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
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
    let n = this.state.counter + 1
    let r = {id: n, macAddress: '00:00:00:00:00:00'}
    let list = Object.assign([], this.state.requests)
    list.push(r)
    this.setState({requests: list, counter: n})
  }

  removeRequest = r => {
    let list = Object.assign([], this.state.requests)
    let newList = list.filter(n => {
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
        this.props.dispatch(setError(error))
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
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-container/${container}/`, this.props.token)
    return r
  }



  setNetwork = async (value, e, id) => {
    let errors = Object.assign({}, this.state.errors)
    let req = this.state.requests.find( r => r.id === id )
    this.setState({objectTypes: null})

    let objectTypes = []
    let network = e.value
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
        this.setState({objectTypes: unique})
      }
      else {
        this.setState({objectTypes: null})
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
    req.prefix = prefix
    req.subnetMask = subnetMask
    req.gateway = gateway
    req.network = network
    req.errors = errors
    //this.setState({prefix: prefix, subnetMask: subnetMask, gateway: gateway, network: network, errors: errors})
  }


  setObjectType = (e, id) => {
    let errors = Object.assign({}, this.state.errors)
    let req = this.state.requests.find( r => r.id === id )
    let objectType

    if (e) {
      objectType = e
      delete errors.objectTypeError
    }
    else {
      errors.objectTypeError = 'error'
    }
    req.objectType = objectType
    req.errors = errors
    //this.setState({objectType: objectType, errors: errors})
  }

  setServerName = (e, id) => {
    let errors = Object.assign({}, this.state.errors)
    let req = this.state.requests.find( r => r.id === id )
    let serverName

    if (e) {
      serverName = e.target.value
      delete errors.serverNameError
    }
    else {
      errors.serverNameError = 'error'
    }
    req.serverName = serverName
    req.errors = errors
    //this.setState({serverName: serverName, errors: errors})
  }

  setMacAddress = (m, id) => {
    let errors = Object.assign({}, this.state.errors)
    let req = this.state.requests.find( r => r.id === id )
    let mac = m.target.value

    const validMacAddressRegex = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    const macRegex = new RegExp(validMacAddressRegex);

    if (macRegex.test(mac)) {
      let macAddress = mac
      req.macAddress = macAddress
      delete errors.macAddressError
      //this.setState({macAddress: mac, errors: errors})
    }
    else {
      req.macAddress = ''
      errors.macAddressError = 'error'
    }
    req.errors = errors
  }

  setReference = (e, id) => {
    let errors = Object.assign({}, this.state.errors)
    let req = this.state.requests.find( r => r.id === id )
    let reference

    if (e) {
      reference = e.target.value
      delete errors.referenceError
    }
    else {
      errors.referenceError = 'error'
    }
    req.reference = reference
    req.errors = errors
    //this.setState({reference: reference, errors: errors})
  }


  sendRequests = async () => {
    this.setState({loading: true})
    let response = []

    for await (const req of this.state.requests) {
      try {
        const resp = await this.request(req)
        let res = await this.updateResponse(resp, req.id)
        response.push(res)
      } catch(resp) {
        console.log('errrrrrr')
        console.log(resp)
        return
      }
    }


    /*
    const promises = this.state.requests.map(async req => {
      const resp = await this.request(req)
      let res = await this.updateResponse(resp, req.id)
      return res
    })

    console.log(promises)
    const response = await Promise.all(promises)
    */
    console.log(response)
    this.setState({response: response, loading: false, success: true})
  }

  request = async r => {
    let re

    this.setState({message: null});

      let b = {
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

    let rest = new Rest(
      "POST",
      resp => {
        re = resp
      },
      error => {
        re = error
        this.setState({loading: false, success: false})
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4s/?next-available`, this.props.token, b )
    return re
  }

  updateResponse = async (resp, id) => {

    if (resp.data && resp.data[0].result) {
      let str = resp.data[0].result
      let st = str.split(':')
      let s = st[1]
      let ip = s.split('/')
      ip = ip[0]

      let req = this.state.requests.find( r => r.id === id )
      req.ip = ip
      return req
    }
    else {
      let req = this.state.requests.find( r => r.id === id )
      req.ip = 'no ip'
      return req
    }

    //response.push(req)
    //this.setState({response: response})
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
    console.log(this.state.requests)
    const requests = [
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        render: (name, obj)  => (
          <React.Fragment>
          { this.state.networkLoading ?
              <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
              :
              <React.Fragment>
                <Select key={obj.id} style={{ width: '300px' }} onChange={(value, event) => this.setNetwork(value, event, obj.id)}>
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
          <Select key={obj.id} style={{ width: '100%' }} onChange={e => this.setObjectType(e, obj.id)}>
            { this.state.objectTypes ?
              this.state.objectTypes.map((n, i) => {
              return (
                <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })
              :
              <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
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
          <Input id='serverName' style={{ width: '150px' }} onChange={e => this.setServerName(e, obj.id)} />
        ),
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'macAddress',
        key: 'macAddress',
        render: (name, obj)  => (
          <Input id='macAddress' defaultValue={'00:00:00:00:00:00'} style={{ width: '150px' }} onChange={e => this.setMacAddress(e, obj.id)} />
        ),
      },
      {
        title: 'Reference',
        align: 'center',
        dataIndex: 'reference',
        key: 'reference',
        render: (name, obj)  => (
          <Input id='reference' style={{ width: '150px' }} onChange={e => this.setReference(e, obj.id)} />
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
    const columns = [
      {
        title: 'IP address',
        align: 'center',
        dataIndex: 'ip',
        key: 'ip',
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
      },
      {
        title: 'Mac Address',
        align: 'center',
        dataIndex: 'macAddress',
        key: 'macAddress',
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
            { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !this.state.loading && this.state.success  ?
              <Table
                columns={columns}
                dataSource={this.state.response}
                bordered
                rowKey="ip"
                pagination={false}
                style={{marginBottom: 10}}
              />

              :

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
                  pagination={false}
                  style={{marginBottom: 10}}
                />
                <Button type="primary" style={{float: "right"}} onClick={() => this.sendRequests()}>
                  Request Ip
                </Button>
            </React.Fragment>
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
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  asset: state.infoblox.asset,
}))(RequestIp);
