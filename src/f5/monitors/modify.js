import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import { monitorsFetch, modifyMonitorError } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />




const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
}

class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      request: {},
      monitorFullList: []
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

  setInterval = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      request.interval = parseInt(e.target.value)
      delete errors.intervalError
    }
    else {
      errors.nameError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setTimeout = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      request.timeout = parseInt(e.target.value)
      delete errors.timeoutError
      }
      else {
        errors.timeoutError = 'error'
      }
      this.setState({request: request, errors: errors})
  }

  modifyMonitor = async () => {
    let request = Object.assign({}, this.state.request)

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});

      const b = {
        "data":
          {
              "destination": "*:*",
              "interval": this.state.request.interval,
              "manualResume": "disabled",
              "timeUntilUp": 0,
              "timeout": this.state.request.timeout,
              "transparent": "disabled",
              "upInterval": 0
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.props.dispatch(modifyMonitorError(error))
          this.setState({loading: false, response: false})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${this.props.obj.type}/${this.props.obj.name}/`, this.props.token, b )
    }
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
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              address: this.state.request.address,
              name: this.state.request.name
            }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Interval"
              name="interval"
              key="interval"
              validateStatus={this.state.errors.intervalError}
              help={this.state.errors.intervalError ? 'Please input a valid interval' : null }
            >
              <Input id='interval' placeholder="interval seconds" onBlur={e => this.setInterval(e)}/>
            </Form.Item>

            <Form.Item
              label="Timeout"
              name="timeout"
              key="timeout"
              validateStatus={this.state.errors.timeoutError}
              help={this.state.errors.timeoutError ? 'Please set a valid timeout' : null }
            >
              <Input id='timeout' placeholder="timeout seconds" onBlur={e => this.setTimeout(e)}/>
            </Form.Item>

            {this.state.message ?
              <Form.Item
                wrapperCol={ {offset: 8, span: 16 }}
                name="message"
                key="message"
              >
                <p style={{color: 'red'}}>{this.state.message}</p>
              </Form.Item>

              : null
            }

            <Form.Item
              wrapperCol={ {offset: 8, span: 16 }}
              name="button"
              key="button"
            >
              <Button type="primary" onClick={() => this.modifyMonitor()}>
                Modify Monitor
              </Button>
            </Form.Item>

          </Form>
        }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.modifyMonitorError ? <Error component={'modify monitor'} error={[this.props.modifyMonitorError]} visible={true} type={'modifyMonitorError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  modifyMonitorError: state.f5.modifyMonitorError
}))(Modify);
