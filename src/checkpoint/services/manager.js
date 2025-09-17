import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store';

import {
  assets,
} from '../store';

import VpnToServices from './vpnToServices';
import VpnToHost from './vpnToHost';
import HostInGroup from './hostInGroup';
import UrlInApplicationSite from './urlInApplicationSite';
import DatacenterAccount from './datacenterAccount';
import { Row, Col } from 'antd';

function Manager(props) {

  useEffect(() => {
    if (props.authorizations && (props.authorizations.assets_get || props.authorizations.any)) {
      if (!props.error && !props.assets) {
        assetsGet();
      }
    }
  }, [props.authorizations, props.error, props.assets]);

  const assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        props.dispatch(assets(resp));
      },
      error => {
        error = Object.assign(error, {
          component: 'cpServiceManager',
          vendor: 'checkpoint',
          errorType: 'assetsError'
        });
        props.dispatch(err(error));
      }
    );
    await rest.doXHR("checkpoint/assets/", props.token);
  };

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  const errors = () => {
    if (props.error && props.error.component === 'cpServiceManager') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col span={2} offset={2}>
          <VpnToServices />
        </Col>
        <Col span={2} offset={2}>
          <VpnToHost />
        </Col>
        <Col span={2} offset={2}>
          <HostInGroup />
        </Col>
        <Col span={2} offset={2}>
          <UrlInApplicationSite />
        </Col>
        {/*authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', 'accounts_datacenter_get') ?
          <Col span={2} offset={2}>
            <DatacenterAccount vendor={'checkpoint'}/>
          </Col>
        :
          null 
        */}
      </Row>

      {errors()}
    </React.Fragment>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,
  assets: state.checkpoint.assets,
}))(Manager);
