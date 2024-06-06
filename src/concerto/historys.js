import React, { useState } from 'react';
import { connect } from 'react-redux'
import { Radio, Divider } from 'antd';

import Authorizators from '../_helpers/authorizators'
import History from './history'

import 'antd/dist/antd.css';
import '../App.css'



function Historys(props) {
  const [vendor, setVendor] = useState('');

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
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

        { isAuthorized(props.authorizations, 'vmware') ?
          <Radio.Button value={'vmware'}>vmware</Radio.Button>
        :
          null
        }
      </Radio.Group>

      <Divider/>

      {
        vendor ?
          <History vendor={vendor}/>
        :
          null
      }
    </React.Fragment>
  )

}


export default connect((state) => ({
  authorizations: state.authorizations,
}))(Historys);
