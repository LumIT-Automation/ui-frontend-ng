import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Authorizators from '../_helpers/authorizators'
import WorkflowManager from '../workflow/services/manager'

import { Divider } from 'antd'



class Workflow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
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

  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  render() {
    return (
      <React.Fragment>

        { this.isAuthorized(this.props.authorizations, 'workflow') ?
          <React.Fragment>
            <Divider orientation="left" plain>
              CHECKPOINT AND INFOBLOX
            </Divider>
            <br/>
            <WorkflowManager/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
}))(Workflow);
