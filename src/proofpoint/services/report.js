import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Select, Button, Divider, Spin, Table, Space, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  err,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'


const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class RemoveHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      
    };
  }

  componentDidMount() {
    //this.checkedTheOnlyAsset()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
    //this.main()
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {}
    })
  }


  render() {

    
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>GENERATE REPORT</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.type}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='proofpoint'/>

          <Divider/>

          { (this.props.asset && this.props.asset.id) ?
            <React.Fragment>

            </React.Fragment>
          :
            <Alert message="Asset not set" type="error" />
          }
        </Modal>
      </React.Fragment>
    )
  }

}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  
}))(RemoveHost);