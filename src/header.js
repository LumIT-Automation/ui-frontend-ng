import React from 'react'
import {connect} from "react-redux"
import { Component, } from "react"

import './App.css'
import 'antd/dist/antd.css'
import { Layout, Avatar, Menu, Dropdown, Image, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'

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
    const HeaderColor = () => {
      if (this.props.headerColor) {
        return this.props.headerColor
      }
    }

    const Banner = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={50}
        width={'160%'}
        style={{marginTop: '7px', marginLeft: '40px'}}
        //style={{marginTop: '7px', marginLeft: '-300px'}}
      />
    }

    const Logo = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={'64px'}
        width={'64px'}
      />
    }

    const menu = (
      <Menu>
        <Menu.Item key="logout" onClick={() => this.logout()}>Logout</Menu.Item>
      </Menu>
    )


    return (
      <Header className="header" style={{padding: '0 10px', backgroundColor: HeaderColor()}}>
        <Row>
          { this.props.banner ?
            <React.Fragment>
              <Col span={4} style={{display: 'flex', justifyContent: 'center'}}>
                <Banner data={this.props.banner}/>
              </Col>
              <Col span={16} style={{display: 'flex', justifyContent: 'center'}}>
              </Col>
            </React.Fragment>
          :
            <React.Fragment>
              {this.props.logoWhite ?
                <React.Fragment>
                  <Col span={1} style={{display: 'flex', justifyContent: 'center'}}>
                    <Logo data={this.props.logoWhite}/>
                  </Col>
                  <Col span={19} style={{display: 'flex', justifyContent: 'center'}}>
                  </Col>
                </React.Fragment>
              :
                <React.Fragment>
                  <Col span={4}>
                  </Col>
                  <Col span={16} style={{display: 'flex', justifyContent: 'center'}}>
                  </Col>
                </React.Fragment>
              }
            </React.Fragment>
          }


          { this.props.authenticated ?
            <Col span={4} style={{paddingRight: '10px'}}>
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
  banner: state.authentication.banner,
  headerColor: state.authentication.headerColor

}))(HeaderCustom);
