import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setNodesList } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result } from 'antd';

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

  modifyNode = async () => {
    console.log(this.props.obj.name)
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
            "connectionLimit": 10,
            "dynamicRatio": 1,
            "fqdn": {
                "addressFamily": "ipv4",
                "interval": "1000",
                "downInterval": 113
            },
            "logging": "enabled",
            "monitor": "default",
            "rateLimit": "0",
            "ratio": 1
          }
        }

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, success: true}, () => this.fetchNodes())
          this.success()
        },
        error => {
          this.setState({loading: false, success: false})
          this.setState({error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/node/${this.props.obj.name}/`, this.props.token, body )
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  fetchNodes = async () => {

    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setNodesList(resp))
        //console.log(resp)
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
  }

  success = () => {
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
      <Space direction='vertical'>

        <Button type="primary" onClick={() => this.details()}>
          Modify Node
        </Button>

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
        { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
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
              name: this.state.body.name
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
              label="NAME"
              name="name"
              key="name"
              validateStatus={this.state.errors.nameError}
              help={this.state.errors.nameError ? 'Please input a valid name' : null }
            >
              <Input id='fqdn' onBlur={e => this.ipHostnameValidator(e)}/>
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
              <Button type="primary" onClick={() => this.modifyNode()}>
                Modify Node
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
  nodes: state.f5.nodes
}))(Modify);
