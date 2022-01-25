import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../error/infobloxError'

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
      fetchedDetails: [],
      request: {},
      errors: {},
      isModified: null
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
    let ip = e.target.value
    this.setState({ip: ip})
  }

  setMacAddress = (m, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.macAddress = m.target.value
    this.setState({request: request})
  }

  setServerName = (e, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serverName = e.target.value
    this.setState({request: request})
  }

  validateIp = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.ipv4(this.state.ip)) {
      errors.ipError = null
      this.setState({errors: errors}, () => this.fetchedDetails())
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }

  validateMac = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (validators.macAddress(request.macAddress)) {
      delete errors.macError
      delete errors.macColor
      this.setState({errors: errors})
      return true
    }
    else if (request.macAddress === '' || request.macAddress === undefined) {
      request.macAddress = '00:00:00:00:00:00'
      delete errors.macError
      delete errors.macColor
      this.setState({request: request, errors: errors})
      return true
    }
    else {
      errors.macError = 'Please input a valid mac address'
      errors.macColor = 'red'
      this.setState({errors: errors})
      return false
    }
  }

  validateServerName = async () => {
    console.log('valitation servername')
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (request.serverName) {
      delete errors.serverNameError
      delete errors.serverNameColor
      this.setState({errors: errors})
      return true
    }
    else {
      errors.serverNameError = true
      errors.serverNameColor = 'red'
      console.log(errors)
      this.setState({errors: errors})
      console.log(this.state.errors)
      return false
    }
  }

  validationCheck = async () => {

    let mac = await this.validateMac()
    let name = await this.validateServerName()

    console.log(mac)
    console.log(name)
    console.log(this.state.errors)

    if (mac && name) {
      this.ipModify()
    }

  }

  fetchedDetails = async () => {
    console.log('ipDetail')
    this.setState({ipDetailLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let fetchedDetails = []
        fetchedDetails.push(resp.data)
        let ipDetail = fetchedDetails[0]

        ipDetail.macAddress = fetchedDetails[0].mac_address
        if (fetchedDetails[0].extattrs && fetchedDetails[0].extattrs['Name Server']) {
          ipDetail.serverName = fetchedDetails[0].extattrs['Name Server'].value
        }
        this.setState({fetchedDetails: fetchedDetails, ipModifiedDetails: {}, errors: {}})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token)
    this.setState({ipDetailLoading: false})
  }

  ipModify = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    this.setState({ipModifyLoading: true})
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
          this.setState({ipModifyLoading: false})
          this.fetchedDetails()
        },
        error => {
          this.setState({ipModifyLoading: false}, () => this.props.dispatch(ipModifyError(error)) )

        }
      )
      await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token, b )

    }


  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ip: null,
      fetchedDetails: [],
      errors: {}
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
            {this.state.ipModifyLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
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
            {obj.extattrs && obj.extattrs['Name Server'] ?
              <React.Fragment>
                {this.state.errors.serverNameError ?
                  <Input id='nameServer' style={{borderColor: this.state.errors.serverNameColor}} defaultValue={obj.extattrs['Name Server'].value} onChange={e => this.setServerName(e)} />
                :
                  <Input id='nameServer' defaultValue={obj.extattrs['Name Server'].value} onChange={e => this.setServerName(e)} />
                }
              </React.Fragment>
            :
              null
            }
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
              <Input id='macAddress' style={{borderColor: this.state.errors.macColor}} onChange={e => this.setMacAddress(e)} />
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
                  { this.state.ipDetailLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
                  :
                    <React.Fragment>
                      {this.state.errors.ipError ?
                        <React.Fragment>
                          <Input defaultValue={this.state.ip} style={{width: 450, borderColor: 'red'}} name="ip" id='ip' onChange={e => this.setIp(e)} />
                          <p style={{color: 'red'}}>{this.state.errors.ipError}</p>
                        </React.Fragment>
                      :
                        <Input defaultValue={this.state.ip} style={{width: 450}} name="ip" id='ip' onChange={e => this.setIp(e)} />
                      }
                    </React.Fragment>
                  }
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    { this.state.ip ?
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

            { this.state.fetchedDetails.length < 1 ?
              null
              :
              <React.Fragment>
                {this.state.ipDetailLoading ?
                  null
                :
                  <React.Fragment>
                    <Table
                      columns={columns}
                      dataSource={this.state.fetchedDetails}
                      bordered
                      rowKey="ip"
                      scroll={{x: 'auto'}}
                      pagination={false}
                      style={{marginBottom: 10}}
                    />
                    { ( this.state.fetchedDetails[0].status === 'USED' ) ?
                      <Button type="primary" onClick={() => this.validationCheck()}>
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
