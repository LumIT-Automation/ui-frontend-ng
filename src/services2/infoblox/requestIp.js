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
    console.log('mount request')
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
    let tree = await this.fetchTree()
    this.setState({tree: tree})

    let realNetworks = await this.filterRealNetworks()
    this.setState({realNetworks: realNetworks})

  }

  fetchNetworksAndContainers = async () => {
    let networks = await this.fetchNetworks()
    let containers = await this.fetchContainers()

    this.filterRealNetsAndConts(networks, containers)
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

  filterRealNetworks = () => {
    let realNetworks = []
    let list = []

    this.state.tree.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          //let n = e.network.split('/')
          //n = n[0]
          let o = e
          realNetworks.push(o)
        }
      }
    })
    return realNetworks
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

  setNetwork = async (value, e) => {
    let errors = Object.assign({}, this.state.errors)
    let objectTypes = []
    let network = e.value
    let prefix = network.split('/')
    prefix = prefix[0]
    let subnetMask
    let gateway

    if (e) {
      const result = this.state.realNetworks.find( realNetwork => realNetwork.network === network )
      subnetMask = result.extattrs.Mask.value
      gateway = result.extattrs.Gateway.value

      if (result.children.length !== 0 ) {
        result.children.forEach( child => {
          if (child.extattrs && child.extattrs['Object Type'] ) {
            objectTypes.push(child.extattrs['Object Type'].value)
          }
        })
      }
      else {
        console.log('no children')
      }
      delete errors.networkError
      //this.setState({network: network, errors: errors})
    }
    else {
      errors.networkError = 'error'
    }
    this.setState({prefix: prefix, subnetMask: subnetMask, gateway: gateway, network: network, objectTypes: objectTypes, errors: errors})
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


  render() {

    const requests = [
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        render: (name, obj)  => (
          <Select id='network' style={{ width: '300px' }} onChange={(value, event) => this.setNetwork(value, event)}>
            { this.state.realNetworks ?
              this.state.realNetworks.map((n, i) => {
              return (
                <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
                )
              })
              :
              <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
            }
          </Select>
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
