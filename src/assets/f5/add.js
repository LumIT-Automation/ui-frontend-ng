import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setAssetsFetch, setAssetAddError } from '../../_store/store.f5'

import { Form, Input, Button, Modal, Radio, Spin, Result } from 'antd';
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
        const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
        const ipv4Regex = new RegExp(validIpAddressRegex);

        if (ipv4Regex.test(ipv4)) {
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

  addAsset = async () => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);
    let list = ["address", "fqdn", "tlsverify", "datacenter", "environment", "position", "username", "password"]

    let missingParams = list.filter(k => {
       return !(k in request)
    })

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }
    else if (!isEmpty(errors)){
      this.setState({message: 'Please correct wrong fields'})
    }
    else if (!isEmpty(missingParams)){
      this.setState({message: 'Please fill every fields of the form'})
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
        "POST",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.props.dispatch(setAssetAddError(error))
          this.setState({loading: false, response: false})
        }
      )
      await rest.doXHR(`f5/assets/`, this.props.token, b )
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
      request: {}
    })
  }


  render() {


    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD ASSET</p>}
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
            initialValues={this.state.request ? {
              remember: true,
              address: this.state.request.address,
              fqdn: this.state.request.fqdn,
              datacenter: this.state.request.datacenter,
              environment: this.state.request.environment,
              position: this.state.request.position,
              tlsverify: this.state.request.tlsverify,
              username: this.state.request.username,
              password: this.state.request.password
            }: null}
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
              <Input id='address' placeholder="address" onBlur={e => this.ipHostnameValidator(e)} />
            </Form.Item>

            <Form.Item
              label="Fqdn"
              name="fqdn"
              key="fqdn"
              validateStatus={this.state.errors.fqdnError}
              help={this.state.errors.fqdnError ? 'Please input a valid fqdn' : null }
            >
              <Input id='fqdn' placeholder="fqdn" onBlur={e => this.ipHostnameValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Datacenter"
              name="datacenter"
              key="datacenter"
              validateStatus={this.state.errors.datacenterError}
              help={this.state.errors.datacenterError ? 'Please input a valid Datacenter' : null }
            >
              <Input id='datacenter' placeholder="datacenter" onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Environment"
              name="environment"
              key="environment"
              validateStatus={this.state.errors.environmentError}
              help={this.state.errors.environmentError ? 'Please input a valid Environment' : null }
            >
              <Input id='environment' placeholder="environment" onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Position"
              name="position"
              key="position"
              validateStatus={this.state.errors.positionError}
              help={this.state.errors.positionError ? 'Please input a valid Position' : null }
            >
              <Input id='position' placeholder="position" onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Tls verify"
              name="tlsverify"
              key="tlsverify"
              validateStatus={this.state.errors.tlsverifyError}
              help={this.state.errors.tlsverifyError ? 'Please input a valid tls verification' : null }
            >
              <Radio.Group id='tlsverify' placeholder="Tls verify" value={this.state.request.tlsverify} onChange={e => this.genericValidator(e)}>
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
              <Input id="username" placeholder="username" onBlur={e => this.genericValidator(e)}/>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              key="password"
              validateStatus={this.state.errors.passwordError}
              help={this.state.errors.passwordError ? 'Please input a valid asset Password' : null }
            >
              <Input.Password id="password" placeholder="password" onBlur={e => this.genericValidator(e)}/>
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
              <Button type="primary" onClick={() => this.addAsset()}>
                ADD
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>

        { this.props.assetAddError ? <Error error={[this.props.assetAddError]} visible={true} type={'setF5AssetAddError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	assetAddError: state.f5.assetAddError,
}))(Add);
