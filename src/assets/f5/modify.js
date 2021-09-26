import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setAssetsFetchStatus } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />


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

class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
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
    let body = Object.assign({}, this.props.obj)
    body.tlsverify = body.tlsverify.toString()
    this.setState({body: body})
  }

  genericValidator = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {

      case 'tlsverify':
        if (e.target.value) {
          body.tlsverify = e.target.value
          delete errors.tlsverifyError
        }
        else {
          errors.tlsverifyError = 'error'
        }
        this.setState({body: body, errors: errors})
        break

      case 'datacenter':
        if (e.target.value) {
        body.datacenter = e.target.value
          delete errors.datacenterError
        }
        else {
          errors.datacenterError = 'error'
        }
        this.setState({body: body, errors: errors})
        break

      case 'environment':
        if (e.target.value) {
          body.environment = e.target.value
          delete errors.environmentError
        }
        else {
          errors.environmentError = 'error'
        }
        this.setState({body: body, errors: errors})
        break

      case 'position':
        if (e.target.value) {
          body.position = e.target.value
          delete errors.positionError
        }
        else {
          errors.positionError = 'error'
        }
        this.setState({body: body, errors: errors})
        break

      case 'username':
        if (e.target.value) {
          body.username = e.target.value
          delete errors.usernameError
        }
        else {
          errors.usernameError = 'error'
        }
        this.setState({body: body, errors: errors})
        break

      case 'password':
        if (e.target.value) {
          body.password = e.target.value
          delete errors.passwordError
        }
        else {
          errors.passwordError = 'error'
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

  modifyAsset = async () => {
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
            "address": this.state.body.address,
            "fqdn": this.state.body.fqdn,
            "baseurl": `https://${this.state.body.address}/mgmt/`,
            "tlsverify": this.state.body.tlsverify,
            "datacenter": this.state.body.datacenter,
            "environment": this.state.body.environment,
            "position": this.state.body.position,
            "username": this.state.body.username,
            "password": this.state.body.password
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, success: true}, () => this.success())
        },
        error => {
          this.setState({loading: false, success: false, error: error})
        }
      )
      await rest.doXHR(`f5/asset/${this.props.obj.id}/`, this.props.token, body )
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.props.dispatch(setAssetsFetchStatus('updated')), 2030)
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
          title={<p style={{textAlign: 'center'}}>MODIFY ASSET</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Updated"
           />
        }
        { !this.state.loading && !this.state.success &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              address: this.state.body.address,
              fqdn: this.state.body.fqdn,
              datacenter: this.state.body.datacenter,
              environment: this.state.body.environment,
              position: this.state.body.position,
              tlsverify: this.state.body.tlsverify,
              username: this.state.body.username,
              password: this.state.body.password
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
              label="position"
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
              <Radio.Group id='tlsverify' value={this.state.body.tlsverify} onChange={e => this.genericValidator(e)}>
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


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
}))(Modify);
