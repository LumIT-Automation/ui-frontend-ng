import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import { setAssetsFetch } from '../../_store/store.f5'

import CreateLoadBalancer from './createF5Service'
import DeleteLoadBalancer from './deleteF5Service'
import PoolMaintenance from './poolMaintenance/manager'
import { Row, Col } from 'antd';



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

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
}))(Manager);
