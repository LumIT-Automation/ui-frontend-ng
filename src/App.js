import React from 'react'
import { Component, } from "react";

import Login from './Login'
import Concerto from './Concerto'
import { login } from './_store/store.auth'


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
    this.isAuthenticated()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  isAuthenticated = () => {
    return new Promise( (resolve, reject) => {
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
        resolve()
      }
      catch (e) {
        //reject(e)
      }
    })
  }

  render() {

    if (this.props.authenticated) {
      return <Concerto/>
    }

    else {
      return <Login/>;
    }

  }
}

export default connect((state) => ({
  authenticated: state.ssoAuth.authenticated,
}))(App);
