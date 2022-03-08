import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import InfobloxManager from '../infoblox/services/manager'
import F5Manager from '../f5/services/manager'

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


  render() {
    return (
      <React.Fragment>

        { (this.props.infobloxAuthorizations && (this.props.infobloxAuthorizations.assets_get || this.props.infobloxAuthorizations.any ) ) ?
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

        { (this.props.f5Authorizations && (this.props.f5Authorizations.assets_get || this.props.f5Authorizations.any ) ) ?
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

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  infobloxAuthorizations: state.authorizations.infoblox,
  f5Authorizations: state.authorizations.f5,

}))(Service);
