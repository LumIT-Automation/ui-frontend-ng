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
import Groups from './groups/manager'
import Networks from './networks/manager'
import AddressRanges from './address_ranges/manager'
import ApplicationSites from './application_sites/manager'

import {
  assets,
  assetsError,

  hostsFetch,
  groupsFetch,
  networksFetch,
  address_rangesFetch,
  application_sitesFetch,

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
  groupsRefresh = () => {
    this.props.dispatch(groupsFetch(true))
  }
  networksRefresh = () => {
    this.props.dispatch(networksFetch(true))
  }
  address_rangesRefresh = () => {
    this.props.dispatch(address_rangesFetch(true))
  }
  application_sitesRefresh = () => {
    this.props.dispatch(application_sitesFetch(true))
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
          { this.props.authorizations && (this.props.authorizations.groups_get || this.props.authorizations.any) ?
            <React.Fragment>
              {this.props.groupsLoading ?
                <TabPane key="Groups" tab="Groups">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
              :
                <TabPane key="Groups" tab=<span>Groups <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.groupsRefresh()}/></span>>
                  <Groups/>
                </TabPane>
              }
            </React.Fragment>
          :
            null
          }
          { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
            <React.Fragment>
              {this.props.networksLoading ?
                <TabPane key="Networks" tab="Networks">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
              :
                <TabPane key="Networks" tab=<span>Networks <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>
                  <Networks/>
                </TabPane>
              }
            </React.Fragment>
          :
            null
          }
          { this.props.authorizations && (this.props.authorizations.address_ranges_get || this.props.authorizations.any) ?
            <React.Fragment>
              {this.props.address_rangesLoading ?
                <TabPane key="Address Ranges" tab="Address Ranges">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
              :
                <TabPane key="Address Ranges" tab=<span>Address Ranges <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.address_rangesRefresh()}/></span>>
                  <AddressRanges/>
                </TabPane>
              }
            </React.Fragment>
          :
            null
          }
          { this.props.authorizations && (this.props.authorizations.application_sites_get || this.props.authorizations.any) ?
            <React.Fragment>
              {this.props.application_sitesLoading ?
                <TabPane key="Custom Application Sites" tab="Custom Application Sites">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
              :
                <TabPane key="Custom Application Sites" tab=<span>Custom Application Sites <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.application_sitesRefresh()}/></span>>
                  <ApplicationSites/>
                </TabPane>
              }
            </React.Fragment>
          :
            null
          }
          <React.Fragment>
            <TabPane key="Rules" tab="Rules">
              <Tabs>
                { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.networksLoading ?
                      <TabPane key="Access Rules" tab="Access Rules">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                    :
                      <TabPane key="Access Rules" tab=<span>Access Rules <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>
                        {<React.Fragment>
                          <p>Search:</p>
                          <p>hosts</p>
                          <p>groups</p>
                          <p>custom-apps</p>
                          <p>network</p>
                          <p>ranges</p>
                        </React.Fragment>
                        }
                      </TabPane>
                    }
                  </React.Fragment>
                :
                  null
                }
                { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.networksLoading ?
                      <TabPane key="Threat Rules" tab="Threat Rules">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                    :
                      <TabPane key="Threat Rules" tab=<span>Threat Rules <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>

                      </TabPane>
                    }
                  </React.Fragment>
                :
                  null
                }
                { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.networksLoading ?
                      <TabPane key="Https Rules" tab="Https Rules">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                    :
                      <TabPane key="Https Rules" tab=<span>Https Rules <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>

                      </TabPane>
                    }
                  </React.Fragment>
                :
                  null
                }
                { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.networksLoading ?
                      <TabPane key="NAT Rules" tab="NAT Rules">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                    :
                      <TabPane key="NAT Rules" tab=<span>NAT Rules <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.networksRefresh()}/></span>>

                      </TabPane>
                    }
                  </React.Fragment>
                :
                  null
                }
              </Tabs>
            </TabPane>
          </React.Fragment>


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
  groupsLoading: state.checkpoint.groupsLoading,
  networksLoading: state.checkpoint.networksLoading,
  address_rangesLoading: state.checkpoint.address_rangesLoading,
  application_sitesLoading: state.checkpoint.application_sitesLoading,

  assetsError: state.checkpoint.assetsError,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain
}))(Checkpoint);
