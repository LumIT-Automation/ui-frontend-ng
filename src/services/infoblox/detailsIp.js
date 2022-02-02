import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../error/infobloxError'

import {
  ipDetailError,
} from '../../_store/store.infoblox'

import AssetSelector from './assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class DetailsIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
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

  //main, fetch, set, validation, call to post, put , delete

  setIp = e => {
    let ip = e.target.value
    this.setState({ip: ip})
  }

  validateIp = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.ipv4(this.state.ip)) {
      delete errors.ipError
      delete errors.ipColor
      this.setState({errors: errors}, () => this.ipDetail())
    }
    else {
      errors.ipError = 'Please input a valid ip'
      errors.ipColor = 'red'
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
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.ip}/`, this.props.token)
    this.setState({iploading: false})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ipDetails: [],
      errors: {}
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
                          <Input defaultValue={this.state.ip} style={{width: 450, borderColor: this.state.errors.ipColor}} name="ip" id='ip' onChange={e => this.setIp(e)} />
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
                    <Button type="primary" onClick={() => this.validateIp()} >
                      IP details
                    </Button>
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
