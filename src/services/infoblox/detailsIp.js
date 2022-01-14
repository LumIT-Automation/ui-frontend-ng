import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/infobloxError"

import {
  ipDetailError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}



class DetailsIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
      ipDetails: []
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
    console.log(e.target.value)
    let request = JSON.parse(JSON.stringify(this.state.request))

    request.ip = e.target.value

    this.setState({request: request})
  }

//http://10.0.111.21/api/v1/infoblox/1/ipv4/10.8.1.3/

  validateIp = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(this.state.request.ip)) {
      errors.ipError = null
      this.setState({errors: errors})
      this.ipDetail()
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }

  ipDetail = async () => {
    this.setState({iploading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let ipDetails = []
        ipDetails.push(resp.data)
        this.setState({ipDetails: ipDetails})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({iploading: false})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ipDetails: [],
      request: {},
      errors: []
    })
  }


  render() {

    console.log(this.state.request)

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
        title: 'Record A',
        align: 'center',
        dataIndex: 'names',
        key: 'recordA',
      },
    ];

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>IP DETAILS</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>IP DETAILS</p>}
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

              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP address:</p>
                  </Col>
                  <Col span={16}>
                  { this.state.iploading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
                  :
                    <React.Fragment>
                      {this.state.errors.ipError ?
                        <React.Fragment>
                          <Input defaultValue={this.state.request.ip} style={{width: 450, borderColor: 'red'}} name="ip" id='ip' onChange={e => this.setIp(e)} />
                          <p style={{color: 'red'}}>{this.state.errors.ipError}</p>
                        </React.Fragment>
                      :
                        <Input defaultValue={this.state.request.ip} style={{width: 450}} name="ip" id='ip' onChange={e => this.setIp(e)} />
                      }
                    </React.Fragment>
                  }
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    { this.state.request.ip ?
                      <Button type="primary" onClick={() => this.validateIp()} >
                        IP details
                      </Button>
                    :
                      <Button type="primary" disabled>
                        IP details
                      </Button>
                    }
                  </Col>
                </Row>
              </React.Fragment>

              <Divider/>

            { this.state.ipDetails.length < 1 ?
              null
            :
              <Table
                columns={columns}
                dataSource={this.state.ipDetails}
                bordered
                rowKey="ip"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />
            }
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.ipDetailError ? <Error component={'ipDetail'} error={[this.props.ipDetailError]} visible={true} type={'ipDetailError'} /> : null }
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
}))(DetailsIp);
