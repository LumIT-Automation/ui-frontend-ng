import React from 'react'
import { Component, } from "react";

import Rest from './_helpers/Rest'
//import Error from './ConcertoError'
import Login from './Login'
import Concerto from './Concerto'
import { login, uiconf } from './_store/store.authentication'

import './App.css';
import 'antd/dist/antd.css';
import {connect} from "react-redux";



class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    await this.authenticate()
    this.main()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  authenticate = async () => {
    let token, username;
    try {
      token = document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1];
      username = document.cookie.split('; ').find(row => row.startsWith('username')).split('=')[1];

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
    }
  }

  main = async () => {
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



  render() {
    if (this.props.username && this.props.token) {
      return <Concerto/>
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
