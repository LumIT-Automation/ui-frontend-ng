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
  setNodesList,
  setNodesFetchStatus,
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
    }
    if ( (this.props.nodesFetchStatus === 'updated') ) {
      console.log('updateeeeeeeeeeee')
      this.fetchNodes()
      this.props.dispatch(setNodesFetchStatus(''))
    }
  }

  componentWillUnmount() {
    console.log('f5 eeee unmount')
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
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setNodesList(resp)))
        this.props.dispatch(setNodesLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setNodesLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    //console.log('this.props.assetList')
    //console.log(this.props.assetList)
    console.log('this.props.asset')
    console.log(this.props.asset)
    console.log('this.props.partition')
    console.log(this.props.partition)
    //console.log('this.props.nodes')
    //console.log(this.props.nodes)
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
  nodesFetchStatus: state.f5.nodesFetchStatus
}))(F5);
