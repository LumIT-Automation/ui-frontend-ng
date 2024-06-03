import React from 'react'
import {connect} from "react-redux"
import { Component } from "react"
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import './App.css'
import 'antd/dist/antd.css'
import { Layout } from 'antd'

import Error from './concerto/error'
import Authorizators from './_helpers/authorizators'
import HeaderCustom from './header'

import CustomSider from './concerto/sider'

import Historys from './concerto/historys'

import Infoblox from './infoblox/infoblox'
import Checkpoint from './checkpoint/checkpoint'
import F5 from './f5/f5'
import CertificatesAndKeys from './certificatesAndKeys/certificatesAndKeys'

import Service from './concerto/services'
import Workflow from './concerto/workflows'

import Assets from './concerto/assets'
import Permissions from './concerto/permissions'
import Triggers from './concerto/triggers/triggers'

import Configurations from './concerto/configurations'





const { Content } = Layout;


class Concerto extends Component {

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

  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  render() {
    
    return (
      <Layout style={{overflow: 'initial'}}>
        <HeaderCustom/>
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

                  <Route exact path='/historys/' component={Historys}/>

                  { this.isAuthorized(this.props.authorizations, 'infoblox') ?
                    <Route path='/infoblox/' component={Infoblox}/>
                  :
                    null
                  }

                  { this.isAuthorized(this.props.authorizations, 'checkpoint') ?
                    <Route path='/checkpoint/' component={Checkpoint}/>
                  :
                    null
                  }

                  { this.isAuthorized(this.props.authorizations, 'f5') ?
                    <Route path='/f5/' component={F5}/>
                  :
                    null
                  }
                  { this.isAuthorized(this.props.authorizations, 'f5') ?
                    <Route path='/certificatesandkeys/' component={CertificatesAndKeys}/>
                  :
                    null
                  }

                  <Route path='/services/' component={Service}/>
                  <Route path='/workflows/' component={Workflow}/>
                  <Route path='/assets/' component={Assets}/>
                  <Route path='/permissions/' component={Permissions}/>
                  <Route path='/triggers/' component={Triggers}/>
                  <Route path='/configurations/' component={Configurations}/>

                </Switch>
              </Content>
            </Layout>
          </Layout>
        </BrowserRouter>

        { 
          (this.props.error && 
            this.props.error.errorType === 'authorizationsError') ? 
            <Error error={[this.props.error]} visible={true}/> 
          : 
            null        
        }

      </Layout>
    )
  }
}


export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token,
  logoWhite: state.authentication.logoWhite,

  error: state.concerto.err,

  authorizations: state.authorizations,  
}))(Concerto);
