import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from '../../_helpers/Rest'

import { setAssetsFetch } from '../../_store/store.f5'

import AssetSelector from './assetSelector'
import CreateLoadBalancer from './createF5Service'
import DeleteLoadBalancer from './deleteF5Service'
import PoolMaintenance from './poolMaintenance/manager'

import { Row, Col, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if (!this.props.assets) {
        this.props.dispatch(setAssetsFetch(true))
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if (!this.props.assets) {
        this.props.dispatch(setAssetsFetch(true))
      }
    }
  }

  componentWillUnmount() {
  }




  render() {
    return (
      <React.Fragment >

        <Row>
        {/*
          <Row>
            <div style={{margin: '0 150px'}}>
              <AssetSelector/>
            </div>
          </Row>
          <Divider/>
        */}
          <Row>
          </Row>
          <Col span={4} offset={2} >
            <p>Create Load Balancer</p>
            <CreateLoadBalancer/>
          </Col>

          <Col span={4} offset={2}>
            <p>Delete Load Balancer</p>
            <DeleteLoadBalancer/>
          </Col>

          <Col span={4} offset={2}>
            <p>Pool Maintenance</p>
            <PoolMaintenance/>
          </Col>

        </Row>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
}))(Manager);
