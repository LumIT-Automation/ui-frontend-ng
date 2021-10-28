import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import AssetSelector from '../../f5/assetSelector'

import { Modal, Alert, Form, Input, Result, Button, Select, Spin, Divider, TextArea } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



/*

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

class DeleteF5Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      body: { }
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
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/${serviceName}/`, this.props.token )

  }

  resetError = () => {
    this.setState({ error: null})
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
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>DELETE LOAD BALANCER</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>DELETE LOAD BALANCER</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >


          <AssetSelector />
          <Divider/>

          { ( (this.props.asset && this.props.asset.id) && this.props.partition ) ?
            <React.Fragment>
      { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
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
      </React.Fragment>
      :
      <Alert message="Asset and Partition not set" type="error" />
      }
      </Modal>

      {this.props.error ? <Error error={[this.props.error]} visible={true} /> : <Error visible={false} errors={null}/>}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes
}))(DeleteF5Service);
