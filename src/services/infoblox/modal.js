import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import F5AssetSelector from './f5AssetSelector'
import InfobloxAssetSelector from './infobloxAssetSelector'

import CreateF5ervice from './createF5Service'
import DeleteF5ervice from './deleteF5Service'
import PoolMainenance from './poolMaintenance/manager'

import InfoIp from './infoIp'
import RequestIp from './requestIp'
import ModifyIp from './modifyIp'
import ReleaseIp from './releaseIp'


import { Space, Modal, Table, Result, List, Button, Divider, Alert } from 'antd';

import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { setWorkflowStatus } from '../../_store/store.workflows'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



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
      case 'INFOBLOX - Info IP':
        return (
          <InfoIp/>
        )
        break
      case 'INFOBLOX - Request IP':
        return (
          <RequestIp/>
        )
        break
      case 'INFOBLOX - Modify IP':
        return (
          <ModifyIp/>
        )
        break
      case 'INFOBLOX - Release IP':
        return (
          <ReleaseIp/>
        )
        break
      case 'Papayas':

        // expected output: "Mangoes and papayas are $2.79 a pound."
        break;
      default:
      //
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
          { (this.props.obj.service.includes('F5')) ?
          <React.Fragment>
            <div style={{margin: '0 150px'}}>
              <F5AssetSelector />
            </div>

          <Divider/>
          { ((this.props.f5Asset) && (this.props.f5Asset.id && this.props.partition) ) ?
            this.ComponentToRender()
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
          </React.Fragment>
          :
          <React.Fragment>
            <div style={{margin: '0 300px'}}>
              <InfobloxAssetSelector />
            </div>

          <Divider/>
          { ( this.props.infobloxAsset && this.props.infobloxAsset.id ) ?
            this.ComponentToRender()
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
          </React.Fragment>
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
  f5Asset: state.f5.asset,
  partition: state.f5.partition,
  infobloxAsset: state.infoblox.asset,
  workflowStatus: state.workflows.workflowStatus
}))(ModalCustom);
