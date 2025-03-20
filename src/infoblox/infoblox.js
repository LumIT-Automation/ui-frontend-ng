import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Space, Radio, Alert, Divider } from 'antd'
//import 'antd/dist/reset.css'
import '../App.css'

import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'

import AssetSelector from '../concerto/assetSelector'
import Tree from './tree/manager'


function Manager(props) {
  let [items, setItems] = useState('');


  let authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  let showErrors = () => {
    if (props.error && props.error.component === 'infobloxMGMT') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }


  return (
    <React.Fragment>
      <AssetSelector vendor='infoblox'/>

      <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>

      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
      {!props.asset ?
          <Alert message="Asset not set" type="error" />
        :
          <React.Fragment>
            <Radio.Group
              onChange={e => setItems(e.target.value)}
              value={items}
              style={{marginLeft: 16}}
            >
              {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'infoblox', 'networks_get') ? 
                <React.Fragment>
                  <Radio.Button value={'tree'}>Network Tree</Radio.Button>
                </React.Fragment>
              :
                null
              }
            </Radio.Group>

            <Divider/>
      
            {
              items ?
                <Tree/>
              :
                null
            }
          </React.Fragment>
      }
      </Space>

      {showErrors()}

    </React.Fragment>
  )
}



export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,
  asset: state.infoblox.asset,
}))(Manager);
