import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import AssetSelector from './assetSelector'
import CreateF5ervice from './createF5Service'
import DeleteF5ervice from './deleteF5Service'
import PoolMainenance from './poolMaintenance/manager'


import { Space, Modal, Table, Result, List, Button, Divider, Alert } from 'antd';

import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { setWorkflowStatus } from '../_store/store.workflows'

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

class ModalCustom extends React.Component {

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
    if (this.props.workflowStatus === 'created') {
      this.success()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    this.props.dispatch(setWorkflowStatus( '' ))
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }

  ComponentToRender = () => {
    switch (this.props.obj.service) {
      case 'F5 - Create Service':
        return (
          <CreateF5ervice/>
        )
        break
      case 'F5 - Delete Service':
        return (
          <DeleteF5ervice/>
        )
        break
      case 'F5 - Pool Maintenance':
        return (
          <PoolMainenance/>
        )
        break
      case 'Papayas':

        // expected output: "Mangoes and papayas are $2.79 a pound."
        break;
      default:
        console.log(`Sorry, we are out of .`);
    }

  }


  render() {
    return (
      <Space direction='vertical'>

        <Button type="primary" onClick={() => this.details()}>
          Run
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.obj.service}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          <div style={{margin: '0 150px'}}>
            <AssetSelector />
          </div>
          <Divider/>
          { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
            this.ComponentToRender()
            :
            <Alert message="Asset and Partition not set" type="error" />
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
  assetList: state.f5.assetList,
  asset: state.f5.asset,
  partition: state.f5.partition,
  workflowStatus: state.workflows.workflowStatus
}))(ModalCustom);
