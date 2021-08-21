import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { Space, Form, Input, Result, Button, Select, Spin, Modal, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { setWorkflowStatus } from '../_store/store.workflows'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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

class DeleteL4NoSnat extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      body: {
        service: 'Layer4 No SNAT',
        type: "L4",
        source: "0.0.0.0/0",
        nodesNumber: 0,
        nodes: []
      }
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

  setServiceName = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      body.serviceName = e.target.value
      delete errors.serviceNameError
    }
    else {
      errors.serviceNameError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  deleteService = async () => {
    let errors = Object.assign({}, this.state.errors);
    let serviceName = this.state.body.serviceName
    this.setState({message: null})

    this.setState({loading: true})

    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, success: true})
        this.success()
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/${serviceName}/`, this.props.token )

  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    this.props.dispatch(setWorkflowStatus( 'deleted' ))
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
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center', padding: 24}}>

      { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
      { !this.state.loading && this.state.success &&
        <Result
           status="success"
           title="Service Deleted"
         />
      }
      { !this.state.loading && !this.state.success &&
        <Form
          {...layout}
          name="basic"
          initialValues={{

          }}
          onFinish={null}
          onFinishFailed={null}
        >

          <Form.Item
            label="Service Name"
            name='serviceName'
            key="serviceName"
            validateStatus={this.state.errors.serviceNameError}
            help={this.state.errors.serviceNameError ? 'Please input a valid Service Name' : null }
          >
            <Input id='name' onChange={e => this.setServiceName(e)} />
          </Form.Item>
          { this.state.body.serviceName ?
            <Form.Item
              wrapperCol={ {offset: 8 }}
              name="button"
              key="button"
            >
              <Button type="danger" onClick={() => this.deleteService()}>
                Delete Service
              </Button>
            </Form.Item>
            :
            null
        }

        </Form>
      }

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
  nodes: state.f5.nodes
}))(DeleteL4NoSnat);
