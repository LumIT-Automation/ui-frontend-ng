import React, { useState, useEffect } from 'react'
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

import Report from './report'
import { Row, Col } from 'antd'


function Manager(props) {

  useEffect(() => {
    if (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'proofpoint', 'assets_get')) {
      if (!props.err) {
        if (!props.assets) {
          assetsGet();
        }
      }
    }
  }, [props.authorizations, props.err, props.assets]);

  let assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        props.dispatch(assets(resp));
      },
      error => {
        error = Object.assign(error, {
          component: 'servicesManager',
          vendor: 'proofpoint',
          errorType: 'assetsError'
        });
        props.dispatch(err(error));
      }
    );
    await rest.doXHR(`${props.vendor}/assets/`, props.token);
  };

  let authorizatorsSA = (a) => {
    let author = new Authorizators();
    return author.isSuperAdmin(a);
  };

  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators();
    return author.isAuthorized(authorizations, vendor, key);
  };

  let errorsComponent = () => {
    if (props.error && props.error.component === 'servicesManager') {
      return <Error error={[props.error]} visible={true}/> 
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col span={4} offset={2}>
          <Report type='Report' vendor="proofpoint" />
        </Col>
      </Row>
      {errorsComponent()}
    </React.Fragment>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,
  assets: state.proofpoint.assets,
}))(Manager);
