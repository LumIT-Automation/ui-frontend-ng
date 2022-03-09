import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  virtualServers,
  virtualServersLoading,
  virtualServersError,
  serviceDeleteError
} from '../store.f5'

import AssetSelector from '../../f5/assetSelector'

import { Modal, Alert, Result, Button, Spin, Divider, Row, Col, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class DeleteF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      request: {}
    };
  }

  componentDidMount() {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) ) {
        this.fetchVirtualServers()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.fetchVirtualServers()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  fetchVirtualServers = async () => {
    this.props.dispatch(virtualServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(virtualServers(resp))
      },
      error => {
        this.props.dispatch(virtualServersError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
    this.props.dispatch(virtualServersLoading(false))
  }

  setServiceName = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serviceName = e
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.serviceName) {
      errors.serviceNameError = true
      errors.serviceNameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.serviceNameError
      delete errors.serviceNameColor
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.serviceDelete()
    }

  }

  serviceDelete = async () => {
    let serviceName = this.state.request.serviceName
    this.setState({loading: true})

    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true})
        this.response()
      },
      error => {
        this.props.dispatch(serviceDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/${serviceName}/`, this.props.token )

  }

  response = () => {
    //setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      response: false,
      request: {}
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>DELETE LOAD BALANCER</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>DELETE LOAD BALANCER</p>}
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

          { ( (this.props.asset && this.props.asset.id) && this.props.partition ) ?
            <React.Fragment>
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Service Deleted"
                 />
              }

              {!this.state.response ?
                <React.Fragment>
                  <Row>
                    <Col offset={2} span={6}>
                      <p style={{marginRight: 25, float: 'right'}}>Service Name:</p>
                    </Col>
                    <Col span={16}>
                      { this.props.virtualServersLoading ?
                        <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                      :
                        <React.Fragment>
                          { this.props.virtualServers && this.props.virtualServers.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.serviceNameError ?
                                <Select
                                  defaultValue={this.state.request.serviceName}
                                  value={this.state.request.serviceName}
                                  showSearch
                                  style={{width: 450, border: `1px solid ${this.state.errors.serviceNameColor}`}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.setServiceName(n)}
                                >
                                  <React.Fragment>
                                    {this.props.virtualServers.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              :
                              <React.Fragment>
                                { this.state.loading ?
                                  <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                                :
                                  <Select
                                    defaultValue={this.state.request.serviceName}
                                    value={this.state.request.serviceName}
                                    showSearch
                                    style={{width: 450}}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    filterSort={(optionA, optionB) =>
                                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                    }
                                    onSelect={n => this.setServiceName(n)}
                                  >
                                    <React.Fragment>
                                      {this.props.virtualServers.map((n, i) => {
                                        return (
                                          <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                        )
                                      })
                                      }
                                    </React.Fragment>
                                  </Select>
                                }
                              </React.Fragment>

                              }
                            </React.Fragment>
                          :
                            null
                          }
                        </React.Fragment>
                      }
                    </Col>
                  </Row>

                  <br/>

                  <Row>
                    <Col offset={2} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove node:</p>
                    </Col>
                    <Col span={16}>
                      <Button type="danger" onClick={() => this.validation()}>
                        Delete Service
                      </Button>
                    </Col>
                  </Row>

                  <br/>

                </React.Fragment>
              :
                null
              }
            </React.Fragment>
          :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.virtualServersError ? <Error component={'delete loadbalancer'} error={[this.props.virtualServersError]} visible={true} type={'virtualServersError'} /> : null }
            { this.props.serviceDeleteError ? <Error component={'delete loadbalancer'} error={[this.props.serviceDeleteError]} visible={true} type={'serviceDeleteError'} /> : null }
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
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  virtualServers: state.f5.virtualServers,
  virtualServersLoading: state.f5.virtualServersLoading,
  virtualServersError: state.f5.virtualServersError,
  serviceDeleteError: state.f5.serviceDeleteError
}))(DeleteF5Service);
