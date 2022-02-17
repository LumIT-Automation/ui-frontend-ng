import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import { poolsFetch, addPoolError } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result, Select } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />


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
          this.setState({loading: false, response: true, error: false}, () => this.response())
        },
        error => {
          this.props.dispatch(addPoolError(error))
          this.setState({loading: false, response: false})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token, b)
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 1000)
    setTimeout( () => this.props.dispatch(poolsFetch(true)), 1030)
    setTimeout( () => this.closeModal(), 1050)
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
                {this.props.monitorTypes ? this.props.monitorTypes.map((p, i) => {
                  return (
                    <Select.Option  key={i} value={p}>{p}</Select.Option>
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
              <Button type="primary" onClick={() => this.addPool()}>
                Add Pool
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.addPoolError ? <Error component={'add pool'} error={[this.props.addPoolError]} visible={true} type={'addPoolError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  monitorTypes: state.f5.monitorTypes,
  addPoolError: state.f5.addPoolError,
}))(Add);
