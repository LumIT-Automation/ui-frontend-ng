import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import SuperAdmin from './superAdmin/manager'
import Infoblox from '../infoblox/permissions/manager'
import Checkpoint from '../checkpoint/permissions/manager'
import F5 from '../f5/permissions/manager'
import Vmware from '../vmware/permissions/manager'
import Fortinetdb from '../fortinetdb/permissions/manager'

import { permissionsFetch as infobloxPermissionsFetch } from '../infoblox/store'
import { permissionsFetch as checkpointPermissionsFetch } from '../checkpoint/store'
import { permissionsFetch as f5PermissionsFetch } from '../f5/store'
import { permissionsFetch as vmwarePermissionsFetch } from '../vmware/store'
import { permissionsFetch as fortinetdbPermissionsFetch } from '../fortinetdb/store'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Permissions extends React.Component {

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
            <TabPane tab="SuperAdmin" key="SuperAdmin">
              <SuperAdmin/>
            </TabPane>
            { this.props.infobloxAuth && (this.props.infobloxAuth.permission_identityGroups_get || this.props.infobloxAuth.any) ?
              <React.Fragment>
                {this.props.infobloxLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(infobloxPermissionsFetch(true))}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }
            { this.props.checkpointAuth && (this.props.checkpointAuth.permission_identityGroups_get || this.props.checkpointAuth.any) ?
              <React.Fragment>
                {this.props.checkpointLoading ?
                  <TabPane key="Checkpoint" tab="Checkpoint">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="Checkpoint" tab=<span>Checkpoint <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(checkpointPermissionsFetch(true))}/></span>>
                    <Checkpoint/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }
            { this.props.f5Auth && (this.props.f5Auth.permission_identityGroups_get || this.props.f5Auth.any) ?
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(f5PermissionsFetch(true))}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

            { this.props.vmwareAuth && (this.props.vmwareAuth.permission_identityGroups_get || this.props.vmwareAuth.any) ?
              <React.Fragment>
                {this.props.vmwareLoading ?
                  <TabPane key="Vmware" tab="Vmware">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="vmware" tab=<span>Vmware <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(vmwarePermissionsFetch(true))}/></span>>
                    <Vmware/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

            { this.props.fortinetdbAuth && (this.props.fortinetdbAuth.permission_identityGroups_get || this.props.fortinetdbAuth.any) ?
              <React.Fragment>
                {this.props.fortinetdbLoading ?
                  <TabPane key="Fortinetdb" tab="Fortinetdb">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="Fortinetdb" tab=<span>Fortinetdb <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(fortinetdbPermissionsFetch(true))}/></span>>
                    <Fortinetdb/>
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
  f5Auth: state.authorizations.f5,
  checkpointAuth: state.authorizations.checkpoint,
  infobloxAuth: state.authorizations.infoblox,
  vmwareAuth: state.authorizations.vmware,
  fortinetdbAuth: state.authorizations.fortinetdb,

  f5Loading: state.f5.permissionsLoading,
  checkpointLoading: state.checkpoint.permissionsLoading,
  infobloxLoading: state.infoblox.permissionsLoading,
  vmwareLoading: state.vmware.permissionsLoading,
  fortinetdbLoading: state.fortinetdb.permissionsLoading,
}))(Permissions);
