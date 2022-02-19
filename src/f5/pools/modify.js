import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import PoolMembers from '../poolMembers/manager'

import {
  poolsFetch,
  modifyPoolError
} from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result, Select, Divider, Row, Col } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const monIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};


class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loadBalancingModes: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      request: {},
      errors: {},
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
    console.log(this.props.obj)
    this.setState({visible: true})
    let request = Object.assign({}, this.props.obj)
    this.setState({request: request})
  }


  //FETCH


  //SETTERS
  setLbMethod = e => {
    let request = Object.assign({}, this.state.request)
    request.loadBalancingMode = e
    this.setState({request: request})
  }
  setMonitor = e => {
    let request = Object.assign({}, this.state.request);
    request.monitor = e
    this.setState({request: request})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.loadBalancingMode) {
      errors.loadBalancingModeError = true
      errors.loadBalancingModeColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.loadBalancingModeError
      delete errors.loadBalancingModeColor
      this.setState({errors: errors})
    }

    if (!request.monitor) {
      errors.monitorError = true
      errors.monitorColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.monitorError
      delete errors.monitorColor
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    let validation = await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.modifyPool()
    }
  }

  modifyPool = async () => {
    let request = Object.assign({}, this.state.request)
    const b = {
      "data":
        {
          "monitor": this.state.request.monitor,
          "loadBalancingMode": this.state.request.loadBalancingMode
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(modifyPoolError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(poolsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }


  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {}
    })
  }


  render() {

    return (

      <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<div><p style={{textAlign: 'center'}}>MODIFY</p> <p style={{textAlign: 'center'}}>{this.props.obj.name}</p></div>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Updated"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Loadbalancing Method:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                    { this.state.loadBalancingModes && this.state.loadBalancingModes.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.loadBalancingModeError ?
                          <Select
                            value={this.state.request.loadBalancingMode}
                            showSearch
                            style={{width: 250, border: `1px solid ${this.state.errors.loadBalancingModeColor}`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.setLbMethod(n)}
                          >
                            <React.Fragment>
                              {this.state.loadBalancingModes.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.loadBalancingMode}
                            showSearch
                            style={{width: 250}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.setLbMethod(n)}
                          >
                            <React.Fragment>
                              {this.state.loadBalancingModes.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        }
                      </React.Fragment>
                    :
                      null
                    }
                  </React.Fragment>
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor:</p>
                </Col>
                <Col span={16}>
                  { this.props.monitorsLoading ?
                    <Spin indicator={monIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.props.monitors && this.props.monitors.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.monitorError ?
                            <Select
                              value={this.state.request.monitor}
                              showSearch
                              style={{width: 250, border: `1px solid ${this.state.errors.monitorColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setMonitor(n)}
                            >
                              <React.Fragment>
                                {this.props.monitors.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.fullPath}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              value={this.state.request.monitor}
                              showSearch
                              style={{width: 250}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setMonitor(n)}
                            >
                              <React.Fragment>
                                {this.props.monitors.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.fullPath}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
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
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Modify Pool
                  </Button>
                </Col>
              </Row>

              <Divider/>
              <Form>
              <Form.Item
                label="Members"
                name="memebers"
                key="members"
                noStyle={true}
                validateStatus={this.state.errors.monitorError}
                help={this.state.errors.monitorError ? 'Please select monitor' : null }
              >
                <PoolMembers obj={this.props.obj}/>
              </Form.Item>

              </Form>

            </React.Fragment>
          }


        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.modifyPoolError ? <Error component={'modify pool'} error={[this.props.modifyPoolError]} visible={true} type={'modifyPoolError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  asset: state.f5.asset,
  partition: state.f5.partition,


  monitors: state.f5.monitors,
  monitorsLoading: state.f5.monitorsLoading,
  modifyPoolError: state.f5.modifyPoolError,
}))(Modify);
