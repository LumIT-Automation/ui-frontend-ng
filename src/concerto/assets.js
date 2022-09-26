import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Authorizators from '../_helpers/authorizators'
import Vmware from '../vmware/assets/manager'
import F5 from '../f5/assets/manager'
import Infoblox from '../infoblox/assets/manager'
import Checkpoint from '../checkpoint/assets/manager'

import { assetsFetch as vmwareAssetsFetch } from '../vmware/store'
import { assetsFetch as infobloxAssetsFetch } from '../infoblox/store'
import { assetsFetch as checkpointAssetsFetch } from '../checkpoint/store'
import { assetsFetch as f5AssetsFetch } from '../f5/store'


const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Assets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">

            { this.props.authorizationsVmware && this.authorizators(this.props.authorizationsVmware) ?
              <React.Fragment>
                {this.props.vmwareLoading ?
                  <TabPane key="Vmware" tab="Vmware">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="vmware" tab=<span>Vmware <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(vmwareAssetsFetch(true))}/></span>>
                    <Vmware/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

            { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
              <React.Fragment>
                {this.props.infobloxLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(infobloxAssetsFetch(true))}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

            <React.Fragment>
              {this.props.checkpointLoading ?
                <TabPane key="Checkpoint" tab="Checkpoint">
                  <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                </TabPane>
                :
                <TabPane key="checkpoint" tab=<span>Checkpoint <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(checkpointAssetsFetch(true))}/></span>>
                  <Checkpoint/>
                </TabPane>
              }
            </React.Fragment>

            { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(f5AssetsFetch(true))}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
              :
              null
            }

          </Tabs>

        </Space>
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsF5: state.authorizations.f5,
  authorizationsVmware: state.authorizations.vmware,

  infobloxLoading: state.infoblox.assetsLoading,
  checkpointLoading: state.checkpoint.assetsLoading,
  vmwareLoading: state.vmware.assetsLoading,
  f5Loading: state.f5.assetsLoading,
}))(Assets);
