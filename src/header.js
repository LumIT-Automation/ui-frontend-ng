import React from 'react'
import {connect} from "react-redux"
import { Component, } from "react"

import './App.css'
import 'antd/dist/antd.css'
import { Layout, Avatar, Menu, Dropdown, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import {
  logout
} from './_store/store.authentication'

const { Header } = Layout;



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

  localStorageRemove = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    catch(e) {
      console.log(e)
    }
  }

  logout = async () => {
    await this.localStorageRemove()
    await this.props.dispatch( logout() )
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
        width={'350px'}
        style={{marginBottom: '2px'}}
        alt='Banner'
      />
    }

    const Logo = ({ data }) => {
      return <img
        src={`data:${data}`}
        height={'64px'}
        width={'64px'}
        alt='Logo'
      />
    }

    const menu = (
      <Menu>
        <Menu.Item key="logout" onClick={async () => await this.logout()}>Logout</Menu.Item>
      </Menu>
    )


    return (
      <Header className="header" style={{padding: '0 10px', backgroundColor: HeaderColor()}}>
        <Row>
          { this.props.banner ?
            <React.Fragment>
              <Col span={4} style={{justifyContent: 'center'}}>
                <Banner data={this.props.banner}/>
              </Col>
              <Col span={15} style={{justifyContent: 'center'}}>
              </Col>
            </React.Fragment>
          :
            <React.Fragment>
              {this.props.logoWhite ?
                <React.Fragment>
                  <Col span={1} style={{display: 'flex', justifyContent: 'center'}}>
                    <Logo data={this.props.logoWhite}/>
                  </Col>
                  <Col span={18} style={{display: 'flex', justifyContent: 'center'}}>
                  </Col>
                </React.Fragment>
              :
                <React.Fragment>
                  <Col span={4}>
                  </Col>
                  <Col span={15} style={{display: 'flex', justifyContent: 'center'}}>
                  </Col>
                </React.Fragment>
              }
            </React.Fragment>
          }


          { (this.props.username && this.props.token) ?
            <Col span={5} style={{paddingRight: '10px'}}>
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
  username: state.authentication.username,
  token: state.authentication.token,
  logoWhite: state.authentication.logoWhite,
  banner: state.authentication.banner,
  headerColor: state.authentication.headerColor

}))(HeaderCustom);
