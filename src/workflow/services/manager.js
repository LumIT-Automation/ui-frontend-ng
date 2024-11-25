import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Authorizators from '../../_helpers/authorizators'

import CloudAccount from './cloudAccount'
import RemoveHost from './removeHost'
import AddHost from './addHost'

import { Row, Col } from 'antd';



function Manager(props) {

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  return (
    
    <React.Fragment>
      <Row>
        {/*authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'cloud_account') ?*/
          <Col span={6} offset={2}>
            <p>Manage cloud account</p>
            <CloudAccount service='cloud account' vendor='infoblox'/>
          </Col>/*
        :
          null
        */}

        {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'checkpoint_remove_host') ?
          <Col span={6} offset={2}>
            <p>Remove host from firewall (no for gateway)</p>
            <RemoveHost/>
          </Col>
        :
          null
        }

        {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'workflow', 'checkpoint_add_host') ?
          <Col span={6} offset={2}>
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


export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations,
  authorizationsWorkflow: state.authorizations.workflow,
}))(Manager);
