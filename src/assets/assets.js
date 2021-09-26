import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table } from 'antd';

import F5 from './f5/manager'
import Infoblox from './infoblox/manager'
import Error from '../error'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;

import { Icon, LoadingOutlined, PlusOutlined, ReloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const refreshIcon = <ReloadOutlined style={{color: 'white' }}  />

class Assets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
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

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
          { this.props.f5auth && (this.props.f5auth.assets_get || this.props.f5auth.any) ?
            <TabPane key="f5" tab=<span>F5 <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => alert('ciao')}/></span>>
              {this.props.f5assetsLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
                <F5/>
            }
            </TabPane>
            :
            null
          }
          { this.props.infobloxAuth && (this.props.infobloxAuth.assets_get || this.props.infobloxAuth.any) ?
            <TabPane tab="Infoblox" key="infoblox">
              {this.props.infobloxAssetsLoading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <Infoblox/> }
            </TabPane>
            :
            null
          }
        </Tabs>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  f5auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,
  f5assetsLoading: state.f5.assetsLoading,
  infobloxAssetsLoading: state.infoblox.assetsLoading
}))(Assets);
