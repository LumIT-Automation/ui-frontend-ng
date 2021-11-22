import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import AssetSelector from './assetSelector'

import { Modal, Alert, Divider, Form, Input, Button, Spin, Table } from 'antd'
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

class ReleaseIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      request: { }
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
      const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

      if (validIpAddressRegex.test(ipv4)) {
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
          loading: false
        })
      },
      error => {
        this.setState({error: error, loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token)
    //this.props.dispatch(setNodesLoading(false))
  }

  releaseIp = async () => {

    if (isEmpty(this.state.ip)){
      this.setState({message: 'Please fill the form'})
    }
    else {
      this.setState({message: null});

        this.setState({loading: true})

        let rest = new Rest(
          "DELETE",
          resp => {
            this.infoIp()
          },
          error => {
            this.setState({loading: false, response: false, error: error})
          }
        )
        await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token )
      }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
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
    ];

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>RELEASE IP</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>RELEASE IP</p>}
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
            { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !this.state.loading && this.state.response &&
              <Table
                columns={columns}
                dataSource={this.state.ipInfo}
                bordered
                rowKey="ip_address"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />
            }
            { !this.state.loading && !this.state.response &&
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

                <Button type="primary" onClick={() => this.releaseIp()}>
                  Release Ip
                </Button>

              </Form.Item>

              </Form>
            }

          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }
      </Modal>

      {this.props.error ? <Error error={[this.props.error]} visible={true} /> : <Error visible={false} errors={null}/>}

    </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,
}))(ReleaseIp);
