import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../_helpers/Rest"
import Error from '../error'

import RemoveHost from './removeHost'

import { Row, Col } from 'antd';



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  render() {

    return (
      <React.Fragment >
        <Row>
          <Col span={4} offset={2}>
            <p>Remove Host</p>
            <RemoveHost/>
          </Col>
        </Row>

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations.checkpoint,
}))(Manager);
