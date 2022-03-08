import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  monitorsFetch,
  monitorModifyError
} from '../store.f5'

import { Input, Button, Space, Modal, Spin, Result, Row, Col } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

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
    let request = Object.assign({}, this.props.obj)
    this.setState({request: request})
  }


  //FETCH


  //SETTERS
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
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.monitorModify()
    }
  }

  monitorModify = async () => {
    let b = {}
    b.data = {
        "destination": "*:*",
        "interval": this.state.request.interval,
        "manualResume": "disabled",
        "timeUntilUp": 0,
        "timeout": this.state.request.timeout,
        "transparent": "disabled",
        "upInterval": 0
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(monitorModifyError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${this.props.obj.type}/${this.props.obj.name}/`, this.props.token, b )
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

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<div><p style={{textAlign: 'center'}}>MODIFY MONITOR</p> <p style={{textAlign: 'center'}}>{this.props.obj.name}</p></div>}
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
             title="Updated"
           />
        }
        { !this.state.loading && !this.state.response &&
          <React.Fragment>
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
                  Modify Node
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.monitorModifyError ? <Error component={'modify monitor'} error={[this.props.monitorModifyError]} visible={true} type={'monitorModifyError'} /> : null }
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
  monitorModifyError: state.f5.monitorModifyError
}))(Modify);
