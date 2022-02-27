import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from "../../error/f5Error"

import {
  assetsLoading,
  assets,
  assetsFetch,
  assetsError
} from '../store.f5'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.assetsError) {
      this.props.dispatch(assetsFetch(false))
      if (!this.props.assets) {
        this.fetchAssets()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetsFetch) {
      this.fetchAssets()
      this.props.dispatch(assetsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchAssets = async () => {
    this.props.dispatch(assetsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(assets( resp ))
      },
      error => {
        this.props.dispatch(assetsError(error))
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
    this.props.dispatch(assetsLoading(false))
  }


  render() {
    return (
      <React.Fragment>
        <br/>
        { this.props.authorizations && (this.props.authorizations.assets_post || this.props.authorizations.any) ?
          <React.Fragment>
            <Add/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        <List/>

        { this.props.assetsError ? <Error component={'asset manager f5'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  assets: state.f5.assets,
 	assetsError: state.f5.assetsError,
  assetsFetch: state.f5.assetsFetch
}))(Manager);
