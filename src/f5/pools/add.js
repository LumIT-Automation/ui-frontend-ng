import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  poolsFetch,
  poolAddError
} from '../store.f5'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const monIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      lbMethods: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      request: {},
      errors: {}
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

  //FETCH


  //SETTERS
  setName = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }
  setLbMethod = e => {
    let request = Object.assign({}, this.state.request)
    request.lbMethod = e
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

    if (!request.name) {
      errors.nameError = true
      errors.nameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      delete errors.nameColor
      this.setState({errors: errors})
    }

    if (!request.lbMethod) {
      errors.lbMethodError = true
      errors.lbMethodColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.lbMethodError
      delete errors.lbMethodColor
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
      this.poolAdd()
    }
  }

  poolAdd = async () => {
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "monitor": this.state.request.monitor,
      "loadBalancingMode": this.state.request.lbMethod
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true, error: false}, () => this.response())
      },
      error => {
        this.props.dispatch(poolAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 1000)
    setTimeout( () => this.props.dispatch(poolsFetch(true)), 1030)
    setTimeout( () => this.closeModal(), 1050)
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

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD POOL</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.nameError ?
                    <Input style={{width: 250, borderColor: this.state.errors.nameColor}} name="name" id='name' onChange={e => this.setName(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} name="name" id='name' onChange={e => this.setName(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Loadbalancing Method:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                    { this.state.lbMethods && this.state.lbMethods.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.lbMethodError ?
                          <Select
                            value={this.state.request.lbMethod}
                            showSearch
                            style={{width: 250, border: `1px solid ${this.state.errors.lbMethodColor}`}}
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
                              {this.state.lbMethods.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.lbMethod}
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
                              {this.state.lbMethods.map((n, i) => {
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
                    Add Pool
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.poolAddError ? <Error component={'add pool'} error={[this.props.poolAddError]} visible={true} type={'poolAddError'} /> : null }
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
  poolAddError: state.f5.poolAddError,
}))(Add);
