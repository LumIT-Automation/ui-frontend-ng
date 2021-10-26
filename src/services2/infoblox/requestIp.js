import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'



import { Space, Modal, Form, Input, Result, Button, Select, Spin, Divider, Table, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



/*

*/

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
}

class RequestIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      counter: 0,
      requests: [],
      macAddress: '00:00:00:00:00:00',
      ipInfo: [],
      body: {

      }
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (this.props.asset !== prevProps.asset) {
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
    //let tree = await this.fetchTree()
    //
    //this.setState({tree: tree})

    let networks = await this.fetchNetworks()


    let containers = await this.fetchContainers()


    let realNetworks = await this.realNet(networks)
    let realContainers = await this.realCont(containers)



    let real = realNetworks.concat(realContainers)


    this.setState({real: real, networkLoading: false, networks: networks, containers: containers})
    //this.setState({realNetworks: realNetworks})

  }


  fetchNetworks = async () => {
    //this.props.dispatch(setNetworksLoading(true))
    let r
    let rest = new Rest(
      "GET",
      resp => {
        //this.props.dispatch(setNetworks(resp))
        r = resp.data
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/networks/`, this.props.token)
    return r
    //this.props.dispatch(setNetworksLoading(false))
  }

  fetchContainers = async () => {
    //this.props.dispatch(setNetworksLoading(true))
    let r
    let rest = new Rest(
      "GET",
      resp => {
        //this.props.dispatch(setNetworks(resp))
        r = resp.data
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-containers/`, this.props.token)
    return r
    //this.props.dispatch(setNetworksLoading(false))
  }

  fetchTree = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data['/'].children
      },
      error => {
        this.setState({error: error, ipLoading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/tree/`, this.props.token)
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
    let r = {id: n}
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
      console.log('fetchnetwork')
      console.log(network)
      let r
      let rest = new Rest(
        "GET",
        resp => {
          //this.props.dispatch(setNetworks(resp))
          r = resp.data[0]
        },
        error => {
          this.props.dispatch(setError(error))
        }
      )
      await rest.doXHR(`infoblox/${this.props.asset.id}/network/${network}/`, this.props.token)
      return r
      //this.props.dispatch(setNetworksLoading(false))
    }

    fetchContainer = async container => {
      console.log('fetchcontainer')
      console.log(container)
      //this.props.dispatch(setNetworksLoading(true))
      let r
      let rest = new Rest(
        "GET",
        resp => {
          //this.props.dispatch(setNetworks(resp))
          console.log(resp.data)
          r = resp.data[0]
        },
        error => {
          this.props.dispatch(setError(error))
        }
      )
      await rest.doXHR(`infoblox/${this.props.asset.id}/network-container/${container}/`, this.props.token)
      return r
      //this.props.dispatch(setNetworksLoading(false))
    }



  setNetwork = async (value, e) => {
    let errors = Object.assign({}, this.state.errors)
    let objectTypes = []
    let network = e.value
    let prefix = network.split('/')
    prefix = prefix[0]
    let subnetMask
    let gateway

    if (e) {
      const result = this.state.real.find( real => real.network === network )
      console.log(result)
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
      console.log(info)

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
    this.setState({prefix: prefix, subnetMask: subnetMask, gateway: gateway, network: network, errors: errors})
  }


  setObjectType = e => {
    let errors = Object.assign({}, this.state.errors)
    let objectType

    if (e) {
      objectType = e
      delete errors.objectTypeError
    }
    else {
      errors.objectTypeError = 'error'
    }
    this.setState({objectType: objectType, errors: errors})
  }

  setNumber = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.number = e.target.value
      delete errors.numberError
    }
    else {
      errors.numberError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setServerName = e => {
    let errors = Object.assign({}, this.state.errors)
    let serverName

    if (e) {
      serverName = e.target.value
      delete errors.serverNameError
    }
    else {
      errors.serverNameError = 'error'
    }
    this.setState({serverName: serverName, errors: errors})
  }

  setMacAddress = m => {
    let errors = Object.assign({}, this.state.errors);
    let mac = m.target.value

    const validMacAddressRegex = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    const macRegex = new RegExp(validMacAddressRegex);

    if (macRegex.test(mac)) {
      delete errors.macAddressError
      this.setState({macAddress: mac, errors: errors})
    }
    else {
      errors.macAddressError = 'error'
      this.setState({errors: errors})
    }
  }

  setReference = e => {
    let reference
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      reference = e.target.value
      delete errors.referenceError
    }
    else {
      errors.referenceError = 'error'
    }
    this.setState({reference: reference, errors: errors})
  }



  requestIp = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    this.setState({message: null});

      let b = {
        "data": {
          "network": `${this.state.prefix}`,
          "object_type": `${this.state.objectType}`,
          "number": 1,
          "mac": [
              `${this.state.macAddress}`
          ],
          "extattrs": [
            {
              "Name Server": {
                  "value": `${this.state.serverName}`
              },
              "Reference": {
                  "value": `${this.state.reference}`
              }
            }
          ]
        }
      }
    //}

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        //fixedaddress/ZG5zLmZpeGVkX2FkZHJlc3MkMTAuOC4xLjEwMC4wLi4:10.8.1.100/default
        let str = resp.data[0].result
        let st = str.split(':')
        let s = st[1]
        let ip = s.split('/')
        ip = ip[0]

        let o = {
          ip: ip,
          network: this.state.network,
          subnetMask: this.state.subnetMask,
          gateway: this.state.gateway,
          serverName: this.state.serverName,
          macAddress: this.state.macAddress,
          objectType: this.state.objectType
        }
        let list = []
        list.push(o)

        this.setState({ipInfo: list, loading: false, success: true})
        //this.success()
      },
      error => {
        this.setState({loading: false, success: false})
        //this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4s/?next-available`, this.props.token, b )

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
    })
  }


/*

<React.Fragment>
</React.Fragment>

*/

  render() {

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
                <Select id='network' style={{ width: '300px' }} onChange={(value, event) => this.setNetwork(value, event)}>
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
          <Select id='network' style={{ width: '100%' }} onChange={e => this.setObjectType(e)}>
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
          <Input id='serverName' s style={{ width: '150px' }} onChange={e => this.setServerName(e)} />
        ),
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'macAddress',
        key: 'macAddress',
        render: (name, obj)  => (
          <Input id='macAddress' style={{ width: '150px' }} onChange={e => this.setMacAddress(e)} />
        ),
      },
      {
        title: 'Reference',
        align: 'center',
        dataIndex: 'reference',
        key: 'reference',
        render: (name, obj)  => (
          <Input id='reference' style={{ width: '150px' }} onChange={e => this.setReference(e)} />
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
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center', padding: 24}}>

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




          { ( this.props.asset && this.props.asset.id ) ?
            <React.Fragment>
            { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !this.state.loading && this.state.success &&
              <Table
                columns={columns}
                dataSource={this.state.ipInfo}
                bordered
                rowKey="ip"
                pagination={false}
                style={{marginBottom: 10}}
              />
            }

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
            <Button type="primary" style={{float: "right"}} onClick={() => this.requestIp()}>
              Request Ip
            </Button>
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

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
