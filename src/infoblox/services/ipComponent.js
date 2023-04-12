import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  ipDetailError,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class IpComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
      ipDetailsResponse: []
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
    await this.setState({request: request})
    console.log(this.state.request)
  }

  validateIp = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    let validators = new Validators()

    if (validators.ipv4(this.state.request.ip)) {
      delete errors.ipError
      this.setState({errors: errors}, () => this.ipDetail())
    }
    else {
      errors.ipError = 'Please input a valid ip'
      this.setState({errors: errors})
    }
  }

  ipDetail = async () => {
    this.setState({ipRequestLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let r = JSON.parse(JSON.stringify(resp.data))
        if (r.objects && r.objects[0] && r.objects[0].options) {
          r.objects[0].options.forEach((item, i) => {
            console.log(item)
            if (item.num === 12) {
              r.option12 = true
            }
          });

        }
        console.log(r)
        let list = []
        list.push(r)
        this.setState({ipDetailsResponse: list})
      },
      error => {
        this.props.dispatch(ipDetailError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${this.state.request.ip}/`, this.props.token)
    this.setState({ipRequestLoading: false})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {},
      ipDetailsResponse: [],
      errors: {}
    })
  }


  render() {

    let createComponent = (component, key, choices) => {

      switch (component) {
        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => this.set(event.target.value, key)}
            />
          )
          break;

        default:

      }

    }
    console.log(this.state.request)
    console.log(this.state.ipDetailsResponse)

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
            {obj.option12 ? obj.option12.toString() : null}
          </React.Fragment>
        ),
      },
      {
        title: 'Reference',
        align: 'center',
        dataIndex: ['extattrs', 'Reference', 'value'],
        key: 'reference',
      }
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
                        {createComponent('input', 'ip')}
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
                    onClick={() => this.validateIp()}
                  >
                    {this.props.service}
                  </Button>
                </Col>
              </Row>

              <Divider/>

            { this.state.ipDetailsResponse.length < 1 ?
              null
            :
              <Table
                columns={columns}
                dataSource={this.state.ipDetailsResponse}
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
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipDetailError: state.infoblox.ipDetailError,
}))(IpComponent);
