import React from 'react'
import { Component, } from "react";

import Rest from './_helpers/Rest'
import Error from './ConcertoError'
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
    document.title = "dfsdfsdfsd"

    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    //link.href = "/fava.ico"
    link.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAMFBMVEU0OkArMjhobHEoPUPFEBIuO0L+AAC2FBZ2JyuNICOfGx7xAwTjCAlCNTvVDA1aLzQ3COjMAAAAVUlEQVQI12NgwAaCDSA0888GCItjn0szWGBJTVoGSCjWs8TleQCQYV95evdxkFT8Kpe0PLDi5WfKd4LUsN5zS1sKFolt8bwAZrCaGqNYJAgFDEpQAAAzmxafI4vZWwAAAABJRU5ErkJggg=="
    this.main()

  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  main = async () => {
    await this.authenticate()

    let conf = await this.uiConfGet()
    if (conf.status && conf.status !== 200 ) {
      //this.props.dispatch(authorizationsError(authorizationsFetched))
      return
    }
    else {
      this.props.dispatch(uiconf( conf.data.configuration ))
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
      }
      catch (e) {
      }
  }

/*
  authenticate = () => {
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
      }
    })
  }
*/

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
}))(App);
