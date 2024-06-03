import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import store from './_store/store';
import './index.css';

/*
Index is the React Component mounted on <div> in the HTML file (Single Page Application).

The general idea is to have the components and functionalities ready and requesting data on demand from /backend.

It is important to note that when the browser refreshes the page, it probably calls the reverse proxy on a different route from / /auth and /backend.
The reverse proxy reverses the browser call to the microserver that only delivers index.html, the only file it has,
So the apache of frontend microserver rewrites to /index.html.
When the browser receives index.html, the app state is lost (store redux and component states).

Index imports the store and provides it to Login and App.
App has the routes, so index.html knows to route the URL refreshed.
*/

const Index = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

ReactDOM.render(<Index />, document.getElementById('root'));
