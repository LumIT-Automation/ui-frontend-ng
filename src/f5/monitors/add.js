import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setMonitorsFetch } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result, Select } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



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

class Add extends React.Component {

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
  }

  setMonitorName = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.name = e.target.value
      delete errors.nameError
    }
    else {
      errors.nameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setMonitorType = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      body.monitorType = e
      delete errors.monitorTypeError
      }
      else {
        errors.monitorTypeError = 'error'
      }
      this.setState({body: body, errors: errors})
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

  addMonitor = async () => {
    let body = Object.assign({}, this.state.body);

    if (isEmpty(body)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});
      const body = {
        "data":
          {
            "address": this.state.body.address,
            "name": this.state.body.name,
            "state": this.state.body.monitorType,
            "interval": this.state.body.interval,
            "timeout": this.state.body.timeout
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, success: true}, () => this.success())
        },
        error => {
          this.setState({loading: false, success: false, error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${this.state.body.monitorType}/`, this.props.token, body)
    }
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.props.dispatch(setMonitorsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  resetError = () => {
    this.setState({ error: null})
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
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.success &&
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Name"
              name="name"
              key="name"
              validateStatus={this.state.errors.mameError}
              help={this.state.errors.nameError ? 'Please input a valid name' : null }
            >
              <Input id='name' placeholder="name" onBlur={e => this.setMonitorName(e)}/>
            </Form.Item>

            <Form.Item
              label="Monitor Type"
              name="monitorType"
              key="monitorType"
              validateStatus={this.state.errors.monitorTypeError}
              help={this.state.errors.monitorTypeError ? 'Please select monitor type' : null }
            >
              <Select onChange={p => this.setMonitorType(p)} >
                {this.props.monitorTypes ? this.props.monitorTypes.map((m, i) => {
                  return (
                    <Select.Option  key={i} value={m}>{m}</Select.Option>
                  )
              }) : null}
              </Select>
            </Form.Item>

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
              <Button type="primary" onClick={() => this.addMonitor()}>
                Add Monitor
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
  monitorTypes: state.f5.monitorTypes
}))(Add);
