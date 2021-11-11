import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import F5 from './f5/manager'
import Infoblox from './infoblox/manager'
import Fortinet from './fortinet/manager'

import { setAssetsFetch as f5AssetsRefresh } from '../_store/store.f5'
import { setAssetsFetch as infobloxAssetsRefresh } from '../_store/store.infoblox'
import { setAssetsFetch as fortinetAssetsRefresh } from '../_store/store.fortinet'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Assets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
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

  f5AssetsRefresh = () => {
    this.props.dispatch(f5AssetsRefresh(true))
  }

  infobloxAssetsRefresh = () => {
    this.props.dispatch(infobloxAssetsRefresh(true))
  }

  fortinetAssetsRefresh = () => {
    this.props.dispatch(fortinetAssetsRefresh(true))
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            { this.props.f5auth && (this.props.f5auth.assets_get || this.props.f5auth.any) ?
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.f5AssetsRefresh()}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

            { this.props.infobloxAuth && (this.props.infobloxAuth.assets_get || this.props.infobloxAuth.any) ?
              <React.Fragment>
                {this.props.infobloxLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.infobloxAssetsRefresh()}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }


              <React.Fragment>
                {this.props.fortinetLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="fortinet" tab=<span>Fortinet <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.fortinetAssetsRefresh()}/></span>>
                    <Fortinet/>
                  </TabPane>
                }
              </React.Fragment>


          </Tabs>


        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  error: state.error.error,

  f5auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,
  fortinetAuth: state.authorizations.fortinet,

  f5Loading: state.f5.assetsLoading,
  infobloxLoading: state.infoblox.assetsLoading,
  fortinetLoading: state.fortinet.assetsLoading
}))(Assets);
