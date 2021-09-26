import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setAssetsLoading, setAssets, setAssetsFetchStatus, cleanUp } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Divider } from 'antd';
import Highlighter from 'react-highlight-words';

/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
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
    if ( (this.props.assetsFetchStatus === 'updated') ) {
      this.fetchAssets()
      this.props.dispatch(setAssetsFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }

  fetchAssets = async () => {
    this.props.dispatch(setAssetsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAssetsLoading(false))
        this.props.dispatch(setAssets( resp ))
      },
      error => {
        this.props.dispatch(setAssetsLoading(false))
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>

        { this.props.f5auth && (this.props.f5auth.assets_post || this.props.f5auth.any) ?
           <Add/>
           : null
        }

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
  f5auth: state.authorizations.f5,
  assets: state.f5.assets,
  assetsFetchStatus: state.f5.assetsFetchStatus
}))(Manager);
