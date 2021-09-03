import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setPoolsList } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select } from 'antd';

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

  setMonitor = e => {
    console.log('eeeeeeeeee')
    console.log(e)
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
            "monitor": this.state.body.monitor
        }
      }

      this.setState({loading: true})

      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, success: true}, () => this.fetchPools())
          this.success()
        },
        error => {
          this.setState({loading: false, success: false})
          this.setState({error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token, body)
    }
  }

  fetchPools = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setPoolsList(resp))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
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

          <Button type="primary" onClick={() => this.details()}>
            Add Pool
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
              label="Session"
              name="session"
              key="session"
              validateStatus={this.state.errors.sessionError}
              help={this.state.errors.sessionError ? 'Please select session' : null }
            >
              <Select onChange={p => this.setMonitor(p)} style={{ width: 200 }}>

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
