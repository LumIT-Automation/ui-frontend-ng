import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../_helpers/Rest"
import Error from '../error'

import RemoveHost from './removeHost'
import AddHost from './addHost'

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
          <Col span={8} offset={2}>
            <p>Remove host from firewall if not a network gateway</p>
            <RemoveHost/>
          </Col>
          <Col span={8} offset={2}>
            <p>Add host in firewall if it exists in ipam</p>
            <AddHost/>
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
