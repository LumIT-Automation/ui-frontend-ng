import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import Authorizators from '../_helpers/authorizators'
import Infoblox from '../infoblox/history/manager'
import Checkpoint from '../checkpoint/history/manager'
import F5 from '../f5/history/manager'
import Vmware from '../vmware/history/manager'

import { historysFetch as infobloxHistorysFetch } from '../infoblox/store'
import { historysFetch as f5HistorysFetch } from '../f5/store'
import { historysFetch as checkpointHistorysFetch } from '../checkpoint/store'
import { historysFetch as vmwareHistorysFetch } from '../vmware/store'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Historys extends React.Component {

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
            { this.authorizators(this.props.authorizationsInfoblox) ?
              <React.Fragment>
                {this.props.infobloxLoading ?
                  <TabPane key="Infoblox" tab="Infoblox">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="infoblox" tab=<span>Infoblox <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(infobloxHistorysFetch(true))}/></span>>
                    <Infoblox/>
                  </TabPane>
                }
              </React.Fragment>
            :
              null
            }

            { this.authorizators(this.props.authorizationsCheckpoint) ?
              <React.Fragment>
                {this.props.checkpointLoading ?
                  <TabPane key="Checkpoint" tab="Checkpoint">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="checkpoint" tab=<span>Checkpoint <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(checkpointHistorysFetch(true))}/></span>>
                    <Checkpoint/>
                  </TabPane>
                }
              </React.Fragment>
            :
              null
            }

            { this.authorizators(this.props.authorizationsF5) ?
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(f5HistorysFetch(true))}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
            :
              null
            }

            { this.authorizators(this.props.authorizationsVmware) ?
              <React.Fragment>
                {this.props.vmwareLoading ?
                  <TabPane key="Vmware" tab="Vmware">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="vmware" tab=<span>Vmware <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(vmwareHistorysFetch(true))}/></span>>
                    <Vmware/>
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

  infobloxLoading: state.infoblox.historysLoading,
  checkpointLoading: state.checkpoint.historysLoading,
  f5Loading: state.f5.historysLoading,
  vmwareLoading: state.vmware.historysLoading,

}))(Historys);
