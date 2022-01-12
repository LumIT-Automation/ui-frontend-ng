import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Validators from "../../_helpers/validators"
import Error from "../../error/infobloxError"

import {
  ipDetailError,
  ipModifyError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
}



class ModifyIp extends React.Component {

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

    request.ip = e.target.value

    this.setState({request: request})
  }

//http://10.0.111.21/api/v1/infoblox/1/ipv4/10.8.1.3/
/*
  validate = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    const validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (validIpAddressRegex.test(this.state.request.ip)) {
      this.ipDetail()
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }
*/
  validate = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.ipv4(this.state.request.ip)) {
      errors.ipError = null
      this.setState({errors: errors}, () => this.ipDetail())
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }

  ipDetail = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let ipDetails = []
        ipDetails.push(resp.data)
        this.setState({response: true, ipDetails: ipDetails})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({loading: false})
  }

  setServerName = (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests[0]
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let serverName

    if (e) {
      serverName = e.target.value
      delete errors.serverNameError
    }
    else {
      errors.serverNameError = 'error'
    }
    request.serverName = serverName
    request.errors = errors
    //this.setState({serverName: serverName, errors: errors})
    this.setState({requests: requests})
  }

  setMacAddress = (m, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests[0]
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let mac = m.target.value
    const validMacAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

    if (validMacAddressRegex.test(mac)) {
      let macAddress = mac
      request.macAddress = macAddress
      delete errors.macAddressError
      //this.setState({macAddress: mac, errors: errors})
    }
    else {
      request.macAddress = ''
      errors.macAddressError = 'error'
    }
    request.errors = errors

    this.setState({requests: requests})
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
      ipDetails: [],
      request: {},
      errors: []
    })
  }


  render() {

    const columns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
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
            <Input id='nameServer' defaultValue={obj.serverName} onChange={e => this.setServerName(e)} />
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
            <Input id='nameServer' defaultValue={obj.macAddress} onChange={e => this.setMacAddress(e)} />
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
        title: 'Record A',
        align: 'center',
        dataIndex: 'names',
        key: 'RecordA',
      },
    ];

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>IP MODIFY</Button>

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
            { !this.state.loading && this.state.response &&
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
                      <Button type="primary" onClick={() => this.validate()} >
                        IP modify
                      </Button>
                    :
                      <Button type="primary" disabled>
                        IP modify
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
}))(ModifyIp);
