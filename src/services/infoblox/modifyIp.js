import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/infobloxError"

import {
  ipDetailError,
  ipModifyError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Modal, Alert, Form, Input, Button, Select, Spin, Divider, Table, Row, Col, Space} from 'antd'
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

class ModifyIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      responses: [],
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
    this.setState({ visible: true, requests: [{}] })
  }

  setIp = e => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = requests[0]

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
    this.setState({requests: requests, errors: errors})
  }

  ipDetailHandler = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests[0]

    await this.setState({loading: true})
    let response = await this.ipDetail(request.ip)
    await this.setState({loading: false})

    if (response.status && response.status !== 200) {
      this.props.dispatch(ipDetailError(response))
      return
    }
    request = Object.assign(request, response.data)

    if (response.data.extattrs && response.data.extattrs['Name Server']) {
      request.serverName = response.data.extattrs['Name Server'].value
    }

    if (response.data.mac_address) {
      request.macAddress = response.data.mac_address
    }
    else {
      request.macAddress = '00:00:00:00:00:00'
    }

    await this.setState({requests: requests, infoIp: true})

  }


  ipDetail = async ip => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${ip}/`, this.props.token)
    return r
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


  modifyIp = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests[0]
    request.isLoading = true
    this.setState({requests: requests})

    if (isEmpty(request.serverName)){
      this.setState({message: 'Please fill the form'})
    }
    else {

      const b = {
        "data":
          {
            "mac": `${request.macAddress}`,
            "extattrs": {
                "Name Server": {
                    "value": `${request.serverName}`
                }
            },
          }
        }

        let rest = new Rest(
          "PATCH",
          resp => {
            request.isLoading = false
            this.setState({requests: requests})
            this.ipDetailHandler()
          },
          error => {
            request.isLoading = false
            this.setState({requests: requests})
            this.props.dispatch(ipModifyError(error))
          }
        )
        await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${request.ip}/`, this.props.token, b )
      }
    }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      requests: [],
      infoIp: false,
      response: false,
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
              { !this.state.infoIp &&
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
                          <Input style={{width: 450}} name="ip" id='ip' onBlur={e => this.setIp(e)} />
                        }
                      </React.Fragment>
                    }
                    </Col>
                  </Row>
                  <Row>
                    <Col offset={8} span={16}>
                      { (this.state.requests && this.state.requests[0] && this.state.requests[0].ip) ?
                        <Button type="primary" onClick={() => this.ipDetailHandler()} >
                          IP detail
                        </Button>
                      :
                        <Button type="primary" onClick={() => this.ipDetailHandler()} disabled>
                          IP detail
                        </Button>
                      }
                    </Col>
                  </Row>
                </React.Fragment>

              }
              { !this.state.loading && this.state.infoIp &&
                <React.Fragment>
                  <Table
                    columns={columns}
                    dataSource={this.state.requests}
                    bordered
                    rowKey="ip"
                    scroll={{x: 'auto'}}
                    pagination={false}
                    style={{marginBottom: 10}}
                  />
                  { ( this.state.requests[0].status === 'USED' ) ?
                    <Button type="primary" onClick={() => this.modifyIp()}>
                      Modify Ip
                    </Button>
                  :
                    <Button type="primary" onClick={() => this.modifyIp()} disabled>
                      Modify Ip
                    </Button>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          :
            <Alert message="Asset and Partition not set" type="error" />
          }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.ipDetailError ? <Error component={'ipModify'} error={[this.props.ipDetailError]} visible={true} type={'ipDetailError'} /> : null }
            { this.props.ipModifyError ? <Error component={'ipModify'} error={[this.props.ipModifyError]} visible={true} type={'ipModifyError'} /> : null }
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
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipDetailError: state.infoblox.ipDetailError,
  ipModifyError: state.infoblox.ipModifyError,
}))(ModifyIp);
