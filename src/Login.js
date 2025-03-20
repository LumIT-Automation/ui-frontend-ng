import React, { useState } from 'react';
import { connect } from 'react-redux'

import { Layout, Form, Input, Button, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import Rest from "./_helpers/Rest";
import HeaderCustom from './header'

import { login } from './_store/store.authentication'

import 'antd/dist/reset.css';

const { Header } = Layout;


function Login(props) {
  const [error, setError] = useState('');

  const onFormSubmit = async data => {
    if (data.username && data.password) {
      let rest = new Rest(
        "POST",
        resp => {
          usernameAndTokenSet(data, resp)
        },
        error => {
          setError(error.message)
        })
      await rest.doXHR("login", "", {username: data.username, password: data.password});
    }
  }

  const usernameAndTokenSet = async (data, resp) => {
    await setError('')
    await localStorageSet(data.username, resp.access)
    await props.dispatch(login({
      username: data.username,
      token: resp.access
    }))
  }

  const localStorageSet = async (username, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }


  if (!error) {
    return (
      <Layout>
        <HeaderCustom/>
        <Row type="flex" justify="center" align="middle" style={{minHeight: '80vh', overflow: "hidden"}}>
          <Col span={4}>
            <Card>
              <Form
                  name="normal_login"
                  className="login-form"
                  initialValues={{
                    remember: true,
                  }}
                  onFinish={onFormSubmit}
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
              <p>{error}</p>
              <Button onClick={() => setError('')} type="primary" htmlType="submit" className="login-form-button">
                Retry
              </Button>
            </Card>

          </Col>
        </Row>
      </Layout>
    );
  }
}

export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token
}))(Login);
