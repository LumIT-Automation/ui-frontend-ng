import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import Authorizators from '../_helpers/authorizators'
import F5 from '../f5/history/manager'
import Infoblox from '../infoblox/history/manager'

import { historysFetch as f5HistorysFetch } from '../f5/store'
import { historysFetch as infobloxHistorysFetch } from '../infoblox/store'

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
          </Tabs>
        </Space>

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  authorizationsF5: state.authorizations.f5,
  authorizationsInfoblox: state.authorizations.infoblox,

  infobloxLoading: state.infoblox.historysLoading,
  f5Loading: state.f5.historysLoading
}))(Historys);
