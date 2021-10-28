import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'
import { setAssets as setF5Assets } from '../_store/store.f5'
import { setAssets as setInfobloxAssets } from '../_store/store.infoblox'
import { setAssetsFetch as setInfobloxAssetsFetch } from '../_store/store.infoblox'
import { setAssetsFetch as setF5AssetsFetch } from '../_store/store.f5'

import InfobloxManager from './infoblox/manager'
import F5Manager from './f5/manager'

import { Divider } from 'antd'

import { LoadingOutlined } from '@ant-design/icons'



class Service extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
    };
  }

  componentDidMount() {
    if (this.props.infobloxAuthorizations && (this.props.infobloxAuthorizations.assets_get || this.props.infobloxAuthorizations.any ) ) {
      if(!this.props.infobloxAssets) {
        this.fetchInfobloxAssets()
      }
    }
    if (this.props.f5Authorizations && (this.props.f5Authorizations.assets_get || this.props.f5Authorizations.any ) ) {
      if(!this.props.f5Assets) {
        this.fetchF5Assets()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.infobloxAssetsFetch) {
      this.fetchInfobloxAssets()
      this.props.dispatch(setInfobloxAssetsFetch(false))
    }
    if (this.props.f5AssetsFetch) {
      this.fetchF5Assets()
      this.props.dispatch(setF5AssetsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchF5Assets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Assets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchInfobloxAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setInfobloxAssets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }





  render() {

    return (
      <React.Fragment>

        <React.Fragment>
          <Divider orientation="left" plain>
            HISTORY
          </Divider>
          <br/>
          <br/>
        </React.Fragment>


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

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,

  infobloxAuthorizations: state.authorizations.infoblox,
  f5Authorizations: state.authorizations.f5,

  infobloxAssets: state.infoblox.assets,
  f5Assets: state.f5.assets,

  infobloxAssetsFetch: state.infoblox.assetsFetch,
  f5AssetsFetch: state.f5.assetsFetch,

}))(Service);
