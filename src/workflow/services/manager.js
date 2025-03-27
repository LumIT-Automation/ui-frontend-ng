import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'
import Authorizators from '../../_helpers/authorizators'

import CloudAccount from './cloudAccount'
import RemoveHost from './removeHost'
import AddHost from './addHost'

import { Row, Col } from 'antd';



function Manager(props) {

  const isSuperAdmin = (authorizations) => {
    let author = new Authorizators()
    return author.isSuperAdmin(authorizations)
  }

  const isAuthorized = (authorizations, vendor, key) => {
    if (authorizations[vendor]?.workflows && Array.isArray(authorizations[vendor].workflows)) {
      return authorizations[vendor].workflows.find(({ workflow_name }) => workflow_name === key);
    }
  }

  return (
    
    <React.Fragment>
      {console.log(props.authorizations)}
      <Row>
        {isSuperAdmin(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'cloud_account') ?
          <Col span={2} offset={2}>
            <CloudAccount service='cloud account' vendor='infoblox'/>
          </Col>
        :
          null
        }

        {isSuperAdmin(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'checkpoint_remove_host') ?
          <Col span={2} offset={2}>
            <RemoveHost/>
          </Col>
        :
          null
        }
        
        {isSuperAdmin(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'checkpoint_add_host') ?
          <Col span={2} offset={2}>
            {console.log(isAuthorized(props.authorizations, 'workflow', 'checkpoint_add_host'))}
            <AddHost/>
          </Col>
        :
          null
        }
      </Row>
    </React.Fragment>
  )
}


export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations,
  authorizationsWorkflow: state.authorizations.workflow,
}))(Manager);
