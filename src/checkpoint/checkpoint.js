import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Space, Radio, Alert, Divider } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'

import {
  err
} from '../concerto/store'

import AssetSelector from '../concerto/assetSelector'
import ItemsView from './itemsView'

import {
  assets,
} from '../checkpoint/store'


function Manager(props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState('');

  //MOUNT
  useEffect( () => { 
    if (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', 'assets_get')) {
      if (!props.error) {
        if (!props.assets) {
          assetsGet()
        }
      }
    }
  }, [] );


  const assetsGet = async () => {
    setLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setLoading(true)
        props.dispatch(assets(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'checkpoint',
          vendor: 'checkpoint',
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
        setLoading(false)
      }
    )
    await rest.doXHR("checkpoint/assets/", props.token)
  }

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }


  const showErrors = () => {
    if (props.error && props.error.component === 'checkpoint') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <AssetSelector vendor='checkpoint'/>

      <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
        {!(props.asset && props.domain) ?
          <Alert message="Asset and Domain not set" type="error" />
        :
          <React.Fragment>

            <Radio.Group
              onChange={e => setItems(e.target.value)}
              value={items}
              style={{marginLeft: 16}}
            >
              {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', 'assets_get') ?
                <React.Fragment>
                  <Radio.Button value={'hosts'}>Hosts</Radio.Button>
                  <Radio.Button value={'networks'}>Networks</Radio.Button>
                  <Radio.Button value={'address-ranges'}>Address ranges</Radio.Button>
                  <Radio.Button value={'groups'}>Groups</Radio.Button>
                  <Radio.Button value={'application-sites'}>Application sites</Radio.Button>
                </React.Fragment>
              :
                null
              }
            </Radio.Group>

            <Divider/>
      
            {
              items ?
                <ItemsView vendor='checkpoint' items={items} item={items ? items.slice(0, -1) : '' }/>
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

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
}))(Manager);
