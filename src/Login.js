import React from 'react';
import { Component, } from "react";
import { connect } from 'react-redux'

import { Layout, Form, Input, Button, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import Rest from "./_helpers/Rest";
import Error from './error'

import { login } from './_store/store.auth'

import 'antd/dist/antd.css';

const { Header } = Layout;


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: "",
    }

  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
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

          //this.fetchAuthorizations()
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

  render() {

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
}

export default connect((state) => ({

}))(Login);
