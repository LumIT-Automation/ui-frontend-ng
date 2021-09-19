import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setPoolsFetchStatus } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select, Divider } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

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
      body: {}
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
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {

      case 'name':
        if (e.target.value) {
          body.name = e.target.value
          delete errors.nameError
        }
        else {
          errors.nameError = 'error'
        }
        this.setState({body: body, errors: errors})
        break
      default:

    }
  }

  ipHostnameValidator = e => {

    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    const regex = new RegExp();

    switch(e.target.id) {

      case 'address':
        const ipv4 = e.target.value
        const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
        const ipv4Regex = new RegExp(validIpAddressRegex);

        if (ipv4Regex.test(ipv4)) {
          body.address = ipv4
          delete errors.addressError
        }
        else {
          errors.addressError = 'error'
        }
        this.setState({body: body, errors: errors})
        break;

      case 'fqdn':
        const fqdn = e.target.value
        const validHostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";
        const fqdnRegex = new RegExp(validHostnameRegex);

        if (fqdnRegex.test(fqdn)) {
          body.fqdn = fqdn
          delete errors.fqdnError
        }
        else {
          errors.fqdnError = 'error'
        }
        this.setState({body: body, errors: errors})
        break;

      default:
        //
    }
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

  setMonitor = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.monitor = e
      delete errors.monitorError
      }
      else {
        errors.moitorError = 'error'
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

  setMemberName = (name, id) => {
    let nodes = Object.assign([], this.state.nodes);
    let errors = Object.assign({}, this.state.errors);
    //const regex = new RegExp();

    //const ipv4 = m
    //const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
    //const ipv4Regex = new RegExp(validIpAddressRegex);

    //if (ipv4Regex.test(ipv4)) {
    if (name) {
      let index = nodes.findIndex((obj => obj.id == id))
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
    const regex = new RegExp();

    const port = p.target.value

    if (isNaN(port)) {
      errors.memberPortError = 'error'
    }
    else {
      let index = nodes.findIndex((obj => obj.id == id))
      nodes[index].port = port
      delete errors.memberPortError
    }
    this.setState({nodes: nodes, errors: errors})
  }

  addPool = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (isEmpty(body)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});
      const body = {
        "data":
        {
            "name": this.state.body.name,
            "monitor": this.state.body.monitor,
            "loadBalancingMode": this.state.body.lbMethod
        }
      }

      this.setState({loading: true})

      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, error: false, success: true}, () => this.props.dispatch(setPoolsFetchStatus('updated')) )
          this.success()
        },
        error => {
          this.setState({loading: false, error: error, success: false}, () => this.props.dispatch(setPoolsFetchStatus('updated')))
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token, body)
    }
  }

  addPoolMembers = async () => {
    this.state.nodes.forEach(m => {
      this.setState({message: null});
      const body = {
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
      this.addPoolMember(body)
    })

    this.success()
  }

  addPoolMember = async (body) => {
      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, success: true})
        },
        error => {
          this.setState({loading: false, success: false})
          this.setState({error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.state.body.name}/members/`, this.props.token, body)
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.props.dispatch(setPoolsFetchStatus('updated')), 2050)
    setTimeout( () => this.closeModal(), 2100)

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

          <Button style={{marginLeft: '200px'}} type="primary" onClick={() => this.details()}>
            Add Member
          </Button>

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
        { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.success &&
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
                let a = 'address' + n.id
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
  monitors: state.f5.monitors,
  pools: state.f5.pools
}))(Add);
