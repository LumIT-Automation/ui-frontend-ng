import React from 'react'
import {connect} from "react-redux"
import { Component, } from "react"

import './App.css'
import 'antd/dist/antd.css'
import { Layout, Avatar, Menu, Dropdown, Image, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import LogoFW from './svg/logo-fw.png'

import {
  logout
} from './_store/store.authentication'

const { Header, Content } = Layout;



class HeaderCustom extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
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

  deleteCookies = async () => {
      try {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ";
        return 'OK'
      }
      catch(e) {
        console.log('no logout')
      }
  }

  logout = async () => {
    await this.deleteCookies()
    await this.props.dispatch(logout())
    document.location.href = '/'
  }


  render() {
    const menu = (
      <Menu>
        <Menu.Item key="logout" onClick={() => this.logout()}>Logout</Menu.Item>
      </Menu>
    )

    const Logo = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={'64px'}
        width={'64px'}
        />
      }
    const Banner = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={50}
        width={'100%'}
        style={{marginTop: '7px'}}
        />
      }

    return (
      <Header className="header" style={{padding: '0 10px'}}>
        <Row>
          { this.props.logoWhite ?
            <Col span={1} style={{display: 'flex', justifyContent: 'center'}}>
              <Logo data={this.props.logoWhite}/>
            </Col>
          :
            <Col span={1} style={{display: 'flex', justifyContent: 'center'}}>
            </Col>
          }

          { this.props.banner ?
            <Col offset={1} span={4} style={{display: 'flex', justifyContent: 'center'}}>
              <Banner data={this.props.banner}/>
            </Col>
          :
            <Col offset={1} span={4} style={{display: 'flex', justifyContent: 'center'}}>
            </Col>
          }
          <Col span={14} style={{display: 'flex', justifyContent: 'center'}}>
          </Col>

          { this.props.authenticated ?
            <Col span={4}>
              <div>
                <Dropdown overlay={menu} trigger={['click']}>
                  <Avatar
                  style={{float: "right", marginTop: '15px'}}
                  icon={<UserOutlined/>}
                  //onClick={() => this.logout()}
                  >
                  </Avatar>
                </Dropdown>
                <p style={{float: "right", marginRight: '15px', color: 'white'}}>{this.props.username}</p>
              </div>
            </Col>
          :
            null
          }
        </Row>
      </Header>
    )
  }
}


export default connect((state) => ({
  authenticated: state.authentication.authenticated,
  username: state.authentication.username,
  //token: state.authentication.token,
  logoWhite: state.authentication.logoWhite,
  banner: state.authentication.banner

}))(HeaderCustom);