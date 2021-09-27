import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Rest from "../_helpers/Rest";
import Error from '../error'

import AssetSelector from './assetSelector'
import Containers from './containersTemp/manager'
import Networks from './networks/manager'


//import CertificateAndKey from './certificates/container'

import {
  setInfobloxAssets,

  setContainersLoading,
  setContainers,
  setContainersFetchStatus,

  setNetworksLoading,
  setNetworks,
  setNetworksFetchStatus,

  cleanUp

} from '../_store/store.infoblox'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



class Infoblox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      this.fetchInfobloxAssets()
      if (this.props.authorizations && (this.props.authorizations.containers_get || this.props.authorizations.any ) && this.props.infobloxAsset  ) {
        this.fetchContainers()
      }
      if (this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any ) && this.props.infobloxAsset  ) {
        this.fetchNetworks()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (this.props.authorizations !== prevProps.authorizations) {
      this.fetchInfobloxAssets()
    }
    if ( ((prevProps.infobloxAsset !== this.props.infobloxAsset) && (this.props.infobloxAsset !== null)) ) {
      this.fetchContainers()
      this.fetchNetworks()
    }
    if ( (this.props.containersFetchStatus === 'updated') ) {
      this.fetchContainers()
      this.props.dispatch(setContainersFetchStatus(''))
    }
    if ( (this.props.networksFetchStatus === 'updated') ) {
      this.fetchNetworks()
      this.props.dispatch(setNetworksFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }


  fetchInfobloxAssets = async () => {
    console.log('fetcho assets')
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(setInfobloxAssets( resp )))
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  fetchContainers = async () => {
    console.log('fetcho containers')
    this.props.dispatch(setContainersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({error: false}, () => this.props.dispatch(setContainers(resp)) )
        this.props.dispatch(setContainersLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setContainersLoading(false)))
      }
    )
    await rest.doXHR(`infoblox/${this.props.infobloxAsset.id}/network-containers/`, this.props.token)
  }

  fetchNetworks = async () => {
    console.log('fetcho networks')
    this.props.dispatch(setNetworksLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.setState({error: false}, () => this.props.dispatch(setNetworks(resp)) )
        this.props.dispatch(setNetworksLoading(false))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setNetworksLoading(false)))
      }
    )
    await rest.doXHR(`infoblox/${this.props.infobloxAsset.id}/networks/`, this.props.token)
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
            { this.props.authorizations && (this.props.authorizations.containers_get || this.props.authorizations.any) ?
              <TabPane tab="Containers" key="Containers">
                <Containers/>
              </TabPane>
              : null
            }
            { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
              <TabPane tab="Networks" key="Networks">
                <Networks/>
              </TabPane>
              : null
            }

          </Tabs>

          {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.infoblox,

  infobloxAsset: state.infoblox.infobloxAsset,
  partition: state.infoblox.partition,

  networks: state.infoblox.networks,
  networksFetchStatus: state.infoblox.networksFetchStatus,

  containers: state.infoblox.containers,
  containersFetchStatus: state.infoblox.containersFetchStatus,

}))(Infoblox);
