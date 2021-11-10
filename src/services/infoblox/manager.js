import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import { setAssetsFetch } from '../../_store/store.infoblox'

import DetailsIp from './detailsIp'
import RequestIp from './requestIp'
import ModifyIp from './modifyIp'
import ReleaseIp from './releaseIp'

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
      if(!this.props.infobloxAssets) {
        this.props.dispatch(setAssetsFetch(true))
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    /*if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if(!this.props.infobloxAssets) {

        this.props.dispatch(setAssetsFetch(true))
      }
    }*/
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
            <p>IP details</p>
            <DetailsIp/>
          </Col>

          <Col span={4} offset={2}>
            <p>IP request</p>
            <RequestIp/>
          </Col>

          <Col span={4} offset={2}>
            <p>IP modify</p>
            <ModifyIp/>
          </Col>

          <Col span={4} offset={2}>
            <p>IP release</p>
            <ReleaseIp/>
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
