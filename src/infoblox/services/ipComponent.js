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



class IpComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {
        ip: ''
      },
      ipDetailsResponse: [],
      ipModifyResponse: []
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

  set = async (e, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = e
    if (key === 'serverName' && request.options) {
      request.options.forEach((item, i) => {
        if (item.num === 12) {
          item.value = e
        }
      });
    }
    await this.setState({request: request})
  }

  validationChecks = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let validators = new Validators()

    for (const key in request) {
      if (key === 'ip') {
        if (validators.ipv4(request[key])) {
          delete errors[`${key}Error`]
          this.setState({errors: errors})
        }
        else {
          errors[`${key}Error`] = true
          this.setState({errors: errors})
        }
      }
      if (key === 'macAddress') {
        if (this.state.request.macAddress === '' || this.state.request.macAddress === undefined) {
          request.macAddress = '00:00:00:00:00:00'
          this.setState({request: request})
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
      if (key === 'serverName') {
        if (!request.serverName) {
          errors.serverNameError = true
          this.setState({errors: errors})
        }
        else {
          delete errors.serverNameError
          this.setState({errors: errors})
        }
      }
    }
    return errors
  }

  validation = async(action) => {
    await this.validationChecks()

    if (Object.keys(this.state.errors).length === 0) {
      if (action === 'ip details') {
        this.ipDetail()
      }
      if (action === 'ip modify') {
        this.ipModify()
      }
    }
  }

  ipDetail = async () => {
    this.setState({ipRequestLoading: true})
    let request = JSON.parse(JSON.stringify(this.state.request))
    let rest = new Rest(
      "GET",
      resp => {
        let r = JSON.parse(JSON.stringify(resp.data))
        if (this.props.service === 'ip modify') {
          if (r.extattrs && r.extattrs['Name Server']) {
            r.serverName = r.extattrs['Name Server'].value
          }
          r.macAddress = r.mac_address

          request.serverName = r.serverName
          request.macAddress = r.macAddress
          request.status = r.status
          request.options = r.objects[0].options

        }
        if (r.objects && r.objects[0] && r.objects[0].options) {
          r.objects[0].options.forEach((item, i) => {
            if (item.num === 12) {
              r.option12 = item.value
            }
          });

        }
        let list = []
        list.push(r)


        this.setState({ipDetailsResponse: list, request: request})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({ipRequestLoading: false})
  }

  ipModify = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let b = {}
    b.data = {
      "mac": `${request.macAddress}`,
      "extattrs": {
          "Name Server": {
              "value": `${request.serverName}`
          }
      },
    }

    if (request.options) {
      b.data.options = request.options
    }


    this.setState({ipModifyLoading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({ipModifyLoading: false})
        this.ipDetail()
      },
      error => {
        this.setState({ipModifyLoading: false}, () => this.props.dispatch(ipModifyError(error)) )
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${request.ip}/`, this.props.token, b )
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {ip: ''},
      ipDetailsResponse: [],
      errors: {}
    })
  }


  render() {

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {
        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
              onChange={event => this.set(event.target.value, key)}
              onPressEnter={() => this.validation(action)}
            />
          )
          break;

        default:

      }

    }

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
      this.props.service === 'ip details' ?
        {
          title: 'Name Server',
          align: 'center',
          dataIndex: ['extattrs', 'Name Server', 'value'],
          key: 'nameServer',
        }
      :
        {
          title: 'Server Name',
          align: 'center',
          dataIndex: ['extattrs', 'Name Server', 'value'],
          key: 'nameServer',
          render: (name, obj)  => (
            <React.Fragment>
              {createElement('input', 'serverName', '', obj, 'ip modify')}
            </React.Fragment>
          ),
        },
      this.props.service === 'ip details' ?
        {
          title: 'Mac address',
          align: 'center',
          dataIndex: 'mac_address',
          key: 'mac_address',
        }
      :
        {
          title: 'Mac address',
          align: 'center',
          dataIndex: 'mac_address',
          key: 'mac_address',
          render: (name, obj)  => (
            <React.Fragment>
              {createElement('input', 'macAddress', '', obj, 'ip modify')}
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
        key: 'recordA',
      },
      {
        title: 'Option 12 (DHCP)',
        align: 'center',
        dataIndex: 'option12',
        key: 'option12',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.option12 ? obj.option12 : null}
          </React.Fragment>
        ),
      },
      {
        title: 'Range Reference',
        align: 'center',
        width: 200,
        //dataIndex: ['extattrs', 'Reference', 'value'],
        key: 'reference',
        render: (name, obj)  => (
          <React.Fragment>
          {obj.extattrs && obj.extattrs && obj.extattrs.Reference && obj.extattrs.Reference.value ?
            obj.extattrs.Reference.value
          :
            '-'
          }
          </React.Fragment>
        ),
      },
      {
        title: 'IP Reference',
        align: 'center',
        width: 200,
        //dataIndex: ['objects', 'extattrs', 'Reference', 'value'],
        key: 'reference',
        render: (name, obj)  => (
          <React.Fragment>
          {obj.objects && obj.objects[0] && obj.objects[0].extattrs && obj.objects[0].extattrs.Reference && obj.objects[0].extattrs.Reference.value ?
            obj.objects[0].extattrs.Reference.value
          :
            '-'
          }
          </React.Fragment>
        ),
      },

    ];

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>{this.props.service.toUpperCase()}</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.service.toUpperCase()}</p>}
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
              <Row>
                <Col offset={6} span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP address:</p>
                </Col>
                <Col span={15}>
                { this.state.ipRequestLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
                :
                  <React.Fragment>
                    <Row>
                      <Col span={8}>
                        {createElement('input', 'ip', '', '', 'ip details')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                }
                </Col>
              </Row>
              <Row>
                <Col offset={8} span={16}>
                  <Button
                    type="primary"
                    onClick={() => this.validation('ip details')}
                  >
                    ip details
                  </Button>
                </Col>
              </Row>

              <Divider/>

            { (this.state.ipDetailsResponse.length < 1 || this.state.ipRequestLoading)?
              null
            :
              <React.Fragment>
                <Table
                  columns={columns}
                  dataSource={this.state.ipDetailsResponse}
                  bordered
                  rowKey="ip"
                  scroll={{x: 'auto'}}
                  pagination={false}
                  style={{marginBottom: 10}}
                />
                  {(this.props.service === 'ip details') ?
                    null
                  :
                   (( this.state.ipDetailsResponse && this.state.ipDetailsResponse[0] && this.state.ipDetailsResponse[0].status === 'USED' ) ?
                    <Button
                      type="primary"
                      onClick={() => this.validation('ip modify')}
                    >
                      ip modify
                    </Button>
                  :
                    <Button
                      type="primary"
                      disabled
                    >
                      ip modify
                    </Button>
                  )
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
            { this.props.ipDetailError ? <Error component={'ipDetail'} error={[this.props.ipDetailError]} visible={true} type={'ipDetailError'} /> : null }
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
}))(IpComponent);
