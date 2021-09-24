import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import F5 from './f5/manager'
import Infoblox from './infoblox/manager'
import Error from '../error'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
//const { Search } = Input;


/*
This is the parent component of the f5 category.

At mount it calls /assets/ to get the list of assets present in udb and it sets it in the store.
The other components will recive as props:
  state.f5.assets

Then render sub Tabs

if there is a error (no assetList in the response) renders Error component.
It also pass to Error's props the callback resetError() in order to reset Error state and haide Error component.

At the unmount it reset state.f5 in the store.
*/


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
            <TabPane tab="F5" key="f5">
              {this.props.f5assetsLoading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <F5/> }
            </TabPane>
            :
            null
          }
          { this.props.f5auth && (this.props.f5auth.assets_get || this.props.f5auth.any) ?
            <TabPane tab="Infoblox" key="infoblox">
              {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <Infoblox/> }
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
