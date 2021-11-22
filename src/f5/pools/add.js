import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setPoolsFetch } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result, Select, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />

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

class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      nodesNumber: 0,
      nodes: [],
      request: {}
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

  nameSetValidator = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {

      case 'name':
        if (e.target.value) {
          request.name = e.target.value
          delete errors.nameError
        }
        else {
          errors.nameError = 'error'
        }
        this.setState({request: request, errors: errors})
        break
      default:

    }
  }

  ipHostnameValidator = e => {

    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {

      case 'address':
        const ipv4 = e.target.value
        const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

        if (validIpAddressRegex.test(ipv4)) {
          request.address = ipv4
          delete errors.addressError
        }
        else {
          errors.addressError = 'error'
        }
        this.setState({request: request, errors: errors})
        break;

      case 'fqdn':
        const fqdn = e.target.value
        const validHostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";
        const fqdnRegex = new RegExp(validHostnameRegex);

        if (fqdnRegex.test(fqdn)) {
          request.fqdn = fqdn
          delete errors.fqdnError
        }
        else {
          errors.fqdnError = 'error'
        }
        this.setState({request: request, errors: errors})
        break;

      default:
        //
    }
  }

  setLbMethod = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    switch (e) {
      case 'round-robin':
        request.lbMethod = 'round-robin'
        delete errors.lbMethodError
        break
      case 'least-connections-member':
        request.lbMethod = 'least-connections-member'
        delete errors.lbMethodError
        break
      case 'observed-member':
        request.lbMethod = 'observed-member'
        delete errors.lbMethodError
        break
      case 'predictive-member':
        request.lbMethod = 'predictive-member'
        delete errors.lbMethodError
        break
      default:
        errors.lbMethodError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setMonitor = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      request.monitor = e
      delete errors.monitorError
      }
      else {
        errors.moitorError = 'error'
      }
      this.setState({request: request, errors: errors})
  }

  oneMoreNode = () => {
    let nodesNumber = this.state.nodesNumber
    let nodes = this.state.nodes
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    nodesNumber = nodesNumber + 1
    nodes.push({id: nodesNumber})
    delete errors.nodesNumberError
    this.setState({nodesNumber: nodesNumber, errors: errors, request: request})
  }

  removeNode = (nodeId) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);

    if (nodeId) {
      let index = nodes.findIndex((obj => obj.id === nodeId))
      nodes.splice(index, 1)
      delete errors.nodesError
    }
    else {
      errors.nodesError = 'error'
    }
    this.setState({nodes: nodes, errors: errors})
  }

  setMemberName = (name, id) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);

    //const ipv4 = m
    //const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    //const ipv4Regex = new RegExp(validIpAddressRegex);

    //if (ipv4Regex.test(ipv4)) {
    if (name) {
      let index = nodes.findIndex((obj => obj.id === id))
      //nodes[index].address = ipv4
      nodes[index].name = name
      delete errors.memberNameError
    }
    else {
      errors.memberNameError = 'error'
    }
    this.setState({nodes: nodes, errors: errors})
  }

  setMemberPort = (p, id) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);

    const port = p.target.value

    if (isNaN(port)) {
      errors.memberPortError = 'error'
    }
    else {
      let index = nodes.findIndex((obj => obj.id === id))
      nodes[index].port = port
      delete errors.memberPortError
    }
    this.setState({nodes: nodes, errors: errors})
  }

  addPool = async () => {
    let request = Object.assign({}, this.state.request)

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});
      const b = {
        "data":
        {
            "name": this.state.request.name,
            "monitor": this.state.request.monitor,
            "loadBalancingMode": this.state.request.lbMethod
        }
      }

      this.setState({loading: true})

      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, error: false}, () => this.addPoolMembers())
        },
        error => {
          this.setState({loading: false, error: error, response: false}, () => this.props.dispatch(setPoolsFetch(true)))
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token, b)
    }
  }

  addPoolMembers = async () => {
    this.state.nodes.forEach(m => {
      this.setState({message: null});
      const b = {
        "data":
          {
            "name": `${m.name}:${m.port}`,
            "connectionLimit": 0,
            "dynamicRatio": 1,
            "ephemeral": "false",
            "inheritProfile": "enabled",
            "logging": "disabled",
            "monitor": "default",
            "priorityGroup": 0,
            "rateLimit": "disabled",
            "ratio": 1,
            "state": "up",
            "fqdn": {
                "autopopulate": "disabled"
            }
          }
      }
      this.setState({loading: true})
      this.addPoolMember(request)
    })

    this.response()
  }

  addPoolMember = async (request) => {
      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.setState({loading: false, error: error, response: false})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.state.request.name}/members/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(setPoolsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD POOL</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.response &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.response &&
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Name"
              name="name"
              key="name"
              validateStatus={this.state.errors.mameError}
              help={this.state.errors.nameError ? 'Please input a valid name' : null }
            >
              <Input id='name' placeholder="name" onBlur={e => this.nameSetValidator(e)}/>
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
              label="Monitor"
              name="monitor"
              key="monitor"
              validateStatus={this.state.errors.monitorError}
              help={this.state.errors.monitorError ? 'Please select monitor' : null }
            >
              <Select onChange={m => this.setMonitor(m)} >
                {this.props.monitors ? this.props.monitors.map((p, i) => {
                  return (
                    <Select.Option  key={i} value={p.fullPath}>{p.name}</Select.Option>
                  )
              }) : null}
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
                let na = 'name' + n.id
                let pa = 'port' + n.id
                let r = 'remove' + n.id
                return (
                  <React.Fragment>
                  <Form.Item
                    label="Member"
                    name={na}
                    key={na}
                    validateStatus={this.state.errors.memberNameError}
                    help={this.state.errors.memberNameError ? 'Please input a valid name' : null }
                  >
                    <Select onChange={m => this.setMemberName(m, n.id)} >
                      {this.props.nodes ? this.props.nodes.map((p, i) => {
                        return (
                          <Select.Option key={i} value={p.name}>{p.address} - {p.name}</Select.Option>
                        )
                    }) : null}
                    </Select>

                  </Form.Item>
                  <Form.Item
                    label="Port"
                    name={pa}
                    key={pa}
                    validateStatus={this.state.errors.memberPortError}
                    help={this.state.errors.memberPortError ? 'Please input a valid port' : null }
                  >
                    <Input id='memberPort' placeholder='port' onBlur={e => this.setMemberPort(e, n.id)}/>
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

            {this.state.message ?
              <Form.Item
                wrapperCol={ {offset: 8, span: 16 }}
                name="message"
                key="message"
              >
                <p style={{color: 'red'}}>{this.state.message}</p>
              </Form.Item>

              : null
            }

            <Form.Item
              wrapperCol={ {offset: 8, span: 16 }}
              name="button"
              key="button"
            >
              <Button type="primary" onClick={() => this.addPool()}>
                Add Pool
              </Button>
            </Form.Item>

          </Form>
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
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  monitors: state.f5.monitors
}))(Add);
