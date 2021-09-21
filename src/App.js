import React from 'react'
import { Component, } from "react";
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Rest from "./_helpers/Rest";
import Error from './error'

import { logout } from './_store/store.auth'
import { setAuthorizations } from './_store/store.authorizations'
import { setInfobloxAssets, setInfobloxAssetsFetchStatus } from './_store/store.infoblox'

import { Layout, Avatar, Divider, Menu, Dropdown  } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import CustomSider from './sider/sider'
import CustomBreadcrumb from './breadcrumb'

import Homepage from './home/homepage'
import Infoblox from './infoblox/infoblox'
import F5 from './f5/f5'
import CertificatesAndKeys from './certificatesAndKeys/certificatesAndKeys'
import Service from './services/services'
import Assets from './assets/assets'
import Permissions from './permissions/permissions'


import './App.css';
import 'antd/dist/antd.css';
import {connect} from "react-redux";

const { Header, Content } = Layout;


/*
App receives authenticated and username from the store and maps them as props.

If the user is authenticated, the App component is rendered.
It contains all the app's components.

It performs the following functions:
  provides the Header that provides the possibility to Logout,
  provides the Sider that contains the links to the pages,
  has the Routes to render the components that match the url,
  wraps all components with the BrowserRouter, thus providing methods in each component's props.
*/


class App extends Component {

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


  resetPassword = () => {
    /*
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAuthorizations( resp ))
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`authorizations/`, this.props.token)
    */
  }

  resetError = () => {
    this.setState({ error: null})
  }

  deleteCookies = (token, username) => {
    return new Promise( (resolve, reject) => {
      try {
        document.cookie = `${token}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; `
        document.cookie = `${username}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; `

        if ( document.cookie.search("token") === -1 && document.cookie.search("username") === -1  ) {
          resolve()
        }
      }
      catch(e) {
        reject(e)
      }
    })
  }

  logout = () => {
    this.deleteCookies('token', 'username').then( this.props.dispatch( logout() ) )
  }

  render() {
    const menu = (
      <Menu>
        {this.props.username === 'admin@automation.local' ?
          <Menu.Item key="resetPassword" onClick={() => this.resetPassword()}>Reset Password</Menu.Item>
          : null
        }
        <Menu.Divider />
        <Menu.Item key="logout" onClick={() => this.logout()}>Logout</Menu.Item>
      </Menu>
    )

    if (this.props.authenticated) {
      return (
        <Layout style={{overflow: 'initial'}}>
          <Header className="header">
            <div>
              <Dropdown overlay={menu} trigger={['click']}>
                <Avatar
                style={{float: "right", marginTop: '15px'}}
                icon={<UserOutlined/>}
                //onClick={() => this.logout()}
                >
                </Avatar>
              </Dropdown>
              <p style={{float: "right", marginRight: '15px', color: 'white'}}>{this.props.username}</p>
            </div>
          </Header>
          <BrowserRouter>
            <Layout>
              <CustomSider/>
              <Layout style={{padding: '0 24px 24px'}}>

                <Content
                  className="site-layout-background"
                  style={{
                    margin: '3vh 0vw 0vh 0vw',
                    minHeight: '100vh',
                  }}
                >
                  <Switch>

                    <Route exact path='/' component={Homepage}/>
                    <Route path='/infoblox/' component={Infoblox}/>
                    <Route path='/f5/' component={F5}/>
                    <Route path='/certificatesandkeys/' component={CertificatesAndKeys}/>
                    <Route path='/services/' component={Service}/>
                    <Route path='/assets/' component={Assets}/>

                    { this.props.authorizations && (this.props.authorizations.permission_identityGroups_get || this.props.authorizations.any) ?
                      <Route path='/permissions/' component={Permissions}/>
                      : null
                    }

                  </Switch>
                </Content>
              </Layout>
            </Layout>
          </BrowserRouter>

          {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}
        </Layout>
      );
    }

    // Hide this component.
    else {
      return null;
    }

  }
}

export default connect((state) => ({
  authenticated: state.ssoAuth.authenticated,
  username: state.ssoAuth.username,
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  permissions: state.permissions,
  infobloxAssetsLoading: state.infoblox.infobloxAssetsLoading,
  infobloxAssets: state.infoblox.infobloxAssets,
  infobloxAssetsFetchStatus: state.infoblox.infobloxAssetsFetchStatus,
}))(App);
