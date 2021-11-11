import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import AssetSelector from './assetSelector'

import { Modal, Alert, Form, Input, Button, Select, Spin, Divider, Table} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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

class ModifyIp extends React.Component {

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
          response: true,
          ipInfo: ipInfo,
          present: true,
          status: resp.data.status,
          loading: false
        })
        if (resp.data.extattrs && resp.data.extattrs['Name Server']) {
          this.setState({
            serverName: resp.data.extattrs['Name Server'].value,
          })
        }
        if (resp.data.mac_address) {
          this.setState({
            macAddress: resp.data.mac_address,
          })
        }
      },
      error => {
        this.setState({error: error, loading: false, present: false})
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

    if (isEmpty(this.state.serverName)){
      this.setState({message: 'Please fill the form'})
    }
    else {
      this.setState({message: null});

      const b = {
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
            this.infoIp()
          },
          error => {
            this.setState({loading: false, response: false, error: error})
          }
        )
        await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token, b )
      }
    }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
      ipInfo: [],
      present: false,
      errors: []
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
        title: 'Name Server',
        align: 'center',
        dataIndex: ['extattrs', 'Name Server', 'value'],
        key: 'nameServer',
        render: (name, obj)  => (
          <React.Fragment>
            <Input id='nameServer' placeholder={this.state.serverName} onChange={e => this.setServerName(e)} />
          </React.Fragment>
        ),
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'mac_address',
        key: 'mac_address',
        render: (name, obj)  => (
          <React.Fragment>
            <Input id='nameServer' placeholder={this.state.macAddress} onChange={e => this.setMacAddress(e)} />
          </React.Fragment>
        ),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
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
      {
        title: 'Record A',
        align: 'center',
        dataIndex: 'names',
        key: 'RecordA',
      },
    ];

    return (
      <React.Fragment>
      { this.props.error ?
        <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} />
        :
        <React.Fragment>

          <Button type="primary" onClick={() => this.details()}>MODIFY IP</Button>

          <Modal
            title={<p style={{textAlign: 'center'}}>MODIFY IP</p>}
            centered
            destroyOnClose={true}
            visible={this.state.visible}
            footer={''}
            onOk={() => this.setState({visible: true})}
            onCancel={() => this.closeModal()}
            width={1500}
          >

            <AssetSelector />
            <Divider/>

            { ( this.props.asset && this.props.asset.id ) ?
              <React.Fragment>
              { this.state.loading ?
                <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                <React.Fragment>
                { this.state.present ?
                  <React.Fragment>
                    <Table
                      columns={columns}
                      dataSource={this.state.ipInfo}
                      bordered
                      rowKey="ip"
                      scroll={{x: 'auto'}}
                      pagination={false}
                      style={{marginBottom: 10}}
                    />
                    { ( this.state.status === 'USED' ) ?
                    <Button type="primary" onClick={() => this.modifyIp()}>
                      Modify Ip
                    </Button>
                    :
                    <Button type="primary" onClick={() => this.modifyIp()} disabled>
                      Modify Ip
                    </Button>
                    }
                  </React.Fragment>
                  :
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
                      <Button type="primary" onClick={() => this.infoIp()}>
                        Info Ip
                      </Button>

                    </Form.Item>

                  </Form>
                }
                </React.Fragment>
              }
              </React.Fragment>
              :
              <Alert message="Asset and Partition not set" type="error" />
            }
          </Modal>

        </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,
}))(ModifyIp);
