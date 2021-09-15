import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setVirtualServersList } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, Select } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/

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
      body: {}
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

  modifyVirtualServer = async () => {
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

      let rest = new Rest(
        "PATCH",
        resp => {
          this.setState({loading: false, success: true}, () => this.fetchVirtualServers())
          this.success()
        },
        error => {
          this.setState({loading: false, success: false})
          this.setState({error: error})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/${this.props.obj.name}/`, this.props.token, body )
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }

  fetchVirtualServers = async () => {
    this.setState({loading: true})

    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setVirtualServersList(resp)))

      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
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

        <Button type="primary" onClick={() => this.details()}>
          Modify Virtual Server
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY ASSET</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
        { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
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
              <Input id='name' placeholder="name" onBlur={e => this.setInterval(e)}/>
            </Form.Item>

            <Form.Item
              label="Timeout"
              name="timeout"
              key="timeout"
              validateStatus={this.state.errors.timeoutError}
              help={this.state.errors.timeoutError ? 'Please set a valid timeout' : null }
            >
              <Input id='timeout' placeholder="timeout" onBlur={e => this.setTimeout(e)}/>
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
              <Button type="primary" onClick={() => this.modifyVirtualServer()}>
                Modify Virtual Server
              </Button>
            </Form.Item>

          </Form>
        }

        </Modal>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  virtualServers: state.f5.virtualServers
}))(Modify);
