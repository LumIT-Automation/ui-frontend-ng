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

import Homepage from './concerto/homepage'
import Historys from './concerto/historys'

import Devices from './fortinetdb/devices'
import Ddosses from './fortinetdb/ddosses'
import Projects from './fortinetdb/projects'

import Infoblox from './infoblox/infoblox'
import Checkpoint from './checkpoint/checkpoint'
import F5 from './f5/f5'
import F5bis from './f5bis/f5bis'
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

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }

  render() {
    console.log(this.props.error)
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
                  {this.props.authorizationsFortinetdb ?
                    <Route exact path='/' component={Homepage}/>
                  :
                    null
                  }

                  <Route exact path='/historys/' component={Historys}/>

                  <Route path='/projects/' component={Projects}/>
                  <Route path='/devices/' component={Devices}/>
                  <Route path='/ddosses/' component={Ddosses}/>

                  { this.props.authorizationsInfoblox && this.authorizators(this.props.authorizationsInfoblox) ?
                    <Route path='/infoblox/' component={Infoblox}/>
                  :
                    null
                  }

                  { this.props.authorizationsCheckpoint && this.authorizators(this.props.authorizationsCheckpoint) ?
                    <Route path='/checkpoint/' component={Checkpoint}/>
                  :
                    null
                  }

                  { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
                    <Route path='/f5/' component={F5}/>
                  :
                    null
                  }
                  { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
                    <Route path='/f5bis/' component={F5bis}/>
                  :
                    null
                  }
                  { this.props.authorizationsF5 && this.authorizators(this.props.authorizationsF5) ?
                    <Route path='/certificatesandkeys/' component={CertificatesAndKeys}/>
                  :
                    null
                  }
                  <Route path='/services/' component={Service}/>

                  { this.props.authorizationsWorkflow && this.authorizators(this.props.authorizationsWorkflow) ?
                    <Route path='/workflows/' component={Workflow}/>
                  :
                    null
                  }

                  <Route path='/assets/' component={Assets}/>

                  { this.props.authorizations && this.authorizators(this.props.authorizations) ?
                    <Route path='/permissions/' component={Permissions}/>
                  :
                    null
                  }

                  { this.props.authorizations && this.authorizators(this.props.authorizations) ?
                    <Route path='/triggers/' component={Triggers}/>
                  :
                    null
                  }

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
  authorizationsWorkflow: state.authorizations.workflow,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsF5: state.authorizations.f5,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsFortinetdb: state.authorizations.fortinetdb,

  
}))(Concerto);
