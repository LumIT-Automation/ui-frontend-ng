import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { Space, Form, Input, Result, Button, Select, Spin, Divider, TextArea } from 'antd'
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
      membersNumber: 0,
      members: [],
      body: {

      }
    };
  }

  componentDidMount() {
    this.fetchNetworksAndContainers()
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

  fetchNetworksAndContainers = async () => {
    let networks = await this.fetchNetworks()
    let containers = await this.fetchContainers()

    this.filterRealNetsAndConts(networks, containers)
  }

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
    let realNets = []
    let realConts = []

    nets.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let n = e.network.split('/')
          n = n[0]
          let o = {ele: e, n: n, type: 'network'}
          realNets.push(o)
        }
      }
    })

    conts.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let n = e.network.split('/')
          n = n[0]
          let o = {ele: e, n: n, type: 'container'}
          realConts.push(o)
        }
      }
    })
    let net = realNets.concat(realConts)
    this.setState({realNets: realNets})
    this.setState({realConts: realConts})
    this.setState({net: net})
  }

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

  setNetwork = (value, e) => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.network = e.value
      body.type = e.type
      delete errors.networkError
    }
    else {
      errors.networkError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setObjectType = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e.target.value) {
      body.objectType = e.target.value
      delete errors.objectTypeError
    }
    else {
      errors.objectTypeError = 'error'
    }
    this.setState({body: body, errors: errors})
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
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.serverName = e.target.value
      delete errors.serverNameError
    }
    else {
      errors.serverNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setReference = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (e) {
      body.reference = e.target.value
      delete errors.referenceError
    }
    else {
      errors.referenceError = 'error'
    }
    this.setState({body: body, errors: errors})
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
          "network": `${this.state.body.network}`,
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
    //}

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        console.log(resp)
        //console.log(resp.data)
        this.setState({loading: false, success: true})
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
    (this.state.body)
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
            label="Network"
            name='network'
            key="network"
            validateStatus={this.state.errors.networkError}
            help={this.state.errors.networkError ? 'Please select a valid network' : null }
          >
          <Select id='snat' onChange={(value, event) => this.setNetwork(value, event)}>
          { this.state.net ?
            this.state.net.map((n, i) => {
            return (
              <Select.Option key={i} type={n.type} value={n.n}>{n.n}</Select.Option>
              )
            })
            :
            null
          }
          </Select>
          </Form.Item>

          { this.state.body.type === 'container' ?
            <Form.Item
              label="Object Type"
              name='objectType'
              key="objectType"
              validateStatus={this.state.errors.objectTypeError}
              help={this.state.errors.objectTypeError ? 'Please input a valid object Type' : null }
            >
              <Input id='objectType' onChange={e => this.setObjectType(e)} />
            </Form.Item>
            :
            null
          }

          <Form.Item
            label="How many IP?"
            name='number'
            key="number"
            validateStatus={this.state.errors.numberError}
            help={this.state.errors.numberError ? 'Please input a valid object Type' : null }
          >
            <Input id='number' onChange={e => this.setNumber(e)} />
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
