import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import AssetSelector from './assetSelector'

import { Modal, Form, Input, Result, Button, Select, Spin, Divider, Table, Alert} from 'antd'
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

class DetailsIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
    };
  }

  componentDidMount() {
      console.log('monto details')
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

//http://10.0.111.21/api/v1/infoblox/1/ipv4/10.8.1.3/

  infoIp = async () => {
    //this.props.dispatch(setNodesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        let ipInfo = []
        ipInfo.push(resp.data)
        this.setState({success: true, ipInfo: ipInfo})
      },
      error => {
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token)
    //this.props.dispatch(setNodesLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      success: false,
      ipInfo: [],
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
      },
      {
        title: 'Mac address',
        align: 'center',
        dataIndex: 'mac_address',
        key: 'mac_address',
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
      {
        title: 'Names',
        align: 'center',
        dataIndex: 'names',
        key: 'ip_address',
      },
    ];

    return (
      <React.Fragment>

      <Button type="primary" onClick={() => this.details()}>IP DETAILS</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>REQUEST IP</p>}
        centered
        destroyOnClose={true}
        visible={this.state.visible}
        footer={''}
        onOk={() => this.setState({visible: true})}
        onCancel={() => this.closeModal()}
        width={1500}
      >

        <AssetSelector/>
        <Divider/>

        { ( this.props.asset && this.props.asset.id ) ?
          <React.Fragment>
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.success &&
            <Table
              columns={columns}
              dataSource={this.state.ipInfo}
              bordered
              rowKey="ip"
              pagination={false}
              style={{marginBottom: 10}}
            />
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
                <Button type="primary" onClick={() => this.infoIp()}>
                  Info Ip
                </Button>
              </Form.Item>

            </Form>
          }
          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }

      </Modal>

      {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,
}))(DetailsIp);
