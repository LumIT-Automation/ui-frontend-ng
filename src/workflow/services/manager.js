import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Authorizators from '../../_helpers/authorizators'

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

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  workflowRemoveHost = a => {
    let author = new Authorizators()
    return author.workflowRemoveHost(a)
  }

  workflowAddHost = a => {
    let author = new Authorizators()
    return author.workflowAddHost(a)
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          {this.authorizatorsSA(this.props.authorizations) || (this.props.authorizationsWorkflow && this.workflowRemoveHost(this.props.authorizationsWorkflow) ) ?
            <Col span={8} offset={2}>
              <p>Remove host from firewall if not a network gateway</p>
              <RemoveHost/>
            </Col>
          :
            null
          }

          {this.authorizatorsSA(this.props.authorizations) || (this.props.authorizationsWorkflow && this.workflowAddHost(this.props.authorizationsWorkflow) ) ?
            <Col span={8} offset={2}>
              <p>Add host in firewall if it exists in ipam</p>
              <AddHost/>
            </Col>
          :
            null
          }
        </Row>

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations,
  authorizationsWorkflow: state.authorizations.workflow,
}))(Manager);
