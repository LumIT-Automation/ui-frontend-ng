import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import Error from '../error'

import SuperAdmin from './superAdmin/manager'
import F5 from './f5/manager'
import Infoblox from './infoblox/manager'

import { setPermissionsFetch as f5PermissionsFetch } from '../_store/store.f5'
import { setPermissionsFetch as infobloxPermissionsFetch } from '../_store/store.infoblox'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Permissions extends React.Component {

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

  f5PermissionsFetch = refresh => {
    this.props.dispatch(f5PermissionsFetch(refresh))
  }

  infobloxPermissionsFetch = refresh => {
    this.props.dispatch(infobloxPermissionsFetch(refresh))
  }


  render() {
    return (

      <React.Fragment>
      { this.props.error ?
        <Error error={[this.props.error]} visible={true} />
        :
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            <TabPane tab="SuperAdmin" key="SuperAdmin">
              <SuperAdmin/>
            </TabPane>
            { this.props.f5Auth && (this.props.f5Auth.permission_identityGroups_get || this.props.f5Auth.any) ?
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.f5PermissionsFetch(true)}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }
            { this.props.infobloxAuth && (this.props.infobloxAuth.permission_identityGroups_get || this.props.infobloxAuth.any) ?
              <React.Fragment>
                {this.props.infobloxLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.infobloxPermissionsFetch(true)}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }
          </Tabs>
        </Space>
      }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
 	error: state.error.error,

  f5Auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,

  infobloxLoading: state.infoblox.permissionsLoading,
  f5Loading: state.f5.permissionsLoading
}))(Permissions);
