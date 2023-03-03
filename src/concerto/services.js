import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Authorizators from '../_helpers/authorizators'
import CheckpointManager from '../checkpoint/services/manager'
import InfobloxManager from '../infoblox/services/manager'
import F5Manager from '../f5/services/manager'
import VmwareManager from '../vmware/services/manager'

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

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  workflowsAuthorizator = a => {
    let author = new Authorizators()
    return author.workflow(a)
  }


  render() {
    return (
      <React.Fragment>

        { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
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

        { this.props.authorizationsCheckpoint && this.authorizators(this.props.authorizationsCheckpoint) ?
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

        { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
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

        { this.props.authorizationsVmware &&
          (this.props.authorizationsVmware.any ||
          (this.props.authorizationsVmware.template_post && this.authorizators(this.props.authorizationsVmware.template_post)) ) ?
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

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  authorizations: state.authorizations,
  authorizationsWorkflow: state.authorizations.workflow,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsF5: state.authorizations.f5,
  authorizationsVmware: state.authorizations.vmware

}))(Service);
