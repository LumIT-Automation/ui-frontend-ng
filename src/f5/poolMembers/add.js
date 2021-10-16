import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setPoolMembersFetch, setPoolMembersLoading } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
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
      nodesNumber: 0,
      name: '',
      port: 0
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

  setMemberName = (name) => {
    let errors = Object.assign({}, this.state.errors);
    if (name) {
      this.setState({name: name, errors: errors})
    }
    else {
      errors.memberNameError = 'error'
    }

  }

  setMemberPort = e => {
    let errors = Object.assign({}, this.state.errors);

    let port = e.target.value
    if (isNaN(port)) {
      errors.memberPortError = 'error'
    }
    else {
      this.setState({port: port, errors: errors})
    }
  }


  addPoolMember = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if ( isEmpty(this.state.port) || isEmpty(this.state.name) )  {
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});

      const body = {
        "data":
          {
            "name": `${this.state.name}:${this.state.port}`,
            "connectionLimit": 0,
            "dynamicRatio": 1,
            "ephemeral": "false",
            "inheritProfile": "enabled",
            "logging": "disabled",
            "monitor": "default",
            "priorityGroup": 0,
            "rateLimit": "disabled",
            "ratio": 1,
            "state": "up",
            "fqdn": {
                "autopopulate": "disabled"
            }
          }
      }
      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, error: false, success: true}, () => this.props.dispatch(setPoolMembersFetch(true)) )
          this.success()
        },
        error => {
          this.setState({error: error}, () => this.props.dispatch(setPoolMembersLoading(false)))
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/members/`, this.props.token, body)
    }
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2100)

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

        <Button icon={addIcon} style={{marginLeft: '200px'}} type='primary' onClick={() => this.details()} shape='round'/>

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
                label="Member"
                name='name'
                key='name'
                validateStatus={this.state.errors.memberNameError}
                help={this.state.errors.memberNameError ? 'Please input a valid name' : null }
              >
                <Select onChange={m => this.setMemberName(m)} >
                  {this.props.nodes ? this.props.nodes.map((p, i) => {
                    return (
                      <Select.Option key={i} value={p.name}>{p.address} - {p.name}</Select.Option>
                    )
                }) : null}
                </Select>

              </Form.Item>

              <Form.Item
                label="Port"
                name='port'
                key='port'
                validateStatus={this.state.errors.memberPortError}
                help={this.state.errors.memberPortError ? 'Please input a valid port' : null }
              >
                <Input placeholder='port' onBlur={e => this.setMemberPort(e)}/>
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
              <Button type="primary" onClick={() => this.addPoolMember()}>
                Add PoolMember
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
  nodes: state.f5.nodes,
}))(Add);
