import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

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
    if (!this.props.devices || this.props.devices.length === 0) {
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
                <List height={550} pagination={10}/>
              </TabPane>
            }
          </Tabs>

        </Space>

        { this.props.devicesError ? <Error component={'fortinetdb devices'} error={[this.props.devicesError]} visible={true} type={'devicesError'} /> : null }

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
