import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import PoolMembers from '../poolMembers/manager'

import { poolsFetch } from '../../_store/store.f5'

import { Form, Button, Space, Modal, Spin, Result, Select, Divider } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />


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

class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
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
    let request = Object.assign({}, this.props.obj)
    this.setState({request: request})
  }

  genericValidator = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {

      case 'tlsverify':
        if (e.target.value) {
          request.tlsverify = e.target.value
          delete errors.tlsverifyError
        }
        else {
          errors.tlsverifyError = 'error'
        }
        this.setState({request: request, errors: errors})
        break

      case 'datacenter':
        if (e.target.value) {
        request.datacenter = e.target.value
          delete errors.datacenterError
        }
        else {
          errors.datacenterError = 'error'
        }
        this.setState({request: request, errors: errors})
        break

      case 'environment':
        if (e.target.value) {
          request.environment = e.target.value
          delete errors.environmentError
        }
        else {
          errors.environmentError = 'error'
        }
        this.setState({request: request, errors: errors})
        break

      case 'position':
        if (e.target.value) {
          request.position = e.target.value
          delete errors.positionError
        }
        else {
          errors.positionError = 'error'
        }
        this.setState({request: request, errors: errors})
        break

      case 'username':
        if (e.target.value) {
          request.username = e.target.value
          delete errors.usernameError
        }
        else {
          errors.usernameError = 'error'
        }
        this.setState({request: request, errors: errors})
        break

      case 'password':
        if (e.target.value) {
          request.password = e.target.value
          delete errors.passwordError
        }
        else {
          errors.passwordError = 'error'
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

  modifyPool = async () => {
    let request = Object.assign({}, this.state.request)

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});

      const b = {
        "data":
          {
            "monitor": this.state.request.monitor,
            "loadBalancingMode": this.state.request.lbMethod
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.setState({loading: false, response: false, error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/`, this.props.token, b )
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(poolsFetch(true)), 2030)
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

      <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<div><p style={{textAlign: 'center'}}>MODIFY</p> <p style={{textAlign: 'center'}}>{this.props.obj.name}</p></div>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.response &&
          <Result
             status="success"
             title="Updated"
           />
        }
        { !this.state.loading && !this.state.response &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              lbMethod: this.state.request.lbMethod,
              monitor: this.state.request.monitor
            }}
            onFinish={null}
            onFinishFailed={null}
          >
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
            <Select onChange={p => this.setMonitor(p)} >

              {this.props.monitors ? this.props.monitors.map((p, i) => {
                return (
                  <Select.Option  key={i} value={p.fullPath}>{p.name}</Select.Option>
                )
            }) : null}
            </Select>
          </Form.Item>

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
            <Button type="primary" onClick={() => this.modifyPool()}>
              Modify Pool
            </Button>
          </Form.Item>

          <Divider/>

          <Form.Item
            label="Members"
            name="memebers"
            key="members"
            noStyle={true}
            validateStatus={this.state.errors.monitorError}
            help={this.state.errors.monitorError ? 'Please select monitor' : null }
          >
            <PoolMembers obj={this.props.obj}/>
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
  monitors: state.f5.monitors,
}))(Modify);
