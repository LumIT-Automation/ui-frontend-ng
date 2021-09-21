import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import F5Manager from './f5/container'
import InfobloxManager from './infoblox/manager'

import Rest from "../_helpers/Rest";
import { setAssetList, cleanUp } from '../_store/store.f5'
import { setInfobloxAssetsLoading, setInfobloxAssets, setInfobloxAssetsFetchStatus } from '../_store/store.infoblox'


import Error from '../error'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
//const { Search } = Input;


/*
This is the parent component of the f5 category.

At mount it calls /assets/ to get the list of assets present in udb and it sets it in the store.
The other components will recive as props:
  state.f5.assets

Then render sub Tabs

if there is a error (no assetList in the response) renders Error component.
It also pass to Error's props the callback resetError() in order to reset Error state and haide Error component.

At the unmount it reset state.f5 in the store.
*/


class Assets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    console.log('assets')
    if (this.props.token) {
      this.fetchF5Assets()
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
    this.props.dispatch(cleanUp())
  }


  fetchF5Assets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setAssetList( resp )))
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
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

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    console.log('assets')
    console.log(this.props.infobloxAssets)
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
          <TabPane tab="F5" key="f5">
            {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <F5Manager/> }
          </TabPane>

          <TabPane tab="Infoblox" key="infoblox">
            {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <InfobloxManager/> }
          </TabPane>
        </Tabs>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  assetList: state.f5.assetList,
  infobloxAssetsLoading: state.infoblox.infobloxAssetsLoading,
  infobloxAssets: state.infoblox.infobloxAssets,
  infobloxAssetsFetchStatus: state.infoblox.infobloxAssetsFetchStatus
}))(Assets);
