import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import F5 from '../f5/assets/manager'
import Infoblox from '../infoblox/assets/manager'

import { assetsFetch as f5AssetsFetch } from '../f5/store.f5'
import { assetsFetch as infobloxAssetsFetch } from '../_store/store.infoblox'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Assets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(f5AssetsFetch(true))}/></span>>
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
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(infobloxAssetsFetch(true))}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

          </Tabs>

        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  f5auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,

  f5Loading: state.f5.assetsLoading,
  infobloxLoading: state.infoblox.assetsLoading,
}))(Assets);
