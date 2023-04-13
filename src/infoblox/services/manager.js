import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../_helpers/Rest"
import Error from '../error'

import {
  assets,
  assetsError
} from '../store'

import IpComponent from './ipComponent'
import RequestIp from './requestIp'
import ReleaseIp from './releaseIp'
import AssignCloudNetwork from './assignCloudNetwork'

import { Row, Col } from 'antd';



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if (!this.props.assetsError) {
        if (!this.props.assets) {
          this.assetsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(assets( resp ))
      },
      error => {
        this.props.dispatch(assetsError(error))
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }


  render() {

    return (
      <React.Fragment >
        <Row>
          <Col span={4} offset={2} >
            <IpComponent service='ip details'/>
          </Col>

          <Col span={4} offset={2}>
            <RequestIp/>
          </Col>

          <Col span={4} offset={2} >
            <IpComponent service='ip modify'/>
          </Col>

          <Col span={4} offset={2}>
            <ReleaseIp/>
          </Col>
        </Row>

        <br/>

        <Row>
          <Col span={4} offset={2}>
            <AssignCloudNetwork service='ip details'/>
          </Col>
        </Row>

        { this.props.assetsError ? <Error component={'services manager infoblox'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations.infoblox,

  assets: state.infoblox.assets,
  assetsError: state.infoblox.assetsError,
}))(Manager);
