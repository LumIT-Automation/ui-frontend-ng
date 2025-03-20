import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Rest from './_helpers/Rest';
import Login from './Login';
import Concerto from './Concerto';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { login, uiconf, logout } from './_store/store.authentication';
import { authorizations } from './_store/store.authorizations';
import { err } from './concerto/store';

import './App.css';
import 'antd/dist/reset.css';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

const App = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.authentication.token);
  //const username = useSelector((state) => state.authentication.username);

  useEffect(() => {
    const initialize = async () => {
      await uiConfSet();
      await authenticate();
    };
    initialize();
  }, []);

  useEffect(() => {
    const updateAuth = async () => {
      if (token) {
        await fetchAuthorizations();
      } else {
        authenticate();
      }
    };
    updateAuth();
  }, [token]);

  const uiConfSet = async () => {
    let conf = await dataGet('ui-config/');
    if (conf.status && conf.status !== 200) {
      // Handle error
    } else {
      try {
        dispatch(uiconf(conf.data.configuration));
        document.title = conf.data.configuration.page.title;
        let favicon = document.querySelector("link[rel~='icon']");
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(favicon);
        }
        favicon.href = conf.data.configuration.page.favicon;
      } catch (error) {
        // Handle error
      }
    }
  };

  const authenticate = async () => {
    let token, username;
    try {
      token = localStorage.getItem('token');
      username = localStorage.getItem('username');
      if (token && username) {
        await dispatch(login({ username, token }));
      } else {
        await dispatch(login({ username: undefined, token: undefined }));
      }
    } catch (e) {
      await dispatch(login({ username: undefined, token: undefined }));
    }
  };

  const fetchAuthorizations = async () => {
    setLoading(true);
    let data = await dataGet('authorizations/');
    setLoading(false);
    if (data.status && data.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        await dispatch(logout());
        document.location.href = '/';
      } catch (e) {
        // Handle error
      }
      return;
    } else if (data.status && data.status !== 200) {
      let error = {
        ...data,
        component: 'App.js',
        vendor: 'concerto',
        errorType: 'authorizationsError'
      };
      dispatch(err(error));
      return;
    } else {
      dispatch(authorizations(data));
    }
  };

  const dataGet = async (resource) => {
    let r;
    let rest = new Rest(
      "GET",
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );

    if (resource === 'authorizations/') {
      await rest.doXHR(`${resource}`, token);
    } else {
      await rest.doXHR(`${resource}`);
    }

    return r;
  };

  if (localStorage.getItem('token') && localStorage.getItem('username')) {
    if (loading) {
      return <Spin indicator={spinIcon} style={{ margin: '20% 48%' }} />;
    } else {
      return <Concerto />;
    }
  } else {
    return <Login />;
  }
};

export default App;
