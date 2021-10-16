import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table, Divider } from 'antd'

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'

import AssetSelector from './assetSelector'
import Tree from './tree/manager'
//import Containers from './containersTemp/manager'
//import Networks from './networks/manager'


//import CertificateAndKey from './certificates/container'

import {
  setAssets,

  /*
  setContainersLoading,
  setContainers,
  setContainersFetch,
  */

  setNetworksFetch,

  setTreeFetch,

  cleanUp

} from '../_store/store.infoblox'

import 'antd/dist/antd.css';
import '../App.css'

import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const refreshIcon = <ReloadOutlined style={{color: 'white' }}  />



class Infoblox extends React.Component {

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
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

/*
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
    await rest.doXHR(`infoblox/${this.props.asset.id}/network-containers/`, this.props.token)
  }
*/

  treeRefresh = () => {
    this.props.dispatch(setTreeFetch(true))
  }

  networksRefresh = () => {
    this.props.dispatch(setNetworksFetch(true))
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
            { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
              <TabPane tab="Tree" tab=<span>Network Tree <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.treeRefresh()}/></span>>
                {this.props.networksLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Tree/> }
              </TabPane>
              : null
            }
            {/* this.props.authorizations && (this.props.authorizations.containers_get || this.props.authorizations.any) ?
              <TabPane tab="Containers" key="Containers">
                <Containers/>
              </TabPane>
              : null
            */}
            {/* this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
              <TabPane tab="Networks" tab=<span>Networks <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>
                {this.props.networksLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Networks/> }
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
  authorizations: state.authorizations.infoblox,

  tree: state.infoblox.tree,
  treeLoading: state.infoblox.treeLoading,

  networks: state.infoblox.networks,
  networksLoading: state.infoblox.networksLoading,
/*
  containers: state.infoblox.containers,
  containersFetch: state.infoblox.containersFetch,
*/
}))(Infoblox);
