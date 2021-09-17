import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Rest from "../_helpers/Rest";
import Error from '../error'

import AssetSelector from './assetSelector'
import Nodes from './nodes/manager'
import Monitors from './monitors/manager'
import Pools from './pools/manager'
import Profiles from './profiles/manager'
import VirtualServers from './virtualServers/manager'
//import CertificateAndKey from './certificates/container'

import {
  setAssetList,

  setNodesLoading,
  setNodes,
  setNodesFetchStatus,

  setPoolsLoading,
  setPools,
  setPoolsFetchStatus,

  setVirtualServersLoading,
  setVirtualServers,
  setVirtualServersFetchStatus,

  cleanUp

} from '../_store/store.f5'

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


class F5 extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      this.fetchAssets()
      if (this.props.authorizations && (this.props.authorizations.nodes_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchNodes()
      }
      if (this.props.authorizations && (this.props.authorizations.pools_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchPools()
      }
      if (this.props.authorizations && (this.props.authorizations.virtualServers_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchVirtualServers()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (this.props.authorizations !== prevProps.authorizations) {
      this.fetchAssets()
    }
    if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
      this.fetchNodes()
      this.fetchPools()
      this.fetchVirtualServers()
    }
    if ( (this.props.nodesFetchStatus === 'updated') ) {
      this.fetchNodes()
      this.props.dispatch(setNodesFetchStatus(''))
    }
    if ( (this.props.poolsFetchStatus === 'updated') ) {
      this.fetchPools()
      this.props.dispatch(setPoolsFetchStatus(''))
    }
    if ( (this.props.virtualServersFetchStatus === 'updated') ) {
      this.fetchVirtualServers()
      this.props.dispatch(setVirtualServersFetchStatus(''))
    }
  }

  componentWillUnmount() {
    console.log('f5 unmount')
  }


  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setAssetList( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchNodes = async () => {
    this.props.dispatch(setNodesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({error: false}, () => this.props.dispatch(setNodes(resp)))
        this.props.dispatch(setNodesLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setNodesLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
  }

  fetchPools = async () => {
    this.props.dispatch(setPoolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({error: false}, () => this.props.dispatch(setPools(resp)))
        this.props.dispatch(setPoolsLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setPoolsLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
  }

  fetchVirtualServers = async () => {
    this.props.dispatch(setVirtualServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({error: false}, () => this.props.dispatch(setVirtualServers(resp)))
        this.props.dispatch(setVirtualServersLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setVirtualServersLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <React.Fragment>
        <AssetSelector/>
        <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>

          <Tabs type="card" destroyInactiveTabPane={true}>
            { this.props.authorizations && (this.props.authorizations.nodes_get || this.props.authorizations.any) ?
              <TabPane tab="Nodes" key="Nodes">
                <Nodes/>
              </TabPane>
              : null
            }
            { this.props.authorizations && (this.props.authorizations.monitors_get || this.props.authorizations.any) ?
              <TabPane tab="Monitors" key="Monitors">
                <Monitors/>
              </TabPane>
              : null
            }
            { this.props.authorizations && (this.props.authorizations.pools_get || this.props.authorizations.any) ?
              <TabPane tab="Pools" key="Pools">
                <Pools/>
              </TabPane>
              : null
            }
            { this.props.authorizations && (this.props.authorizations.profiles_get || this.props.authorizations.any) ?
              <TabPane tab="Profiles" key="Profiles">
                <Profiles/>
              </TabPane>
              : null
            }
            { this.props.authorizations && (this.props.authorizations.virtualServers_get || this.props.authorizations.any) ?
              <TabPane tab="Virtual Servers" key="VirtualServers">
                <VirtualServers/>
              </TabPane>
              : null
            }
            {/* this.props.authorizations && (this.props.authorizations.certificate_post || this.props.authorizations.any) ?
              <TabPane tab="Certificates" key="4">
                <CertificateAndKey/>
              </TabPane>
              : null
            */}

          </Tabs>

          {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  assetList: state.f5.assetList,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  nodesFetchStatus: state.f5.nodesFetchStatus,
  monitors: state.f5.monitors,
  monitorsFetchStatus: state.f5.monitorsFetchStatus,
  pools: state.f5.pools,
  poolsFetchStatus: state.f5.poolsFetchStatus,
  virtualServers: state.f5.virtualServers,
  virtualServersFetchStatus: state.f5.virtualServersFetchStatus
}))(F5);
