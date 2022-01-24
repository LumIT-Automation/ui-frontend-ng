import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd';

import Rest from "../_helpers/Rest"
import Error from '../error'

import AssetSelector from './assetSelector'
import Nodes from './nodes/manager'
import Monitors from './monitors/manager'
import Pools from './pools/manager'
import Profiles from './profiles/manager'
import VirtualServers from './virtualServers/manager'

import {
  setAssets,
  nodesFetch,
  monitorsFetch,
  poolsFetch,
  profilesFetch,
  virtualServersFetch
} from '../_store/store.f5'

import 'antd/dist/antd.css';
import '../App.css'

import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setAssets( resp )))
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }


  nodesRefresh = () => {
    this.props.dispatch(nodesFetch(true))
  }

  monitorsRefresh = () => {
    this.props.dispatch(monitorsFetch(true))
  }

  poolsRefresh = () => {
    this.props.dispatch(poolsFetch(true))
  }

  profilesRefresh = () => {
    this.props.dispatch(profilesFetch(true))
  }

  virtualServersRefresh = () => {
    this.props.dispatch(virtualServersFetch(true))
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
              <React.Fragment>
              {this.props.nodesLoading ?
              <TabPane key="Nodes" tab="Nodes">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
              :
              <TabPane key="Nodes" tab=<span>Nodes <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.nodesRefresh()}/></span>>
                <Nodes/>
              </TabPane>
              }
              </React.Fragment>
              :
              null
            }

            { this.props.authorizations && (this.props.authorizations.monitors_get || this.props.authorizations.any) ?
              <React.Fragment>
              {this.props.monitorsLoading ?
              <TabPane key="Monitors" tab="Monitors">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
              :
              <TabPane key="Monitors" tab=<span>Monitors <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.monitorsRefresh()}/></span>>
                <Monitors/>
              </TabPane>
            }
              </React.Fragment>
              :
              null
            }

            { this.props.authorizations && (this.props.authorizations.pools_get || this.props.authorizations.any) ?
              <React.Fragment>
              {this.props.poolsLoading ?
              <TabPane key="Pools" tab="Pools">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
              :
              <TabPane key="Pools" tab=<span>Pools <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.poolsRefresh()}/></span>>
                <Pools/>
              </TabPane>
            }
              </React.Fragment>
              :
              null
            }

            { this.props.authorizations && (this.props.authorizations.profiles_get || this.props.authorizations.any) ?
              <React.Fragment>
              {this.props.profilesLoading ?
              <TabPane key="Profiles" tab="Profiles">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
              :
              <TabPane key="Profiles" tab=<span>Profiles <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.profilesRefresh()}/></span>>
                <Profiles/>
              </TabPane>
            }
              </React.Fragment>
              :
              null
            }

            { this.props.authorizations && (this.props.authorizations.virtualServers_get || this.props.authorizations.any) ?
              <React.Fragment>
              {this.props.virtualServersLoading ?
              <TabPane key="Virtual Servers" tab="Virtual Servers">
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              </TabPane>
              :
              <TabPane key="Virtual Servers" tab=<span>Virtual Servers <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.virtualServersRefresh()}/></span>>
                <VirtualServers/>
              </TabPane>
            }
              </React.Fragment>
              :
              null
            }

            {/* this.props.authorizations && (this.props.authorizations.certificate_post || this.props.authorizations.any) ?
              <TabPane tab="Certificates" key="4">
                <CertificateAndKey/>
              </TabPane>
              : null
            */}

          </Tabs>

          {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,

  nodesLoading: state.f5.nodesLoading,
  monitorsLoading: state.f5.monitorsLoading,
  poolsLoading: state.f5.poolsLoading,
  profilesLoading: state.f5.profilesLoading,
  virtualServersLoading: state.f5.virtualServersLoading,

}))(F5);
