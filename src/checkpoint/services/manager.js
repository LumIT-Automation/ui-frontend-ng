import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  assets,
} from '../store'

import VpnToServices from './vpnToServices'
import VpnToHost from './vpnToHost'
import HostToGroup from './hostToGroup'
import { Row, Col } from 'antd'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if (!this.props.error && !this.props.assets) {
        this.assetsGet()
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
        error = Object.assign(error, {
          component: 'cpServiceManager',
          vendor: 'checkpoint',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR("checkpoint/assets/", this.props.token)
  }



  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'cpServiceManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <Row>
          <Col span={4} offset={2}>
            <VpnToServices/>
          </Col>
          <Col span={4} offset={2}>
            <VpnToHost/>
          </Col>
          <Col span={4} offset={2}>
            <HostToGroup/>
          </Col>
        </Row>

        {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  assets: state.checkpoint.assets,
}))(Manager);
