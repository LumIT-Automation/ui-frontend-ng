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

  componentDidMount() {
    console.log('mount App')
    console.log('this.props', this.props)
    console.log('prevState', this.state)
    this.main()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('update App')
    console.log('prevProps', prevProps)
    console.log('this.props', this.props)
    console.log('prevState', prevState)
    console.log('prevState', this.state)
  }

  componentWillUnmount() {
    console.log('unmount App')
  }

  main = async () => {
    await this.authenticate()

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

  authenticate = async () => {
      let token, username;
      try {
        token = document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1];
        username = document.cookie.split('; ').find(row => row.startsWith('username')).split('=')[1];

        if (token && username) {
          this.props.dispatch(login({
            authenticated: true,
            username: username,
            token: token
            })
          )
        }
        else {
          this.props.dispatch(login({authenticated: false}))
        }
      }
      catch (e) {
      }
  }

  render() {
    if (this.props.authenticated) {
      return <Concerto/>
    }
    else {
      return <Login/>
    }
  }
}



export default connect((state) => ({
  authenticated: state.authentication.authenticated,
  username: state.authentication.username,
  token: state.authentication.token
}))(App);
