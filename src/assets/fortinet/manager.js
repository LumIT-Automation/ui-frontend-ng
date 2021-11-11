import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import {
  setAssetsLoading,
  setAssets,
  setAssetsFetch,
  setAssetsError
} from '../../_store/store.fortinet'

import List from './list'


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    this.fetchAssets()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetsFetch) {
      this.fetchAssets()
      this.props.dispatch(setAssetsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAssets(resp.data))
        this.setState({loading: false, devices: resp.data, firmware: resp.data.FIRMWARE})
      },
      error => {
        this.setState({loading: false})
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/`, this.props.token)
  }



  render() {
    return (
      <React.Fragment>
        <br/>

        <List/>

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	assetsError: state.fortinet.assetsError,
  authorizations: state.authorizations.fortinet,
  assets: state.fortinet.assets,
  assetsFetch: state.fortinet.assetsFetch
}))(Manager);
