import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Row, Col } from 'antd'

import Rest from "../../_helpers/Rest"
import Error from '../error'

import {
  assets,
  err
} from '../store'

import Report from './report'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      if (!this.props.err) {
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
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token)
  }


  render() {
    return (
      <React.Fragment>
        <Row>

          <Col span={4} offset={2} >
            <Report type='Report'/>
          </Col>

        </Row>

        { this.props.err ? <Error component={'services manager proofpoint'} error={[this.props.err]} visible={true} type={'assetsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  assets: state.proofpoint.assets,
  err: state.proofpoint.err,
}))(Manager);
