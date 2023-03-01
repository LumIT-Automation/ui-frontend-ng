import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  ipDetailError,
  ipModifyError,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class ModifyIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      request: {},
      details: false,
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
    //let request = JSON.parse(JSON.stringify(this.props.obj))
    //this.setState({request: request})
  }

  setIp = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.ip = e.target.value
    this.setState({request: request})
  }

  validateIp = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.ipv4(this.state.request.ip)) {
      delete errors.ipError
      this.setState({errors: errors}, () => this.ipGet())
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }

  ipGet = async () => {
    this.setState({requestLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let request = JSON.parse(JSON.stringify(resp.data))
        request.ip = this.state.request.ip
        if (request.extattrs && request.extattrs['Name Server']) {
          request.serverName = request.extattrs['Name Server'].value
        }
        request.macAddress = request.mac_address
        this.setState({request: request, details: true})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({requestLoading: false})
  }

  setMacAddress = (m, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.macAddress = m.target.value
    this.setState({request: request})
  }

  serverNameSet = (e, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serverName = e.target.value
    this.setState({request: request})
  }

  validationCheck = async () => {
    let request = {}
    if (this.state.request.macAddress === '' || this.state.request.macAddress === undefined) {
      request = JSON.parse(JSON.stringify(this.state.request))
      request.macAddress = '00:00:00:00:00:00'
      await this.setState({request: request})
    }

    request = JSON.parse(JSON.stringify(this.state.request))

    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.serverName) {
      errors.serverNameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.serverNameError
      this.setState({errors: errors})
    }

    if (!validators.macAddress(request.macAddress)) {
      errors.macAddressError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.macAddressError
      this.setState({errors: errors})
    }
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.ipModify()
    }

  }



  ipModify = async () => {
    let b = {}
    b.data = {
      "mac": `${this.state.request.macAddress}`,
      "extattrs": {
          "Name Server": {
              "value": `${this.state.request.serverName}`
          }
      },
    }

    this.setState({ipModifyLoading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({ipModifyLoading: false})
        this.ipGet()
      },
      error => {
        this.setState({ipModifyLoading: false}, () => this.props.dispatch(ipModifyError(error)) )

      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token, b )
  }


  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ip: null,
      request: {},
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
                  <Input
                    id='nameServer'
                    style={{borderColor: 'red'}}
                    defaultValue={obj.extattrs['Name Server'].value}
                    onChange={e => this.serverNameSet(e)}
                  />
                :
                  <Input
                    id='nameServer'
                    defaultValue={obj.extattrs['Name Server'].value}
                    onChange={e => this.serverNameSet(e)}
                  />
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
            {this.state.errors.macAddressError ?
              <Input
                id='macAddress'
                style={{borderColor: 'red'}}
                defaultValue={obj.mac_address}
                onChange={e => this.setMacAddress(e)}
              />
            :
              <Input
                id='macAddress'
                defaultValue={obj.mac_address}
                onChange={e => this.setMacAddress(e)}
              />
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

        <Button
          type="primary"
          onClick={() => this.details()}
        >
          IP MODIFY
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>IP MODIFY</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='infoblox'/>
          <Divider/>

          { ( this.props.asset && this.props.asset.id ) ?
            <React.Fragment>

              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP address:</p>
                  </Col>
                  <Col span={16}>
                  { this.state.requestLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
                  :
                    <React.Fragment>
                      {this.state.errors.ipError ?
                        <Input
                          value={this.state.request.ip}
                          style={{width: 450, borderColor: 'red'}}
                          name="ip"
                          id='ip'
                          onChange={e => this.setIp(e)}
                          onPressEnter={() => this.validateIp()}
                        />
                      :
                        <Input
                          value={this.state.request.ip}
                          style={{width: 450}}
                          name="ip"
                          id='ip'
                          onChange={e => this.setIp(e)}
                          onPressEnter={() => this.validateIp()}
                        />
                      }
                    </React.Fragment>
                  }
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    <Button type="primary" onClick={() => this.validateIp()} >
                      IP details
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

              <Divider/>

            { !this.state.details ?
              null
            :
              <React.Fragment>
                {this.state.requestLoading ?
                  null
                :
                  <React.Fragment>
                    <Table
                      columns={columns}
                      dataSource={[this.state.request]}
                      bordered
                      rowKey="ip"
                      scroll={{x: 'auto'}}
                      pagination={false}
                      style={{marginBottom: 10}}
                    />
                    { ( this.state.request.status === 'USED' ) ?
                      <Button type="primary" onClick={() => this.validation()}>
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
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipDetailError: state.infoblox.ipDetailError,
  ipModifyError: state.infoblox.ipModifyError,
}))(ModifyIp);
