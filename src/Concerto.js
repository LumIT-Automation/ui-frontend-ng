import React from 'react'
import { Component, } from "react"
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Rest from './_helpers/Rest'
import Error from './ConcertoError'

import {
  logout
} from './_store/store.authentication'
import {
  authorizations,
  authorizationsError
} from './_store/store.authorizations'

import { Layout, Avatar, Menu, Dropdown  } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import CustomSider from './concerto/sider'
import Homepage from './homepage/homepage'
import Historys from './concerto/historys'
import Service from './concerto/services'
import Assets from './concerto/assets'
import Permissions from './concerto/permissions'
import Configurations from './concerto/configurations'

import Devices from './fortinetdb/devices'
import Ddosses from './fortinetdb/ddosses'
import Projects from './fortinetdb/projects'
import Infoblox from './infoblox/infoblox'
import F5 from './f5/f5'
import CertificatesAndKeys from './certificatesAndKeys/certificatesAndKeys'




import './App.css';
import 'antd/dist/antd.css';
import {connect} from "react-redux";

const { Header, Content } = Layout;



class Concerto extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.fetchAuthorizations()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  fetchAuthorizations = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(authorizations( resp ))
      },
      error => {
        this.props.dispatch(authorizationsError(error))
      }
    )
    await rest.doXHR(`authorizations/`, this.props.token)
  }

  resetPassword = () => {
  }

  deleteCookies = () => {
      try {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ";
        return 'OK'
      }
      catch(e) {
        console.log('no logout')
      }
  }

  logout = async () => {
    await this.deleteCookies()
    this.props.dispatch(logout())
    document.location.href = '/'
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

    return (

      <Layout style={{overflow: 'initial'}}>
        <Header className="header">
          <p style={{float: "left", marginRight: '15px', color: 'white'}}>Concerto</p>
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
                  <Route exact path='/historys/' component={Historys}/>

                      <Route path='/projects/' component={Projects}/>
                      <Route path='/devices/' component={Devices}/>
                      <Route path='/ddosses/' component={Ddosses}/>



                  { this.props.infobloxAuth && (this.props.infobloxAuth || this.props.infobloxAuth.any) ?
                    <Route path='/infoblox/' component={Infoblox}/>
                    : null
                  }

                  { this.props.f5auth && (this.props.f5auth || this.props.f5auth.any) ?
                    <Route path='/f5/' component={F5}/>
                    : null
                  }
                  { this.props.f5auth && (this.props.f5auth || this.props.f5auth.any) ?
                    <Route path='/certificatesandkeys/' component={CertificatesAndKeys}/>
                    : null
                  }
                  <Route path='/services/' component={Service}/>
                  <Route path='/assets/' component={Assets}/>
                  { this.props.f5auth && (this.props.f5auth.permission_identityGroups_get || this.props.f5auth.any) ?
                    <Route path='/permissions/' component={Permissions}/>
                    : null
                  }
                  <Route path='/configurations/' component={Configurations}/>

                </Switch>
              </Content>
            </Layout>
          </Layout>
        </BrowserRouter>

        { this.props.authorizationsError ? <Error error={[this.props.authorizationsError]} visible={true} type={'authorizationsError'} /> : null }

      </Layout>
    )
  }
}


export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token,

  authorizations: state.authorizations,
  f5auth: state.authorizations.f5,
  infobloxAuth: state.authorizations.infoblox,
  fortinetdbAuth: state.authorizations.fortinetdbAuth,

  authorizationsError: state.authorizations.authorizationsError,
}))(Concerto);
