import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setMonitorsFetch } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select } from 'antd';

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
      body: {},
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
    let body = Object.assign({}, this.props.obj)
    this.setState({body: body})
  }

  setInterval = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.interval = parseInt(e.target.value)
      delete errors.intervalError
    }
    else {
      errors.nameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setTimeout = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.timeout = parseInt(e.target.value)
      delete errors.timeoutError
      }
      else {
        errors.timeoutError = 'error'
      }
      this.setState({body: body, errors: errors})
  }

  modifyMonitor = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (isEmpty(body)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});

      const body = {
        "data":
          {
              "destination": "*:*",
              "interval": this.state.body.interval,
              "manualResume": "disabled",
              "timeUntilUp": 0,
              "timeout": this.state.body.timeout,
              "transparent": "disabled",
              "upInterval": 0
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, success: true}, () => this.success())
        },
        error => {
          this.setState({loading: false, success: false, error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${this.props.obj.type}/${this.props.obj.name}/`, this.props.token, body )
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.props.dispatch(setMonitorsFetch(true)), 2030)
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
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Updated"
           />
        }
        { !this.state.loading && !this.state.success &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              address: this.state.body.address,
              name: this.state.body.name
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


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors
}))(Modify);
