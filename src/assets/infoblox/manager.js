import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setAssetsLoading, setAssets, setAssetsFetch } from '../../_store/store.infoblox'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin } from 'antd';
import Highlighter from 'react-highlight-words';




/*

*/


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
        this.setState({error: error})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
    this.props.dispatch(setAssetsLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { this.props.infobloxAuth && (this.props.infobloxAuth.assets_post || this.props.infobloxAuth.any) ?
          <Add/>
        : null }

        <div>
          <List/>
        </div>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  infobloxAuth: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  assetsFetch: state.infoblox.assetsFetch
}))(Manager);
