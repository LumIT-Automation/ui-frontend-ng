import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'
import '../App.css'

import { Space, Radio, Alert, Divider } from 'antd'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'

import AssetSelector from '../concerto/assetSelector'
import ItemsView from './itemsView'

import {
  assets,
} from '../f5/store'

import {
  err
} from '../concerto/store'


function Manager(props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState('');
  const [vendor] = useState('f5');

  //MOUNT
  useEffect( () => { 
    if (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, vendor, 'assets_get')) {
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
          component: 'certKey manager f5',
          vendor: vendor,
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
        setLoading(false)
      }
    )
    await rest.doXHR(`${vendor}/assets/?includeDr`, props.token)
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
    if (props.error && props.error.component === vendor) {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <AssetSelector vendor={vendor}/>

      <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
        {!(props.asset && props.partition) ?
          <Alert message="Asset and Partition not set" type="error" />
        :
          <React.Fragment>

            <Radio.Group
              onChange={e => setItems(e.target.value)}
              value={items}
              style={{marginLeft: 16}}
            >
              {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', 'assets_get') ?
                <React.Fragment>
                  <Radio.Button value={'certificates'}>Certificates</Radio.Button>
                  <Radio.Button value={'keys'}>Keys</Radio.Button>
                </React.Fragment>
              :
                null
              }
            </Radio.Group>
            <Divider/>
      
            {
              items ?
                <ItemsView vendor={vendor} items={items} item={items ? items.slice(0, -1) : '' }/>
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

  asset: state.f5.asset,
  partition: state.f5.partition,
}))(Manager);





