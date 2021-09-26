import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd';


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
  setNodesFetchStatus,
  setPoolsFetchStatus,

  setMonitorTypes,
  setMonitorsLoading,
  setMonitors,
  setMonitorsFetchStatus,



  setProfileTypes,
  setProfilesLoading,
  setProfiles,
  setProfilesFetchStatus,

  setVirtualServersLoading,
  setVirtualServers,
  setVirtualServersFetchStatus,

  cleanUp

} from '../_store/store.f5'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;

import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const refreshIcon = <ReloadOutlined style={{color: 'white' }}  />
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
      /*
      if (this.props.authorizations && (this.props.authorizations.nodes_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchNodes()
      }
      */
      if (this.props.authorizations && (this.props.authorizations.monitors_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchMonitors()
      }
      /*
      if (this.props.authorizations && (this.props.authorizations.pools_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchPools()
      }*/
      if (this.props.authorizations && (this.props.authorizations.profiles_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
        this.fetchProfiles()
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
      //this.fetchNodes()
      this.fetchMonitors()
      //this.fetchPools()
      this.fetchProfiles()
      this.fetchVirtualServers()
    }
    /*
    if ( (this.props.nodesFetchStatus === 'updated') ) {
      this.fetchNodes()
      this.props.dispatch(setNodesFetchStatus(''))
    }
    */
    if ( (this.props.monitorsFetchStatus === 'updated') ) {
      this.fetchMonitors()
      this.props.dispatch(setMonitorsFetchStatus(''))
    }/*
    if ( (this.props.poolsFetchStatus === 'updated') ) {
      this.fetchPools()
      this.props.dispatch(setPoolsFetchStatus(''))
    }*/
    if ( (this.props.profilesFetchStatus === 'updated') ) {
      this.fetchProfiles()
      this.props.dispatch(setProfilesFetchStatus(''))
    }
    if ( (this.props.virtualServersFetchStatus === 'updated') ) {
      this.fetchVirtualServers()
      this.props.dispatch(setVirtualServersFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }


  fetchAssets = async () => {
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
/*
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
*/

  fetchMonitors = async () => {
    this.props.dispatch(setMonitorsLoading(true))

    let monitorTypes = await this.fetchMonitorsTypeList()
    this.props.dispatch(setMonitorTypes(monitorTypes.data.items))

    let monitors = await this.monitorsLoop(monitorTypes.data.items)
    this.props.dispatch(setMonitorsLoading(false))
    this.props.dispatch(setMonitors(monitors))
  }

  fetchMonitorsTypeList = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/`, this.props.token)
    return r
  }

  monitorsLoop = async types => {

    const promises = types.map(async type => {
      const resp = await this.fetchMonitorsByType(type)
      resp.data.items.forEach(item => {
        Object.assign(item, {type: type});
      })
      return resp
    })

    const response = await Promise.all(promises)

    let list = []
    response.forEach(r => {
      r.data.items.forEach(m => {
       list.push(m)
      })
    })
    return list
  }

  fetchMonitorsByType = async (type) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = resp
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${type}/`, this.props.token)
    return r
  }

/*
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

*/
  fetchProfiles = async () => {
    this.props.dispatch(setProfilesLoading(true))

    let profileTypes = await this.fetchProfilesTypeList()
    this.props.dispatch(setProfileTypes(profileTypes.data.items))

    let profiles = await this.profilesLoop(profileTypes.data.items)
    this.props.dispatch(setProfilesLoading(false))
    this.props.dispatch(setProfiles(profiles))
  }

  fetchProfilesTypeList = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/`, this.props.token)
    return r
  }

  profilesLoop = async types => {

    const promises = types.map(async type => {
      const resp = await this.fetchProfilesByType(type)
      resp.data.items.forEach(item => {
        Object.assign(item, {type: type});
      })
      return resp
    })

    const response = await Promise.all(promises)

    let list = []
    response.forEach(r => {
      r.data.items.forEach(m => {
       list.push(m)
      })
    })

    return list
  }

  fetchProfilesByType = async (type) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = resp
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/${type}/`, this.props.token)
    return r
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

  nodesRefresh = () => {
    this.props.dispatch(setNodesFetchStatus('updated'))
  }

  poolsRefresh = () => {
    this.props.dispatch(setPoolsFetchStatus('updated'))
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

          <Tabs type="card">
            { this.props.authorizations && (this.props.authorizations.nodes_get || this.props.authorizations.any) ?
              <TabPane key="Nodes" tab=<span>Nodes <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.nodesRefresh()}/></span>>
                {this.props.nodesLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Nodes/> }
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
              <TabPane key="Pools" tab=<span>Pools <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.poolsRefresh()}/></span>>
                {this.props.poolsLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Pools/> }
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

  nodesLoading: state.f5.nodesLoading,
  poolsLoading: state.f5.poolsLoading,
  //nodesFetchStatus: state.f5.nodesFetchStatus,

  monitors: state.f5.monitors,
  monitorsFetchStatus: state.f5.monitorsFetchStatus,

  //poolsFetchStatus: state.f5.poolsFetchStatus,

  profiles: state.f5.profiles,
  profilesFetchStatus: state.f5.profilesFetchStatus,

  virtualServers: state.f5.virtualServers,
  virtualServersFetchStatus: state.f5.virtualServersFetchStatus
}))(F5);
