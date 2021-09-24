import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setInfobloxAssetsLoading, setInfobloxAssets, setInfobloxAssetsFetchStatus } from '../../_store/store.infoblox'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    if (this.props.infobloxAuth.assets_get) {
      this.fetchInfobloxAssets()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.infobloxAssetsFetchStatus === 'updated') ) {
      this.fetchInfobloxAssets()
      this.props.dispatch(setInfobloxAssetsFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }

  fetchInfobloxAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setInfobloxAssets( resp )))
        console.log(resp)
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  render() {
    console.log('infoblox manager')
    console.log(this.props.infobloxAssets)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        { this.props.infobloxAuth && (this.props.infobloxAuth.assets_post || this.props.infobloxAuth.any) ?
        <div>
          <br/>
          <Add/>
        </div>
        : null }

        <br/>

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
}))(Manager);
