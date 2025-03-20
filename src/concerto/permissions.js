import React, { useState } from 'react';
import { connect } from 'react-redux'
import { Radio, Divider} from 'antd'
//import 'antd/dist/reset.css'
import '../App.css'

import Authorizators from '../_helpers/authorizators'
import Permission from './permission'
import WorkflowPermission from './permissionWorkflow'



function Permissions(props) {
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
        {props.authorizations && authorizatorsSA(props.authorizations) ?
          <Radio.Button value={'superAdmin'}>superAdmin</Radio.Button>
        :
          null
        }

        {props.authorizations && authorizatorsSA(props.authorizations) ?
          <Radio.Button value={'workflow'}>workflow</Radio.Button>
        :
          null
        }
      </Radio.Group>

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

        { isAuthorized(props.authorizations, 'vmware') ?
          <Radio.Button value={'vmware'}>vmware</Radio.Button>
        :
          null
        }
      </Radio.Group>

      <Divider/>

      {
        vendor ?
          vendor !== 'workflow' ?
            <Permission vendor={vendor}/>
          :
            <WorkflowPermission vendor={vendor}/>  
        :
          null
      }
    </React.Fragment>
  )

}


export default connect((state) => ({
  authorizations: state.authorizations,
}))(Permissions);
