import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { LoadingOutlined } from '@ant-design/icons';
import { Space, Alert, Spin } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  tree,
  treeFetch,
} from '../store'

import NetworksTree from './networksTree'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


function Manager(props) {
  let [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.asset && !props.error) {
      if (!props.tree || props.treeFetch) {
        treeGet()
      }
      props.dispatch(treeFetch(false))
    }
  }, [props.asset, props.error, props.treeFetch]);

  let treeGet = async () => {
    setLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        editTree(resp.data['/'])
      },
      error => {
        error = Object.assign(error, {
          component: 'manager',
          vendor: 'infoblox',
          errorType: 'treeError'
        })
        props.dispatch(err(error))
        setLoading(false)
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/tree/`, props.token)
    setLoading(false)
  }

  let editTree = async t => {
    await editTitle(t) 
    
    props.dispatch(tree([t]))
  }

  let editTitle = net => {
    try {
      if (net.extattrs && (net.extattrs.Environment || net.extattrs['Object Type'])) {
        let str
        if (net.extattrs && net.extattrs.Environment) {
          str = net.extattrs.Environment.value
        }
        else {
          str = net.extattrs['Object Type'].value
        }
        net.title = `${net.title} - ${str}`
      }
  
      net.children.forEach(child => {
        editTitle(child)
      });
    }
    catch(error) {
      console.log(error)
    }
  }

  let errors = () => {
    if (props.error && props.error.component === 'manager') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        { props.asset ?
          <React.Fragment>
            {loading ?
              <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
            :
              <NetworksTree/>
            }
            
          </React.Fragment>
        :
          <Alert message="Asset not set" type="error" />
        }

      </Space>

      {errors()}

    </React.Fragment>
  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
}))(Manager);
