import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setAssetList, setAssetsLoading, setAssets, setAssetsFetchStatus, cleanUp } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


class Container extends React.Component {

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
      this.fetchF5Assets()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.f5AssetsFetchStatus === 'updated') ) {
      this.fetchF5Assets()
      this.props.dispatch(setF5AssetsFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }

  fetchF5Assets = async () => {
    console.log('asssssssssssssssssssssssssssss')
    this.props.dispatch(setAssetsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
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




  render() {
        console.log(this.props.assets)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Button type="primary" onClick={() => this.fetchF5Assets()} shape='round' style={{display: 'inline-block'}}>
          Refresh
        </Button>

        { this.props.f5auth && (this.props.f5auth.assets_post || this.props.f5auth.any) ?
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
  f5auth: state.authorizations.f5,
  assets: state.f5.assets
}))(Container);
