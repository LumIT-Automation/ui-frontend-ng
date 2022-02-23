import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  monitorsFetch,
  monitorAddError
} from '../../_store/store.f5'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
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
    let request = Object.assign({}, this.state.request)
    request.name = e.target.value
    this.setState({request: request})
  }

  setMonitorType = e => {
    let request = Object.assign({}, this.state.request)
    request.monitorType = e
    this.setState({request: request})
  }

  setInterval = e => {
    let request = Object.assign({}, this.state.request)
    request.interval = Number(e.target.value)
    this.setState({request: request})
  }

  setTimeout = e => {
    let request = Object.assign({}, this.state.request)
    request.timeout = Number(e.target.value)
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

    if (!request.monitorType) {
      errors.monitorTypeError = true
      errors.monitorTypeColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.monitorTypeError
      delete errors.monitorTypeColor
      this.setState({errors: errors})
    }

    if (!request.interval || !Number.isInteger(request.interval)) {
      errors.intervalError = true
      errors.intervalColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.intervalError
      delete errors.intervalColor
      this.setState({errors: errors})
    }

    if (!request.timeout || !Number.isInteger(request.timeout)) {
      errors.timeoutError = true
      errors.timeoutColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.timeoutError
      delete errors.timeoutColor
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    let validation = await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.monitorAdd()
    }
  }


  //DISPOSAL ACTION
  monitorAdd = async () => {
    let request = Object.assign({}, this.state.request);
    const b = {
      "data":
        {
          "interval": this.state.request.interval,
          "name": this.state.request.name,
          "state": this.state.request.monitorType,
          "interval": this.state.request.interval,
          "timeout": this.state.request.timeout
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(monitorAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${this.state.request.monitorType}/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(monitorsFetch(true)), 2030)
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

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD MONITOR</p>}
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
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                </Col>
                <Col span={16}>
                  { this.state.monitorTypesLoading ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.props.monitorTypes && this.props.monitorTypes.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.monitorTypeError ?
                            <Select
                              value={this.state.request.monitorType}
                              showSearch
                              style={{width: 250, border: `1px solid ${this.state.errors.monitorTypeColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setMonitorType(n)}
                            >
                              <React.Fragment>
                                {this.props.monitorTypes.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              value={this.state.request.monitorType}
                              showSearch
                              style={{width: 250}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setMonitorType(n)}
                            >
                              <React.Fragment>
                                {this.props.monitorTypes.map((n, i) => {
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
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Interval:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.intervalError ?
                    <Input style={{width: 250, borderColor: this.state.errors.intervalColor}} name="interval" id='interval' onChange={e => this.setInterval(e)} />
                  :
                    <Input defaultValue={this.state.request.interval} style={{width: 250}} name="interval" id='name' onChange={e => this.setInterval(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Timeout:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.timeoutError ?
                    <Input style={{width: 250, borderColor: this.state.errors.timeoutColor}} name="timeout" id='timeout' onChange={e => this.setTimeout(e)} />
                  :
                    <Input defaultValue={this.state.request.timeout} style={{width: 250}} name="timeout" id='name' onChange={e => this.setTimeout(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Profile
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.monitorAddError ? <Error component={'add monitor'} error={[this.props.monitorAddError]} visible={true} type={'monitorAddError'} /> : null }
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
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitorTypes: state.f5.monitorTypes,
  monitorAddError: state.f5.monitorAddError
}))(Add);
