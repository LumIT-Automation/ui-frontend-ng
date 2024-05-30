import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Authorizators from '../_helpers/authorizators'
import WorkflowManager from '../workflow/services/manager'

import { Divider } from 'antd'



function Workflow(props) {

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  return (
    <React.Fragment>

      { isAuthorized(props.authorizations, 'workflow') ?
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

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
}))(Workflow);
