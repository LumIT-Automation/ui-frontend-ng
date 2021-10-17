import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table } from 'antd';

import Error from '../error'

import F5 from './f5/manager'
import Infoblox from './infoblox/manager'

import { setError } from '../_store/store.error'
import { setAssetsFetch as f5AssetsRefresh } from '../_store/store.f5'
import { setAssetsFetch as infobloxAssetsRefresh } from '../_store/store.infoblox'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const refreshIcon = <ReloadOutlined style={{color: 'white' }}  />



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

  resetError = () => {
    this.setState({ error: null})
  }

  f5AssetsRefresh = () => {
    this.props.dispatch(f5AssetsRefresh(true))
  }

  infobloxAssetsRefresh = () => {
    this.props.dispatch(infobloxAssetsRefresh(true))
  }


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card">
          { this.props.f5auth && (this.props.f5auth.assets_get || this.props.f5auth.any) ?
            <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.f5AssetsRefresh()}/></span>>
              {this.props.f5assetsLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
                <F5/>
            }
            </TabPane>
            :
            null
          }
          { this.props.infobloxAuth && (this.props.infobloxAuth.assets_get || this.props.infobloxAuth.any) ?
            <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.infobloxAssetsRefresh()}/></span>>
              {this.props.infobloxAssetsLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Infoblox/> }
            </TabPane>
            :
            null
          }
        </Tabs>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  error: state.error.error,
  f5auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,
  f5assetsLoading: state.f5.assetsLoading,
  infobloxAssetsLoading: state.infoblox.assetsLoading
}))(Assets);
