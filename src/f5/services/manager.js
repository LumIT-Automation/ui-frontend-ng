import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/f5Error'

import {
  assets,
  assetsError
} from '../store.f5'

import L7ServiceCreate from './l7ServiceCreate'
import L4ServiceCreate from './l4ServiceCreate'
import DeleteLoadBalancer from './deleteF5Service'
import PoolMaintenance from './poolMaintenance/manager'
import { Row, Col } from 'antd'



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
          this.fetchAssets()
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


  fetchAssets = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(assets( resp ))
      },
      error => {
        this.props.dispatch(assetsError(error))
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }




  render() {
    return (
      <React.Fragment>
        <Row>
          <Col span={4} offset={2} >
            <p>L7 Load Balancer</p>
            <L7ServiceCreate/>
          </Col>

          <Col span={4} offset={2} >
            <p>L4 Load Balancer</p>
            <L4ServiceCreate/>
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

        { this.props.assetsError ? <Error component={'services manager f5'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations.f5,

  assets: state.f5.assets,
  assetsError: state.f5.assetsError,
}))(Manager);
