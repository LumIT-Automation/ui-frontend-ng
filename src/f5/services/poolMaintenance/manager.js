import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Modal, Alert, Button, Divider, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../../_helpers/Rest'
import Error from '../../../concerto/error'

import {
  err
} from '../../../concerto/store'

import {
  pools,
} from '../../store'

import AssetSelector from '../../../concerto/assetSelector'
import Pools from './pools'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


function Manager(props) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && props.asset && props.partition) {
      getPools()
    }
  }, [visible, props.asset, props.partition]);


  let getPools = async () => {
    if (props.asset.id) {

      setLoading(true)
      let data = await poolsGet()
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'poolMaintenanceManager',
          vendor: 'f5',
          errorType: 'poolsError'
        })
        props.dispatch(err(error))
        setLoading(false)
      }
      else {
        props.dispatch(pools( data.data.items ))
        setLoading(false)
      }
    }
  }

  let poolsGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/pools/`, props.token)
    return r
  }

  let closeModal = () => {
    setVisible(false);
    setLoading(false);
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'poolMaintenanceManager') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>

      <Button type="primary" onClick={() => setVisible(true)}>POOL MANAGEMENT</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>POOL MANAGEMENT</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor='f5'/>
        <Divider/>

        { ( (props.asset && props.asset.id) && props.partition ) ?
          <React.Fragment>
          {loading ?
            <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
            <Pools/>
          }
          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }
      </Modal>

      {errorsComponent()}

    </React.Fragment>
  )
  
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  pools: state.f5.pools,
}))(Manager);
