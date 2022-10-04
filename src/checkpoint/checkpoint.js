import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from './error'

import AssetSelector from './assetSelector'
import Hosts from './hosts/manager'

import {
  assets,
  assetsError,

  hostsFetch,
  networksFetch,

} from '../checkpoint/store'


const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Checkpoint extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      this.assetsGet()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  assetsGet = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState( {loading: false}, () => this.props.dispatch(assets(resp)) )
      },
      error => {
        this.setState( {loading: false}, () => this.props.dispatch(assetsError(error)) )
      }
    )
    await rest.doXHR("checkpoint/assets/", this.props.token)
  }

  hostsRefresh = () => {
    this.props.dispatch(hostsFetch(true))
  }


  render() {
    return (
      <React.Fragment>
        <AssetSelector/>
        <Divider style={{borderBottom: '3vh solid #f0f2checkpoint'}}/>

        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
          <Tabs type="card">
          { this.props.authorizations && (this.props.authorizations.hosts_get || this.props.authorizations.any) ?
            <React.Fragment>
              {this.props.hostsLoading ?
                <TabPane key="Hosts" tab="Hosts">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
              :
                <TabPane key="Hosts" tab=<span>Hosts <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.hostsRefresh()}/></span>>
                  <Hosts/>
                </TabPane>
              }
            </React.Fragment>
          :
            null
          }

          </Tabs>

          { this.props.assetsError ? <Error component={'checkpoint'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  hostsLoading: state.checkpoint.hostsLoading,

  assetsError: state.checkpoint.assetsError,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain
}))(Checkpoint);
