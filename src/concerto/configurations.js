import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { Radio, Divider } from 'antd';

import Authorizators from '../_helpers/authorizators'
import Configuration from './configuration'

import 'antd/dist/antd.css';
import '../App.css'


function Configurations(props) {
  const [vendor, setVendor] = useState('');

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  return (
    <React.Fragment>
      <Radio.Group
        onChange={e => setVendor(e.target.value)}
        value={vendor}
        style={{padding: 15, paddingTop: 40 }}
      >
        { isAuthorized(props.authorizations, 'infoblox') ?
          <Radio.Button value={'infoblox'}>infoblox</Radio.Button>
        :
          null
        }

        { isAuthorized(props.authorizations, 'checkpoint') ?
          <Radio.Button value={'checkpoint'}>checkpoint</Radio.Button>
        :
          null
        }

        { isAuthorized(props.authorizations, 'f5') ?
          <Radio.Button value={'f5'}>f5</Radio.Button>
        :
          null
        }

        { isAuthorized(props.authorizations, 'proofpoint') ?
          <Radio.Button value={'proofpoint'}>proofpoint</Radio.Button>
        :
          null
        }

      </Radio.Group>

      <Divider/>

      {
        vendor ?
          <Configuration vendor={vendor}/>
        :
          null
      }
    </React.Fragment>
  )
  
}


export default connect((state) => ({
  authorizations: state.authorizations,
}))(Configurations);
