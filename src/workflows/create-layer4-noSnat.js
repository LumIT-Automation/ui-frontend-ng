import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { Space, Form, Input, Result, Button, Select, Spin } from 'antd'
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

class Pl4NoSnat extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      body: {
        service: 'Layer4 No SNAT',
        type: "L4",
        source: "0.0.0.0/0",
        nodesNumber: 0,
        nodes: []
      }
    };
  }

  componentDidMount() {
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
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    body.nodesNumber = body.nodesNumber + 1
    delete errors.nodesNumberError
    this.setState({body: body, errors: errors})
  }

  setNodesNumber = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (isNaN(e.target.value)) {
      errors.nodesNumberError = 'error'
    }
    else {
      body.nodesNumber = e.target.value
      delete errors.nodesNumberError
    }
    this.setState({body: body, errors: errors})
  }

  renderNodes = () => {
    let list = []
    for (let i = 0; i < this.state.body.nodesNumber; i++) {
      list.push(
        <React.Fragment key={i}>
          <Input key={i} id='node' style={{display: 'block'}} onBlur={e => this.setNode(e)} />
          <br/>
        </React.Fragment>
      )
    }
    return (
      <Form.Item
      label="Nodes"
      name='nodes'
      key="nodes"
      validateStatus={this.state.errors.nodesError}
      help={this.state.errors.nodesError ? 'Please input a valid ip' : null }
      >
        {list}
      </Form.Item>

    )
  }

  setNode = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    const regex = new RegExp();

    const ipv4 = e.target.value
    const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    const ipv4Regex = new RegExp(validIpAddressRegex);

    if (ipv4Regex.test(ipv4)) {
      body.nodes.push({name: `${ipv4}`, address: ipv4})
      delete errors.nodesError
    }
    else {
      errors.nodesError = 'error'
    }
    this.setState({body: body, errors: errors})
  }


  createService = async () => {
    console.log(this.state.body)
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    let serviceName = this.state.body.serviceName
    this.setState({message: null});

    const b = {
      "data": {
        "virtualServer": {
          "name": `${serviceName}`,
          "type": this.state.body.type,
          "snat": 'none',
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


            {this.state.body.nodesNumber ? this.renderNodes() : null }

          </React.Fragment>
          :
          null
        }


          <Form.Item
            wrapperCol={ {offset: 8 }}
            name="button"
            key="button"
          >
            <Button type="primary" onClick={() => this.createService()}>
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
  nodes: state.f5.nodes
}))(Pl4NoSnat);
