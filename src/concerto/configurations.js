import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin } from 'antd';

import F5 from '../f5/configuration/manager'

import { configurationFetch as f5ConfigurationFetch } from '../f5/store.f5'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Configuration extends React.Component {

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


  render() {
    return (
      <React.Fragment>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
          <Tabs type="card">
              <React.Fragment>
                {this.props.f5Loading ?
                  <TabPane key="F5" tab="F5">
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                  :
                  <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.props.dispatch(f5ConfigurationFetch(true))}/></span>>
                    <F5/>
                  </TabPane>
                }
              </React.Fragment>
          </Tabs>
        </Space>

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  f5Auth: state.authorizations.f5,

  f5Loading: state.f5.configurationLoading
}))(Configuration);
