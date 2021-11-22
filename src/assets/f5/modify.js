import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/f5Error'

import { setAssetsFetch, setAssetModifyError } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



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
    request.tlsverify = request.tlsverify.toString()
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

  modifyAsset = async () => {
    let request = Object.assign({}, this.state.request)

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});

      const b = {
        "data":
          {
            "address": this.state.request.address,
            "fqdn": this.state.request.fqdn,
            "baseurl": `https://${this.state.request.address}/mgmt/`,
            "tlsverify": this.state.request.tlsverify,
            "datacenter": this.state.request.datacenter,
            "environment": this.state.request.environment,
            "position": this.state.request.position,
            "username": this.state.request.username,
            "password": this.state.request.password
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.props.dispatch(setAssetModifyError(error))
          this.setState({loading: false, response: false})
        }
      )
      await rest.doXHR(`f5/asset/${this.props.obj.id}/`, this.props.token, b )
    }
  }


  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(setAssetsFetch(true)), 2030)
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
      <React.Fragment>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<div><p style={{textAlign: 'center'}}>MODIFY</p> <p style={{textAlign: 'center'}}>{this.props.obj.fqdn} - {this.props.obj.address}</p></div>}
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
             title="Updated"
           />
        }
        { !this.state.loading && !this.state.response &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              address: this.state.request.address,
              fqdn: this.state.request.fqdn,
              datacenter: this.state.request.datacenter,
              environment: this.state.request.environment,
              position: this.state.request.position,
              tlsverify: this.state.request.tlsverify,
              username: this.state.request.username,
              password: this.state.request.password
            }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Address"
              name="address"
              key="address"
              validateStatus={this.state.errors.addressError}
              help={this.state.errors.addressError ? 'Please input a valid ipv4' : null }
            >
              {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
              <Input id='address' onBlur={e => this.ipHostnameValidator(e)} />
            </Form.Item>

            <Form.Item
              label="Fqdn"
              name="fqdn"
              key="fqdn"
              validateStatus={this.state.errors.fqdnError}
              help={this.state.errors.fqdnError ? 'Please input a valid fqdn' : null }
            >
              <Input id='fqdn' onBlur={e => this.ipHostnameValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Datacenter"
              name="datacenter"
              key="datacenter"
              validateStatus={this.state.errors.datacenterError}
              help={this.state.errors.datacenterError ? 'Please input a valid Datacenter' : null }
            >
              <Input id='datacenter' onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Environment"
              name="environment"
              key="environment"
              validateStatus={this.state.errors.environmentError}
              help={this.state.errors.environmentError ? 'Please input a valid Environment' : null }
            >
              <Input id='environment' onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Position"
              name="position"
              key="position"
              validateStatus={this.state.errors.positionError}
              help={this.state.errors.positionError ? 'Please input a valid Position' : null }
            >
              <Input id='position' onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Tls verify"
              name="tlsverify"
              key="tlsverify"
              validateStatus={this.state.errors.tlsverifyError}
              help={this.state.errors.tlsverifyError ? 'Please input a valid tls verification' : null }
            >
              <Radio.Group id='tlsverify' value={this.state.request.tlsverify} onChange={e => this.genericValidator(e)}>
                <Radio key='1' id='tlsverify' value='1'>Yes</Radio>
                <Radio key='0' id='tlsverify' value='0'>No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              key="username"
              validateStatus={this.state.errors.usernameError}
              help={this.state.errors.usernameError ? 'Please input a valid asset Username' : null }
            >
              <Input id="username" onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              key="password"
              validateStatus={this.state.errors.passwordError}
              help={this.state.errors.passwordError ? 'Please input a valid asset Password' : null }
            >
              <Input.Password id="password" onBlur={e => this.genericValidator(e)}/>
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
              <Button type="primary" onClick={() => this.modifyAsset()}>
                Modify Asset
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.assetModifyError ? <Error component={'asset modify f5'} error={[this.props.assetModifyError]} visible={true} type={'setAssetModifyError'} /> : null }
          </React.Fragment>
        :
          null
        }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({

  token: state.ssoAuth.token,
 	assetModifyError: state.f5.assetModifyError,

}))(Modify);
