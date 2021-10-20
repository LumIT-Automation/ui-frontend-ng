import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { Space, Form, Input, Result, Button, Select, Spin, Divider, Table} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { setWorkflowStatus } from '../_store/store.workflows'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
      serverName: '',
      mac: '',
      macAddress: '00:00:00:00:00:00',
      message:'',
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

  setIp = e => {

    let ip = Object.assign({}, this.state.ip);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      const ipv4 = e.target.value
      const validIpAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
      const ipv4Regex = new RegExp(validIpAddressRegex);

      if (ipv4Regex.test(ipv4)) {
        ip = ipv4
        delete errors.ipError
      }
      else {
        errors.ipError = 'error'
      }
    }
    else {
      errors.ipError = 'error'
    }

    this.setState({ip: ip, errors: errors})
  }

  infoIp = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let ipInfo = []
        ipInfo.push(resp.data)
        this.setState({
          success: true,
          ipInfo: ipInfo,
          loading: false
        })
        if (resp.data.extattrs && resp.data.extattrs['Name Server']) {
          console.log(resp.data.extattrs['Name Server'].value)
          this.setState({
            serverName: resp.data.extattrs['Name Server'].value,
          })
        }
        if (resp.data.mac_address) {
          console.log(resp.data.mac_address)
          this.setState({
            macAddress: resp.data.mac_address,
          })
        }
      },
      error => {
        this.setState({error: error, loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token)
    //this.props.dispatch(setNodesLoading(false))
  }

  setServerName = name => {
    let errors = Object.assign({}, this.state.errors);
    let serverName

    if (name.target.value) {
      serverName = name.target.value
      delete errors.serverNameError
      this.setState({ serverName: serverName, errors: errors})
    }
    else {
      errors.serverNameError = 'error'
      this.setState({ errors: errors})
    }

  }

  setMacAddress = m => {
    let errors = Object.assign({}, this.state.errors);
    let mac = m.target.value

    const validMacAddressRegex = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    const macRegex = new RegExp(validMacAddressRegex);

    if (macRegex.test(mac)) {
      delete errors.macAddressError
      this.setState({macAddress: mac, errors: errors})
    }
    else {
      errors.macError = 'error'
      this.setState({errors: errors})
    }
  }

  modifyIp = async () => {
    let errors = Object.assign({}, this.state.errors);

    if (isEmpty(this.state.serverName)){
      this.setState({message: 'Please fill the form'})
    }
    else {
      this.setState({message: null});

      const body = {
        "data":
          {
            "mac": `${this.state.macAddress}`,
            "extattrs": {
                "Name Server": {
                    "value": `${this.state.serverName}`
                }
            },
          }
        }
        this.setState({loading: true})

        let rest = new Rest(
          "PATCH",
          resp => {
            console.log('resp')
            console.log(resp)
            this.infoIp()
          },
          error => {
            console.log(error)
            this.setState({loading: false, success: false, error: error})
          }
        )
        await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token, body )
      }
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

    const columns = [
      {
        title: 'IP address',
        align: 'center',
        dataIndex: 'ip_address',
        key: 'ip_address',
      },
      {
        title: 'Names',
        align: 'center',
        dataIndex: 'names',
        key: 'ip_address',
      },
      {
        title: 'Name Server',
        align: 'center',
        dataIndex: ['extattrs', 'Name Server', 'value'],
        key: 'nameServer',
        render: (name, obj)  => (
          <Space size="small">
            <Input id='nameServer' placeholder={this.state.serverName} onChange={e => this.setServerName(e)} />
          </Space>
        ),
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'mac_address',
        key: 'mac_address',
        render: (name, obj)  => (
          <Space size="small">
            <Input id='nameServer' placeholder={this.state.macAddress} onChange={e => this.setMacAddress(e)} />
          </Space>
        ),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'Types',
        align: 'center',
        dataIndex: 'types',
        key: 'types',
      },
      {
        title: 'Usage',
        align: 'center',
        dataIndex: 'usage',
        key: 'usage',
      },
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
      },
      {
        title: 'Gateway',
        align: 'center',
        dataIndex: ['extattrs', 'Gateway', 'value'],
        key: 'gateway',
      },
      {
        title: 'Mask',
        align: 'center',
        dataIndex: ['extattrs', 'Mask', 'value'],
        key: 'mask',
      },
      {
        title: 'Reference',
        align: 'center',
        dataIndex: ['extattrs', 'Reference', 'value'],
        key: 'reference',
      },
    ];

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center', padding: 24}}>

      { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
      { !this.state.loading && this.state.success &&
        <React.Fragment>
        <Table
          columns={columns}
          dataSource={this.state.ipInfo}
          bordered
          rowKey="ip"
          pagination={false}
          style={{marginBottom: 10}}
        />
        <Button type="primary" onClick={() => this.modifyIp()}>
          Modify Ip
        </Button>
        </React.Fragment>
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
            label="IP address"
            name='ip'
            key="ip"
            validateStatus={this.state.errors.ipError}
            help={this.state.errors.ipError ? 'Please input a valid ip address' : null }
          >
            <Input id='ip' onChange={e => this.setIp(e)} />
          </Form.Item>

          <Form.Item
            wrapperCol={ {offset: 8 }}
            name="button"
            key="button"
          >


            { (this.state.ipInfo && this.state.ipInfo[0].ip_address) ?
              <Button type="primary" onClick={() => this.modifyIp()}>
                Modify Ip
              </Button>
              :
              <Button type="primary" onClick={() => this.infoIp()}>
                Info Ip
              </Button>
            }
          </Form.Item>

        </Form>
      }
        {this.props.error ?
          <Error error={this.props.error} visible={true} resetError={() => this.resetError()} />
          :
          <Error error={this.props.error} visible={false} />
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,
}))(RequestIp);
