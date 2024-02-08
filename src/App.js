import React from 'react'
import { Component } from "react";

import Rest from './_helpers/Rest'
import Login from './Login'
import Concerto from './Concerto'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { login, uiconf, logout } from './_store/store.authentication'
import { authorizations } from './_store/store.authorizations'

import {
  err
} from './concerto/store'

import './App.css';
import 'antd/dist/antd.css';
import {connect} from "react-redux";

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  async componentDidMount() {
    await this.uiConfSet()
    await this.authenticate()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.token && (prevProps.token !== this.props.token)) {
      await this.authorizations()
    }
    if (!this.props.token) {
      this.authenticate()
    }
  }

  componentWillUnmount() {
  }

  
  uiConfSet = async () => {
    let conf = await this.dataGet('ui-config/')
    if (conf.status && conf.status !== 200 ) {
      //
    }
    else {
      try {
        this.props.dispatch(uiconf( conf.data.configuration ))
        document.title = conf.data.configuration.page.title
        let favicon = document.querySelector("link[rel~='icon']");
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(favicon);
        }
        favicon.href = conf.data.configuration.page.favicon
      }
      catch (error) {
      }
    }
  }

  authenticate = async () => {
    let token, username;
    try {
      token = localStorage.getItem('token');
      username = localStorage.getItem('username');

      if (token && username) {
        await this.props.dispatch(login({
          username: username,
          token: token
          })
        )
      }
      else {
        await this.props.dispatch(login({username: undefined, token: undefined}))
      }
    }
    catch (e) {
      await this.props.dispatch(login({username: undefined, token: undefined}))
    }
  }

  authorizations = async () => {
    await this.setState({loading: true})
    let data = await this.dataGet('authorizations/')
    await this.setState({loading: false})
    if (data.status && data.status === 401 ) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        await this.props.dispatch( logout() )
        document.location.href = '/'
      }
      catch(e) {
      }
      return
    }
    
    else if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'App.js',
        vendor: 'concerto',
        errorType: 'authorizationsError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      this.props.dispatch(authorizations( data ))
    }
  }

  dataGet = async (resource) => {
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

    if (resource === 'authorizations/') {
      await rest.doXHR(`${resource}`, this.props.token)
    }
    else {
      await rest.doXHR(`${resource}`)
    }
    
    return r
  }


  render() {
    if (localStorage.getItem('token') && localStorage.getItem('username')) {
      if (this.state.loading) {
        return <Spin indicator={spinIcon} style={{margin: '20% 48%'}}/>
      } else {
        return <Concerto/>
      }
    }
    else {
      return <Login/>
    }
  }
}


export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token
}))(App);
