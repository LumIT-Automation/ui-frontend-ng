import React from 'react'
import {connect} from "react-redux"
import { Component, } from "react"
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import './App.css'
import 'antd/dist/antd.css'
import { Layout, Avatar, Menu, Dropdown  } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import Rest from './_helpers/Rest'
import Error from './ConcertoError'
import Authorizators from './_helpers/authorizators'

import {
  logout
} from './_store/store.authentication'

import {
  authorizations,
  authorizationsError
} from './_store/store.authorizations'

import {
  configuration as configurationF5,
  configurationLoading as configurationF5Loading,
  configurationFetch as configurationF5Fetch,
  configurationError as configurationF5Error
} from './f5/store'

import CustomSider from './concerto/sider'
import Homepage from './concerto/homepage'
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

const { Header, Content } = Layout;



class Concerto extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.main()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.configurationF5Fetch) {
      this.props.dispatch(configurationF5Fetch(false))
      this.main()
    }
  }

  componentWillUnmount() {
  }


  main = async () => {

    this.props.dispatch(configurationF5Loading(true))
    let confF5 = await this.configurationF5Get()
    this.props.dispatch(configurationF5Loading(false))
    if (confF5.status && confF5.status !== 200 ) {
      this.props.dispatch(configurationF5Error(confF5))
    }
    else {
      let configuration = JSON.parse(confF5.data.configuration)
      if (Array.isArray(configuration)) {
        this.props.dispatch(configurationF5( configuration ))
      }
      else {
        let e = {
          message: 'Configuration bad format',
          reason: 'Configuration bad format',
          status: 500,
          type: 'basic',
          url: 'https://10.0.111.10/backend/f5/configuration/global/'
        }
        this.props.dispatch(configurationF5Error(e))
        this.props.dispatch(configurationF5( [] ))
      }
    }

    let authorizationsFetched = await this.authorizationsGet()
    if (authorizationsFetched.status && authorizationsFetched.status !== 200 ) {
      this.props.dispatch(authorizationsError(authorizationsFetched))
      return
    }
    else {
      this.props.dispatch(authorizations( authorizationsFetched ))
    }

  }


  authorizationsGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`authorizations/`, this.props.token)
    return r
  }

  configurationF5Get = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR("f5/configuration/global/", this.props.token)
    return r
  }

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  deleteCookies = async () => {
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
    await this.props.dispatch(logout())
    document.location.href = '/'
  }


  render() {
    console.log(this.props.authorizations)
    const menu = (
      <Menu>
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

                  { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
                    <Route path='/infoblox/' component={Infoblox}/>
                  :
                    null
                  }

                  { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
                    <Route path='/f5/' component={F5}/>
                  :
                    null
                  }
                  { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
                    <Route path='/certificatesandkeys/' component={CertificatesAndKeys}/>
                  :
                    null
                  }
                  <Route path='/services/' component={Service}/>
                  <Route path='/assets/' component={Assets}/>
                  { this.props.authorizations && this.authorizators(this.props.authorizations) ?
                    <Route path='/permissions/' component={Permissions}/>
                  :
                    null
                  }
                  <Route path='/configurations/' component={Configurations}/>

                </Switch>
              </Content>
            </Layout>
          </Layout>
        </BrowserRouter>

        { this.props.authorizationsError ? <Error error={[this.props.authorizationsError]} visible={true} type={'authorizationsError'} /> : null }
        { this.props.configurationF5Error ? <Error error={[this.props.configurationF5Error]} visible={true} type={'configurationF5Error'} /> : null }

      </Layout>
    )
  }
}


export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token,

  authorizations: state.authorizations,
  configurationF5Fetch: state.f5.configurationFetch,

  authorizationsF5: state.authorizations.f5,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsFortinetdb: state.authorizations.fortinetdb,

  authorizationsError: state.authorizations.authorizationsError,
  configurationF5Error: state.f5.configurationError,
}))(Concerto);
