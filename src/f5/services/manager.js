import React, { useEffect } from 'react';
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

import CreateVs from './createVs'
import F5ObjectDelete from './deleteObject'
import UpdateCert from './updateCert'
import PoolMaintenance from './poolMaintenance/manager'
import { Row, Col } from 'antd'


function Manager(props) {

  useEffect(() => {
    if (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', 'assets_get')) {
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
          component: 'f5ServiceManager',
          vendor: 'f5',
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR("f5/assets/?includeDr", props.token)
  } 

  let authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'f5ServiceManager') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col span={4} offset={2} >
          <CreateVs vendor='f5' type='L7'/>
        </Col>

        <Col span={4} offset={2} >
          <CreateVs vendor='f5' type='L4'/>
        </Col>

        <Col span={4} offset={2} >
          <UpdateCert vendor='f5'/>
        </Col>
      </Row>

      <br/>

      <Row>
        <Col span={4} offset={2}>
          <PoolMaintenance/>
        </Col>
      </Row>

      <br/>
      
      <Row>
        <Col span={4} offset={2}>
          <F5ObjectDelete vendor='f5' f5object='virtualserver'/>
        </Col>

        <Col span={4} offset={2}>
          <F5ObjectDelete vendor='f5' f5object='node'/>
        </Col>
      </Row>

      {errorsComponent()}

    </React.Fragment>
  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  assets: state.f5.assets,
}))(Manager);
