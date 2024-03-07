import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Authorizators from '../_helpers/authorizators'
import CheckpointManager from '../checkpoint/services/manager'
import InfobloxManager from '../infoblox/services/manager'
import F5Manager from '../f5/services/manager'
import VmwareManager from '../vmware/services/manager'
import ProofpointManager from '../proofpoint/services/manager'

import { Divider } from 'antd'



class Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  render() {
    return (
      <React.Fragment>

        { this.isAuthorized(this.props.authorizations, 'infoblox') ?
          <React.Fragment>
            <Divider orientation="left" plain >
              IPAM
            </Divider>
            <br/>
            <InfobloxManager/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        { this.isAuthorized(this.props.authorizations, 'checkpoint') ?
          <React.Fragment>
            <Divider orientation="left" plain >
              FIREWALL
            </Divider>
            <br/>
            <CheckpointManager/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        { this.isAuthorized(this.props.authorizations, 'f5') ?
          <React.Fragment>
            <Divider orientation="left" plain>
              LOAD BALANCER
            </Divider>
            <br/>
            <F5Manager/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        { this.isAuthorized(this.props.authorizations, 'vmware', 'template_post') ?
          <React.Fragment>
            <Divider orientation="left" plain>
              VIRTUAL MACHINE
            </Divider>
            <br/>
            <VmwareManager/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        { this.isAuthorized(this.props.authorizations, 'proofpoint') ?
          <React.Fragment>
            <Divider orientation="left" plain>
              PROOFPOINT REPORT
            </Divider>
            <br/>
            <ProofpointManager vendor="proofpoint"/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
}))(Service);
