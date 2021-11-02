import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setAssetsLoading, setAssets, setAssetsFetch } from '../../_store/store.infoblox'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    if (!this.props.assets) {
      this.fetchAssets()
    }
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
    this.props.dispatch(setAssetsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAssets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
    this.props.dispatch(setAssetsLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    console.log(this.props.assets)
    return (
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} visible={true} />
        :
          <React.Fragment>
            <br/>
            { this.props.infobloxAuth && (this.props.infobloxAuth.assets_post || this.props.infobloxAuth.any) ?
              <React.Fragment>
                <Add/>
                <br/>
                <br/>
              </React.Fragment>
            :
              null
            }
            <List/>
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  infobloxAuth: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  assetsFetch: state.infoblox.assetsFetch
}))(Manager);
