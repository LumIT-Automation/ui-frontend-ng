import React from 'react';
import ReactDOM from 'react-dom';
import { Component, } from "react";
import { Provider} from 'react-redux';

import Login from './Login'
import App from './App';

import store from './_store/store'

import './index.css';


/*
Index is the React Component mounted on <div> in the html file (Single Page Application).

The general idea is to have the components and functionalities ready and requesting data on demand from /backend.

It is important to note that when browser refreshes the page it probably calls the reverse proxy on a different route from / /auth and /backend.
The revp reverse the browser call to the microserver that only delivers index.html, the only file it has,
So the apache of frontend microserver rewrites to /index.html.
when the broswer receives index.html the app state is lost (store redux and component states).

Index imports the store and provide it to Login and App.
App has the routes, then the index.html knows to routes the url refreshed.

*/

class Index extends Component {


  render() {
    return (
      <Provider store={store}>
        <Login/>
        <App/>
      </Provider>
    );
  }
}

ReactDOM.render(<Index/>, document.getElementById("root"));
