import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { Space, Form, Input, Result, Button, Select, Spin, Divider, TextArea, Table } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { setWorkflowStatus } from '../_store/store.workflows'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
      macAddress: '00:00:00:00:00:00',
      ipInfo: [],
      body: {

      }
    };
  }

  componentDidMount() {
    //this.fetchNetworksAndContainers()
    this.main()

  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
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
        //console.log(resp.data['/'].children)
        r = resp.data['/'].children
        //console.log(tree)
        //this.setState({tree: tree})
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

/*
  fetchNetworks = async network => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        this.setState({error: error, ipLoading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/networks/`, this.props.token)
    return r
  }

  fetchContainers = async network => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        this.setState({error: error, ipLoading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-containers/`, this.props.token)
    return r
  }

  filterRealNetsAndConts = (nets, conts) => {
    this.setState({responseNetworks: nets})
    this.setState({responseContainers: conts})
    let realNets = []
    let realConts = []
    console.log(nets)
    console.log(conts)


    nets.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let n = e.network.split('/')
          n = n[0]
          let o = {ele: e, type: 'network'}
          realNets.push(o)
        }
      }
    })

    conts.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let n = e.network.split('/')
          n = n[0]
          let o = {ele: e, type: 'container'}
          realConts.push(o)
        }
      }
    })

    console.log(realNets)
    console.log(realConts)


    let net = realNets.concat(realConts)
    this.setState({realNets: realNets})
    this.setState({realConts: realConts})
    this.setState({realNetsAndConts: net})
  }
*/
  /*
  {
    "data": {
        "network": "10.8.0.0",
        "object_type": "Server",
        "number": 1,
        "mac": [
            "00:00:00:00:00:00"
        ],
        "extattrs": {
            "Name Server": {
                "value": "Server"
            },
            "Reference": {
                "value": "LumIT S.p.A."
            }
        }
    }
}
  */

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
/*
    if (this.state.body.type === 'container') {
      console.log(this.state.body.type)
      let b = {
        "data": {
          "network": `${this.state.body.network}`,
          "object_type": `${this.state.body.objectType}`,
          "number": `${this.state.body.number}`,
          "mac": [
              "00:00:00:00:00:00"
          ],
          "extattrs": {
              "Name Server": {
                  "value": `${this.state.body.serverName}`
              },
              "Reference": {
                  "value": `${this.state.body.reference}`
              }
          }
        }
      }
      console.log(b)
    }
    else if (this.state.body.type === 'network') {*/
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
        console.log(resp)
        //console.log(resp.data)
        //fixedaddress/ZG5zLmZpeGVkX2FkZHJlc3MkMTAuOC4xLjEwMC4wLi4:10.8.1.100/default
        let str = resp.data[0].result
        let st = str.split(':')
        let s = st[1]
        let ip = s.split('/')
        ip = ip[0]
        console.log(ip)

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
        //this.setState({error: error})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4s/?next-available`, this.props.token, b )

  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    this.props.dispatch(setWorkflowStatus( 'created' ))
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
    console.log(this.state)

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

      { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
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
      { !this.state.loading && !this.state.success &&
        <Form
          {...layout}
          name="basic"
          initialValues={{

          }}
          onFinish={null}
          onFinishFailed={null}
        >

          <Form.Item
            label="Network"
            name='network'
            key="network"
            validateStatus={this.state.errors.networkError}
            help={this.state.errors.networkError ? 'Please select a valid network' : null }
          >
          <Select id='network' onChange={(value, event) => this.setNetwork(value, event)}>
          { this.state.realNetworks ?
            this.state.realNetworks.map((n, i) => {
            return (
              <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
              )
            })
            :
            null
          }
          </Select>
          </Form.Item>

            <Form.Item
              label="Object Type"
              name='objectType'
              key="objectType"
              validateStatus={this.state.errors.objectTypeError}
              help={this.state.errors.objectTypeError ? 'Please input a valid object Type' : null }
            >
              <Select id='network' onChange={e => this.setObjectType(e)}>
              { this.state.objectTypes ?
                this.state.objectTypes.map((n, i) => {
                return (
                  <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
                :
                null
              }
              </Select>
            </Form.Item>

          <Form.Item
            label="Server Name"
            name='serverName'
            key="serverName"
            validateStatus={this.state.errors.serverNameError}
            help={this.state.errors.serverNameError ? 'Please input a valid object Type' : null }
          >
            <Input id='serverName' onChange={e => this.setServerName(e)} />
          </Form.Item>

          <Form.Item
            label="Mac Address"
            name='macAddress'
            key="macAddress"
            validateStatus={this.state.errors.macAddressError}
            help={this.state.errors.macAddressError ? 'Please input a valid object Type' : null }
          >
            <Input id='macAddress' onChange={e => this.setMacAddress(e)} />
          </Form.Item>



          <Form.Item
            label="Reference"
            name='reference'
            key="reference"
            validateStatus={this.state.errors.referenceError}
            help={this.state.errors.referenceError ? 'Please input a valid object Type' : null }
          >
            <Input id='reference' onChange={e => this.setReference(e)} />
          </Form.Item>

          <Form.Item
            wrapperCol={ {offset: 8 }}
            name="button"
            key="button"
          >
            <Button type="primary" onClick={() => this.requestIp()}>
              Request Ip
            </Button>
          </Form.Item>

        </Form>
      }

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,
}))(RequestIp);
