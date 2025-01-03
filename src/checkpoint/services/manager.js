import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';

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

  const errors = () => {
    if (props.error && props.error.component === 'cpServiceManager') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col span={4} offset={2}>
          <VpnToServices />
        </Col>
        <Col span={4} offset={2}>
          <VpnToHost />
        </Col>
        <Col span={4} offset={2}>
          <HostInGroup />
        </Col>
        <Col span={4} offset={2}>
          <UrlInApplicationSite />
        </Col>
      </Row>
      
      <br />

      <Row>
        <Col span={4} offset={2}>
          <DatacenterAccount vendor={'checkpoint'}/>
        </Col>
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
