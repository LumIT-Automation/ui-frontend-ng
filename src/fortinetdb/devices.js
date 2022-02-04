import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import Rest from "../_helpers/Rest"

import { devices, devicesLoading, devicesError, devicesFetch } from '../_store/store.fortinetdb'

import List from './devices/list'

import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Devices extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (!this.props.devices) {
      this.fetchDevices()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.devicesFetch) {
      this.fetchDevices()
      this.props.dispatch(devicesFetch(false))
    }
  }

  componentWillUnmount() {
  }

  fetchDevices = async () => {
    this.props.dispatch(devicesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(devices(resp))
      },
      error => {
        this.props.dispatch(devicesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/`, this.props.token)
    this.props.dispatch(devicesLoading(false))
  }

  devicesRefresh = () => {
    this.props.dispatch(devicesFetch(true))
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
            {this.props.devicesLoading ?
              <TabPane key="devices" tab="Devices">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
            :
              <TabPane key="devices" tab=<span>Devices<ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.devicesRefresh()}/></span>>
                <List height={600} pagination={10}/>
              </TabPane>
            }
          </Tabs>

        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,

  fortinetdbauth: state.authorizations.fortinetdb,

  devicesLoading: state.fortinetdb.devicesLoading,
  devices: state.fortinetdb.devices,
  devicesError: state.fortinetdb.devicesError,
  devicesFetch: state.fortinetdb.devicesFetch
}))(Devices);





/*
<React.Fragment>
  <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
    <Tabs type="card">
      { this.props.fortinetdbauth && (this.props.fortinetdbauth.assets_get || this.props.fortinetdbauth.any) ?
        <React.Fragment>
          {this.props.devicesLoading ?
            <TabPane key="Fortinetdb" tab="Fortinetdb">
              <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
            </TabPane>
            :
            <TabPane key="devices" tab=<span>Fortinetdb <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.devicesDevicesRefresh()}/></span>>
              <List/>
            </TabPane>
          }
        </React.Fragment>
        :
        null
      }

    </Tabs>

  </Space>
</React.Fragment>


*/
