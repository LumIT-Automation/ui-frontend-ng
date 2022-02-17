import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd'

import Rest from "../_helpers/Rest"
import Error from '../error/infobloxError'

import AssetSelector from './assetSelector'
import Tree from './tree/manager'
import {
  assets,
  networksFetch,
  treeFetch
} from '../_store/store.infoblox'

import 'antd/dist/antd.css'
import '../App.css'

import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
        this.setState({loading: false}, () => this.props.dispatch(assets( resp )))
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  treeRefresh = () => {
    this.props.dispatch(treeFetch(true))
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

          </Tabs>


        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,

  tree: state.infoblox.tree,
  treeLoading: state.infoblox.treeLoading,

}))(Infoblox);
