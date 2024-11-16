import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store'

import {
  assets,
} from '../store'

//import IpDetails from './ipDetails'
import IpComponent from './ipComponent'
import RequestIp from './requestIp'
import ReleaseIp from './releaseIp'
import CloudNetwork from './cloudNetwork'

import { Row, Col } from 'antd';


function Manager(props) {

  useEffect(() => {
    if (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'infoblox', 'assets_get')) {
      if (!props.error && !props.assets) {
        assetsGet()
      }
    }
  }, [props.authorizations]);

  let assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        props.dispatch(assets( resp ))
      },
      error => {
        error = Object.assign(error, {
          component: 'serviceManager',
          vendor: 'infoblox',
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR("infoblox/assets/", props.token)
  }

  let authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  let errors = () => {
    if (props.error && props.error.component === 'serviceManager') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment >
      <Row>
        <Col span={4} offset={2} >
          <IpComponent service='ip details'/>
        </Col>

        <Col span={4} offset={2}>
          <RequestIp/>
        </Col>

        <Col span={4} offset={2} >
          <IpComponent service='ip modify'/>
        </Col>

        <Col span={4} offset={2}>
          <ReleaseIp/>
        </Col>
      </Row>

      <br/>

      <Row>
        <Col span={4} offset={2}>
          <CloudNetwork vendor='infoblox' service='cloud network'/>
        </Col>
      </Row>

      {errors()}

    </React.Fragment>
  )

}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  assets: state.infoblox.assets,
}))(Manager);
