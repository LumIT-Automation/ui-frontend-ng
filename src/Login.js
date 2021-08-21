import React from 'react';
import { Component, } from "react";
import { connect } from 'react-redux'

import { Layout, Form, Input, Button, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import Rest from "./_helpers/Rest";
import { login } from './_store/store.auth'
import { setAuthorizations } from './_store/store.authorizations'

import 'antd/dist/antd.css';

const { Header } = Layout;

/*
The first thing Login does is to see if the token and username cookies are present.
If username and token cookie are present Login sets them in the store using the login method of the auth slice.
In this way state.auth is virtually persistent to the reload of the page.

Otherwise it presents the authentication form, which if properly filled out makes the call to /auth/api/v1/token/

if the answer is correct, it sets the store and cookies.
In case of an error, print the error in a card.
*/


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: "",
    }
/*
    // Check if token already saved: in this case no login is needed.
    let token, username;



    try {
      token = document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1];
      username = document.cookie.split('; ').find(row => row.startsWith('username')).split('=')[1];

      if (token && username) {
        // Update the store.
        this.props.dispatch(login({
          authenticated: true,
          username: username,
          token: token
        })
      )
      }
      setTimeout(() => this.fetchAuthorizations(), 200)

    }
    catch (e) {
      ;
    }*/
  }

  componentDidMount() {
    this.isAuthenticated()
    .then( this.fetchAuthorizations() )
    .catch(() => this.render())
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.token && this.props.authenticated ) {
      this.fetchAuthorizations()
    }
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
          // Update the store.
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
        reject(e)
      }
    })
  }

  onFormSubmit = async data => {
    // XHR for token.
    if (data.username && data.password) {
      let rest = new Rest("POST",

        response => {
          this.setState({ // async.
            errors: ""
          });

          // Update the store; save the access token.
          this.props.dispatch(login({
            authenticated: true,
            username: data.username,
            token: response.access
          }))

          // Also, save token into a cookie.
          document.cookie = "token="+response.access;
          document.cookie = "username="+data.username;

          this.fetchAuthorizations()
        },

        error => {
          this.setState({ // async.
            errors: error.toString(),
          });
        })

      await rest.doXHR(
        "login", "", {
          username: data.username,
          password: data.password
        });
    }
  }

  fetchAuthorizations = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAuthorizations( resp ))
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`authorizations/`, this.props.token)
  }


  render() {


    if (!this.props.authenticated) {
      if (!this.state.errors) {
        return (
          <Layout>
            <Header className="header">
              <div className="logo" />
            </Header>
            <Row type="flex" justify="center" align="middle" style={{minHeight: '80vh', overflow: "hidden"}}>
              <Col span={4}>
                <Card>
                  <Form
                      name="normal_login"
                      className="login-form"
                      initialValues={{
                        remember: true,
                      }}
                      onFinish={this.onFormSubmit}
                  >
                    <Form.Item
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: 'Please input your Username',
                          },
                        ]}
                    >
                      <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                          {
                            required: true,
                            message: 'Please input your Password',
                          },
                        ]}
                    >
                      <Input
                          prefix={<LockOutlined className="site-form-item-icon" />}
                          type="password"
                          placeholder="Password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Layout>
        );
      }

      // Errors during login.
      else {
        return (
          <Layout>
            <Header className="header">
              <div className="logo" />
            </Header>
            <Row type="flex" justify="center" align="middle" style={{minHeight: '80vh', overflow: "hidden"}}>
              <Col span={4} >
                <Card title="Error">
                  <p>{this.state.errors}</p>
                  <Button onClick={() => this.setState({ errors: null})} type="primary" htmlType="submit" className="login-form-button">
                    Retry
                  </Button>
                </Card>

              </Col>
            </Row>
          </Layout>
        );
      }
    }

    // Hide this component.
    else {
      return null;
    }
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authenticated: state.ssoAuth.authenticated
}))(Login);
