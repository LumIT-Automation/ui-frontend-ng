import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Tree, Space, Row, Col } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import IpsList from './ipsList'


function NetworksTree(props)  {

  let [ipLoading, setIpLoading] = useState(false);
  let [ipv4Info, setIpv4Info] = useState([]);
  let [network, setNetwork] = useState({});

  useEffect(() => {
    if (network && Object.keys(network).length > 0) {
      ipsGet(network)
    }
  }, [network]);

  let ipsGet = async network => {
    setIpLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setIpv4Info(resp.data.ipv4Info)
        setIpLoading(false)
      },
      error => {
        error = Object.assign(error, {
          component: 'NetworksTree',
          vendor: 'infoblox',
          errorType: 'treeError'
        })
        props.dispatch(err(error))
        setIpLoading(false)
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/network/${network}/?related=ip`, props.token)
  }


  let onSelect = (selectedKeys, info) => {
    if (info.node.type === 'network') {
      let n = info.node.title
      n = n.split('/')
      n = n[0]
      setNetwork(n)
    }
  }

  let onCheck = (checkedKeys, info) => {

  }

  let errors = () => {
    if (props.error && props.error.component === 'NetworksTree') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }


  return (
    <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
      <Row>
        <Col span={6}>
          <Tree
            defaultExpandAll
            showLine
            //defaultExpandedKeys={['0-0-0', '0-0-1']}
            //defaultSelectedKeys={['0-0-0', '0-0-1']}
            //defaultCheckedKeys={['0-0-0', '0-0-1']}
            onSelect={onSelect}
            onCheck={onCheck}
            treeData={props.tree}
          />
        </Col>
        <Col offset={2} span={14}>
          { network ?
            <IpsList ipLoading={ipLoading} ipv4Info={ipv4Info} />
          :
            null
          }
        </Col>
      </Row>

      {errors()}
    </Space>

  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.infoblox.asset,
  tree: state.infoblox.tree
}))(NetworksTree);
