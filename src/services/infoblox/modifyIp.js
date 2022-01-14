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
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.ip = e.target.value
    this.setState({request: request})
  }

  setMacAddress = (m, id) => {
    let ipDetails = JSON.parse(JSON.stringify(this.state.ipDetails))
    let ipDetail = ipDetails[0]
    ipDetail.macAddress = m.target.value
    this.setState({ipDetails: ipDetails})
  }

  setServerName = (e, id) => {
    let ipDetails = JSON.parse(JSON.stringify(this.state.ipDetails))
    let ipDetail = ipDetails[0]
    ipDetail.serverName = e.target.value
    this.setState({ipDetails: ipDetails})
  }

  validateIp = async () => {
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

  validateMac = async () => {
    let ipDetails = JSON.parse(JSON.stringify(this.state.ipDetails))
    let ipDetail = ipDetails[0]
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.macAddress(ipDetail.macAddress)) {
      console.log('MAC VALIDO')
      errors.macError = null
      this.setState({ipDetails: ipDetails, errors: errors}, () => this.ipModify())
    }
    else if (ipDetail.macAddress === '' || ipDetail.macAddress === undefined) {
      console.log('MAC "" O UNDEFINED')
      ipDetail.macAddress = '00:00:00:00:00:00'
      errors.macError = null
      console.log(ipDetail)
      console.log(ipDetails)
      this.setState({ipDetails: ipDetails, errors: errors}, () => this.ipModify())
    }
    else {
      console.log('MAC INVALID')
      errors.macError = 'Please input a valid mac address'
      this.setState({errors: errors})
    }
  }

  ipDetail = async () => {
    this.setState({iploading: true})
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        let ipDetails = []
        ipDetails.push(resp.data)
        let ipDetail = ipDetails[0]
        ipDetail.macAddress = ipDetails[0].mac_address
        ipDetail.serverName = ipDetails[0].extattrs['Name Server'].value
        console.log(ipDetails)
        console.log(ipDetail)
        this.setState({ipDetails: ipDetails})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({iploading: false})
  }

  ipModify = async () => {
    let ipDetails = JSON.parse(JSON.stringify(this.state.ipDetails))
    let ipDetail = ipDetails[0]
    console.log(this.state.ipDetails)
    console.log(ipDetail)

    ipDetail.isLoading = true
    this.setState({ipDetails: ipDetails})

    const b = {
      "data":
        {
          "mac": `${ipDetail.macAddress}`,
          "extattrs": {
              "Name Server": {
                  "value": `${ipDetail.serverName}`
              }
          },
        }
      }

      console.log(b)

      let rest = new Rest(
        "PATCH",
        resp => {
          ipDetail.isLoading = false
          this.setState({ipDetails: ipDetails}, () => this.ipDetail())
        },
        error => {
          ipDetail.isLoading = false
          this.setState({ipDetails: ipDetails})
          this.props.dispatch(ipModifyError(error))
        }
      )
      await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token, b )

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
            <Input id='nameServer' defaultValue={obj.extattrs['Name Server'].value} onChange={e => this.setServerName(e)} />
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
            {this.state.errors.macError ?
              <React.Fragment>
                <Input id='macAddress' onChange={e => this.setMacAddress(e)} />
                <p style={{color: 'red'}}>{this.state.errors.macError}</p>
              </React.Fragment>
            :
              <Input id='macAddress' defaultValue={obj.mac_address} onChange={e => this.setMacAddress(e)} />
            }
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
          title={<p style={{textAlign: 'center'}}>IP MODIFY</p>}
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
              <React.Fragment>
                <Table
                  columns={columns}
                  dataSource={this.state.ipDetails}
                  bordered
                  rowKey="ip"
                  scroll={{x: 'auto'}}
                  pagination={false}
                  style={{marginBottom: 10}}
                />
                { ( this.state.ipDetails[0].status === 'USED' ) ?
                  <Button type="primary" onClick={() => this.validateMac()}>
                    Modify Ip
                  </Button>
                :
                  <Button type="primary" disabled>
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
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipDetailError: state.infoblox.ipDetailError,
  ipModifyError: state.infoblox.ipModifyError,
}))(ModifyIp);
