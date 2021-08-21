import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Rest from "../_helpers/Rest";
import Error from '../error'

import Container from './f5/container'

import 'antd/dist/antd.css';
import '../App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
//const { Search } = Input;


/*
This is the parent component of the loadbalancer category.

At mount it calls /assets/ to get the list of assets present in udb and it sets it in the store.
The other components will recive as props:
  state.loadbalancer.assets

Then render sub Tabs

if there is a error (no assetList in the response) renders Error component.
It also pass to Error's props the callback resetError() in order to reset Error state and haide Error component.

At the unmount it reset state.loadbalancer in the store.
*/


class Groups extends React.Component {

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

    //console.log(this.props.permissions)

    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
          <TabPane tab="F5" key="2">
            <Container/>
          </TabPane>

        </Tabs>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
}))(Groups);
