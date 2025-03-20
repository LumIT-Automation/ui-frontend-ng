import React, { useState } from 'react';
import { connect } from 'react-redux'
import { Radio, Divider } from 'antd';

import Authorizators from '../../_helpers/authorizators'
import Trigger from './trigger'

import 'antd/dist/reset.css';
import '../../App.css'



function Triggers(props) {
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

      </Radio.Group>

      <Divider/>

      {
        vendor ?
          <Trigger vendor={vendor}/>
        :
          null
      }
    </React.Fragment>
  )
  
}


export default connect((state) => ({
  authorizations: state.authorizations,
}))(Triggers);
