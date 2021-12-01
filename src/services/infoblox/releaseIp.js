import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/infobloxError"

import {
  ipDetailError,
  ipReleaseError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Modal, Alert, Divider, Input, Button, Spin, Table, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


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
      errors: {},
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

  setIp = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    const ipv4 = e.target.value
    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(ipv4)) {
      request.ip = ipv4
      delete errors.ipError
    }
    else {
      request.ip = null
      errors.ipError = 'Please input a valid ip'
    }
    this.setState({request: request, errors: errors})
  }

  ipDetail = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let ipInfo = []
        ipInfo.push(resp.data)
        this.setState({response: true, ipInfo: ipInfo})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({loading: false})
  }

  releaseIp = async () => {
    this.setState({loading: true})

    let rest = new Rest(
      "DELETE",
      resp => {
        this.ipDetail()
      },
      error => {
        this.props.dispatch(ipReleaseError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token )
    this.setState({loading: false})
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
            { !this.state.loading && this.state.response &&
              <Table
                columns={columns}
                dataSource={this.state.ipInfo}
                bordered
                rowKey="ip"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />
            }
            { !this.state.response &&
              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP address:</p>
                  </Col>
                  <Col span={16}>
                  { this.state.loading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
                  :
                    <React.Fragment>
                      {this.state.errors.ipError ?
                        <React.Fragment>
                          <Input style={{width: 450, borderColor: 'red'}} name="ip" id='ip' onBlur={e => this.setIp(e)} />
                          <p style={{color: 'red'}}>{this.state.errors.ipError}</p>
                        </React.Fragment>
                      :
                        <Input defaultValue={this.state.request.ip} style={{width: 450}} name="ip" id='ip' onBlur={e => this.setIp(e)} />
                      }
                    </React.Fragment>
                  }
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    { this.state.request.ip ?
                      <Button type="primary" onClick={() => this.releaseIp()} >
                        IP release
                      </Button>
                    :
                      <Button type="primary" disabled>
                        IP release
                      </Button>
                    }
                  </Col>
                </Row>
              </React.Fragment>




            }
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }

      </Modal>

      {this.state.visible ?
        <React.Fragment>
          { this.props.ipDetailError ? <Error component={'ipRelease'} error={[this.props.ipDetailError]} visible={true} type={'ipDetailError'} /> : null }
          { this.props.ipReleaseError ? <Error component={'ipRelease'} error={[this.props.ipReleaseError]} visible={true} type={'ipReleaseError'} /> : null }
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

  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipDetailError: state.infoblox.ipDetailError,
  ipReleaseError: state.infoblox.ipReleaseError,
}))(ReleaseIp);
