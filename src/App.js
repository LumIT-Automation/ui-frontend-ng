import React from 'react'
import { Component, } from "react";

import Login from './Login'
import Concerto from './Concerto'
import { login } from './_store/store.authentication'

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
    console.log(link)

    this.authenticate()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


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
