import React from 'react'
import { Component } from "react";

import Rest from './_helpers/Rest'
import Login from './Login'
import Concerto from './Concerto'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { login, uiconf } from './_store/store.authentication'
import { authorizations, authorizationsError } from './_store/store.authorizations'

import './App.css';
import 'antd/dist/antd.css';
import {connect} from "react-redux";

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    await this.uiConfSet()
    await this.authenticate()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.token && (prevProps.token !== this.props.token)) {
      this.authorizations()
    }
    if (!this.props.token) {
      this.authenticate()
    }
  }

  componentWillUnmount() {
  }

  uiConfSet = async () => {
    let conf = await this.uiConfGet()
    if (conf.status && conf.status !== 200 ) {
      //this.props.dispatch(authorizationsError(authorizationsFetched))
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
      console.log(e)
      await this.props.dispatch(login({username: undefined, token: undefined}))
    }
  }

  authorizations = async () => {
    await this.setState({authorizationsLoading: true})
    let authorizationsFetched = await this.authorizationsGet()
    await this.setState({authorizationsLoading: false})
    if (authorizationsFetched.status && authorizationsFetched.status !== 200 ) {
      this.props.dispatch(authorizationsError(authorizationsFetched))
      return
    }
    else {
      this.props.dispatch(authorizations( authorizationsFetched ))
    }
  }


  uiConfGet = async () => {
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
    await rest.doXHR(`ui-config/`)
    return r
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


  render() {
    if (localStorage.getItem('token') && localStorage.getItem('username')) {
      if (this.state.authorizationsLoading) {
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
