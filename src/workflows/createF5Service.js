import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { setCertificatesList, setKeysList } from '../_store/store.f5'

import { Space, Form, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { setWorkflowStatus } from '../_store/store.workflows'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
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

class CreateF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      nodesNumber: 0,
      nodes: [],
      body: {
        service: 'F5 - Create Service',
        source: "0.0.0.0/0",
        nodes: []
      }
    };
  }

  componentDidMount() {
    this.fetchCertificates()
    this.fetchKeys()
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

  fetchCertificates = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setCertificatesList( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/certificates/`, this.props.token)
  }

  fetchKeys = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setKeysList( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
  }

  setServiceType = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.serviceType = e
      delete errors.serviceTypeError
    }
    else {
      errors.serviceTypeError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setServiceName = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.serviceName = e.target.value
      delete errors.serviceNameError
    }
    else {
      errors.serviceNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setSnat = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.snat = e
      delete errors.snatError
    }
    else {
      errors.snatError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setDestination = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    const regex = new RegExp();

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      body.destination = ipv4
      delete errors.destinationError
    }
    else {
      errors.destinationError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setDestinationPort = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPortError = 'error'
    }
    else {
      body.destinationPort = e.target.value
      delete errors.destinationPortError
    }
    this.setState({body: body, errors: errors})
  }

  setCertificateName = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.certificateName = e
      delete errors.certificateNameError
    }
    else {
      errors.certificateNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setKeyName = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.keyName = e
      delete errors.keyNameError
    }
    else {
      errors.keyNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setDestinationPoolPort = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.destinationPoolPortError = 'error'
    }
    else {
      body.destinationPoolPort = e.target.value
      delete errors.destinationPoolPortError
    }
    this.setState({body: body, errors: errors})
  }

  setLbMethod = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'round-robin':
        body.lbMethod = 'round-robin'
        delete errors.lbMethodError
        break
      case 'least-connections-member':
        body.lbMethod = 'least-connections-member'
        delete errors.lbMethodError
        break
      case 'observed-member':
        body.lbMethod = 'observed-member'
        delete errors.lbMethodError
        break
      case 'predictive-member':
        body.lbMethod = 'predictive-member'
        delete errors.lbMethodError
        break
      default:
        errors.lbMethodError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setMonitorType = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'tcp-half-open':
        body.monitorType = 'tcp-half-open'
        delete errors.monitorTypeError
        break
      case '25':

        break
      case '26':

        break
      default:
        errors.monitorTypeError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  oneMoreNode = () => {
    let nodesNumber = this.state.nodesNumber
    let nodes = this.state.nodes
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    nodesNumber = nodesNumber + 1
    nodes.push({id: nodesNumber})
    delete errors.nodesNumberError
    this.setState({nodesNumber: nodesNumber, errors: errors, body: body})
  }


  setNodeAddress = (nodeId, e) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);
    const regex = new RegExp();

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      let index = nodes.findIndex((obj => obj.id == nodeId))
      nodes[index].address = ipv4
      delete errors.nodeAddressError
    }
    else {
      errors.nodeAddressError = 'error'
    }
    this.setState({nodes: nodes, errors: errors})
  }

  setNodeName = (nodeId, e) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);
    const regex = new RegExp();

    const name = e.target.value

    if (name) {
      let index = nodes.findIndex((obj => obj.id == nodeId))
      nodes[index].name = name
      delete errors.nodeNameError
    }
    else {
      errors.nodeNameError = 'error'
    }
    this.setState({nodes: nodes, errors: errors})
  }

  removeNode = (nodeId) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);

    if (nodeId) {
      let index = nodes.findIndex((obj => obj.id == nodeId))
      nodes.splice(index, 1)
      delete errors.nodesError
    }
    else {
      errors.nodesError = 'error'
    }
    this.setState({nodes: nodes, errors: errors})
  }

  removeNodesId = () => {
    let list = Object.assign([], this.state.nodes);
    let body = Object.assign([], this.state.body);
    let newList = []

    list.forEach((item, i) => {
      newList.push({name: item.name, address: item.address})
    })

    body.nodes = newList

    if (this.state.body.serviceType === 'L4') {
      this.setState({body: body}, () => this.createL4Service())
    } else if (this.state.body.serviceType === 'L7') {
      this.setState({body: body}, () => this.createL7Service())
    }
  }


  createL4Service = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    let serviceName = this.state.body.serviceName

    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.body.serviceType,
          "snat": this.state.body.snat,
          "destination": `${this.state.body.destination}:${this.state.body.destinationPort}`,
          "mask": '255.255.255.255',
          "source": this.state.body.source
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
            "port": this.state.body.destinationPoolPort,
            "loadBalancingMode": this.state.body.lbMethod
        },
        "monitor": {
            "name": `${this.state.body.monitorType}_${serviceName}`,
            "type": this.state.body.monitorType
        },
        "nodes": this.state.body.nodes
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, success: true})
        this.success()
      },
      error => {
        console.error(error)
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

  }

  createL7Service = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    let serviceName = this.state.body.serviceName
    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.body.serviceType,
          "snat": this.state.body.snat,
          "destination": `${this.state.body.destination}:${this.state.body.destinationPort}`,
          "mask": '255.255.255.255',
          "source": this.state.body.source
        },
        "profiles": [
            {
                "name": "tcp-wan-optimized_SERVICENAMEL7",
                "type": "tcp",
                "defaultsFrom": "/Common/tcp-wan-optimized",
                "context": "clientside"
            },
            {
                "name": "tcp-lan-optimized_PROFILENAMEL7",
                "type": "tcp",
                "defaultsFrom": "/Common/tcp-lan-optimized",
                "context": "serverside"
            },
            {
                "name": "http_PROFILENAMEL7",
                "type": "http",
                "defaultsFrom": "/Common/http"
            },
            {
                "name": "client-ssl_PROFILENAMEL7",
                "type": "client-ssl",
                "cert": this.state.body.certificateName,
                "key": this.state.body.keyName,
                "chain": "",
                "context": "clientside"
            }
        ],
        "pool": {
            "name": `pool_${serviceName}`,
            "port": this.state.body.destinationPoolPort,
            "loadBalancingMode": this.state.body.lbMethod
        },
        "monitor": {
            "name": `${this.state.body.monitorType}_${serviceName}`,
            "type": this.state.body.monitorType
        },
        "nodes": this.state.body.nodes
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, success: true})
        this.success()
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )

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
    console.log(this.state.newList)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center', padding: 24}}>

      { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
      { !this.state.loading && this.state.success &&
        <Result
           status="success"
           title="Service Created"
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
            label="Service Type"
            name='serviceType'
            key="serviceType"
            validateStatus={this.state.errors.serviceTypeError}
            help={this.state.errors.serviceTypeError ? 'Please select a valid Service Type' : null }
          >
            <Select id='serviceType' onChange={e => this.setServiceType(e)}>
              <Select.Option key={'L7'} value={'L7'}>Layer 7</Select.Option>
              <Select.Option key={'L4'} value={'L4'}>Layer 4</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Service Name"
            name='serviceName'
            key="serviceName"
            validateStatus={this.state.errors.serviceNameError}
            help={this.state.errors.serviceNameError ? 'Please input a valid Service Name' : null }
          >
            <Input id='name' onChange={e => this.setServiceName(e)} />
          </Form.Item>

          { this.state.body.serviceName ?
          <React.Fragment>

          <Form.Item
            label="Snat"
            name='snat'
            key="snat"
            validateStatus={this.state.errors.snatError}
            help={this.state.errors.snatError ? 'Please select a valid Snat' : null }
          >
            <Select id='snat' onChange={e => this.setSnat(e)}>
              <Select.Option key={'none'} value={'none'}>none</Select.Option>
              <Select.Option key={'automap'} value={'automap'}>automap</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Destination"
            name='destination'
            key="destination"
            validateStatus={this.state.errors.destinationError}
            help={this.state.errors.destinationError ? 'Please input a valid destination' : null }
          >
              <Input id='destination' onBlur={e => this.setDestination(e)} />
          </Form.Item>

          <Form.Item
            label="Destination Port"
            name='destinationPort'
            key="destinationPort"
            validateStatus={this.state.errors.destinationPortError}
            help={this.state.errors.destinationPortError ? 'Please input a valid destination Port' : null }
          >
            <Input id='destinationPort' onBlur={e => this.setDestinationPort(e)} />
          </Form.Item>

          { this.state.body.serviceType === 'L7' ?
            <Form.Item
              label="Certificate"
              name='certificate'
              key="certificate"
              validateStatus={this.state.errors.certificateError}
              help={this.state.errors.certificateError ? 'Please select a valid certificate' : null }
            >
            <Select id='snat' onChange={e => this.setCertificateName(e)}>
            {this.props.certificates.map((n, i) => {
              return (
                <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                )
              })}
            </Select>
            </Form.Item>
            :
            null
          }

          { this.state.body.serviceType === 'L7' ?
            <Form.Item
              label="Key"
              name='key'
              key="key"
              validateStatus={this.state.errors.keyError}
              help={this.state.errors.keyError ? 'Please select a valid key' : null }
            >
            <Select id='snat' onChange={e => this.setKeyName(e)}>
            {this.props.keys.map((n, i) => {
              return (
                <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
                )
              })}
            </Select>
            </Form.Item>
            :
            null
          }

          <Form.Item
            label="Destination Pool Port"
            name='destinationPoolPort'
            key="destinationPoolPort"
            validateStatus={this.state.errors.destinationPoolPortError}
            help={this.state.errors.destinationPoolPortError ? 'Please input a valid destination Pool Port' : null }
          >
            <Input id='destinationPoolPort' onBlur={e => this.setDestinationPoolPort(e)} />
          </Form.Item>

          <Form.Item
            label="Load Balancing Method"
            name='lbMethod'
            key="lbMethod"
            validateStatus={this.state.errors.lbMethodError}
            help={this.state.errors.lbMethodError ? 'Please input a valid Loadbalancing Method' : null }
          >
            <Select id='lbMethod' onChange={a => this.setLbMethod(a)}>
              <Select.Option key={'round-robin'} value={'round-robin'}>round-robin</Select.Option>
              <Select.Option key={'least-connections-member'} value={'least-connections-member'}>least-connections-member</Select.Option>
              <Select.Option key={'observed-member'} value={'observed-member'}>observed-member</Select.Option>
              <Select.Option key={'predictive-member'} value={'predictive-member'}>predictive-member</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Monitor Type"
            name='monitorType'
            key="monitorType"
            validateStatus={this.state.errors.monitorTypeError}
            help={this.state.errors.monitorTypeError ? 'Please input a valid Monitor Type' : null }
          >
            <Select id='lbMethod' onChange={a => this.setMonitorType(a)}>
              <Select.Option key={'tcp-half-open'} value={'tcp-half-open'}>tcp-half-open</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="One more node"
            name='nodesNumber'
            key="nodesNumber"
            validateStatus={this.state.errors.nodesNumberError}
            help={this.state.errors.nodesNumberError ? 'Please input a valid number of nodes' : null }
          >
            <Button type="primary" onClick={() => this.oneMoreNode()}>
              +
            </Button>
            {//<Input id='nodesNumber' onBlur={e => this.setNodesNumber(e)} />
            }
          </Form.Item>

          {
            this.state.nodes.map((n, i) => {
              let a = 'address' + n.id
              let na = 'name' + n.id
              let r = 'remove' + n.id
              return (
                <React.Fragment>
                <Form.Item
                  label="Address"
                  name={a}
                  key={a}
                  validateStatus={this.state.errors.nodeAddressError}
                  help={this.state.errors.nodeAddressError ? 'Please input a valid IP' : null }
                >
                  <Input id={a} value={n.address} style={{display: 'block'}} onBlur={e => this.setNodeAddress(n.id, e)} />
                </Form.Item>
                <Form.Item
                  label="Name"
                  name={na}
                  key={na}
                  validateStatus={this.state.errors.nodeNameError}
                  help={this.state.errors.nodeNameError ? 'Please input a valid name' : null }
                >
                  <Input id={na} style={{display: 'block'}} onBlur={e => this.setNodeName(n.id, e)} />

                </Form.Item>
                <Form.Item
                  label="Remove node"
                  name={r}
                  key={r}
                  validateStatus={this.state.errors.removeNodeError}
                  help={this.state.errors.removeNodeError ? 'Please input a valid number of nodes' : null }
                >
                  <Button type="danger" onClick={() => this.removeNode(n.id)}>
                    -
                  </Button>
                  <Divider/>
                </Form.Item>

                </React.Fragment>
              )
            })
          }

          </React.Fragment>
          :
          null
        }


          <Form.Item
            wrapperCol={ {offset: 8 }}
            name="button"
            key="button"
          >
            <Button type="primary" onClick={() => this.removeNodesId()}>
              Create Service
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
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  certificates : state.f5.certificates,
  keys : state.f5.keys
}))(CreateF5Service);
