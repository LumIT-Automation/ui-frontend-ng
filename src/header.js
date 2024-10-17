import React, { useState, useEffect } from 'react'
import {connect} from "react-redux"

import './App.css'
import 'antd/dist/antd.css'
import Error from './concerto/error'
import JsonModal from './jsonModal'

import axios from 'axios';
import yaml from 'js-yaml';

import { Layout, Avatar, Menu, Dropdown, Row, Col, Divider } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import {
  logout
} from './_store/store.authentication'

import {
  err
} from './concerto/store'

const { Header } = Layout;


function HeaderCustom(props) {
  let [doc, setDoc] = useState({});
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [vendor, setVendor] = useState('');

  let handleOpenModal = () => {
    setIsModalVisible(true);
  };

  let handleCloseModal = () => {
    setIsModalVisible(false);
  };

  let localStorageRemove = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    catch(e) {
      console.log(e)
    }
  }

  let logoutHandler = async () => {
    await localStorageRemove()
    await props.dispatch(logout())
    document.location.href = '/'
  }


  let HeaderColor = () => {
    if (props.headerColor) {
      return props.headerColor
    }
  }

  let Banner = ({ data }) => {
    return <img
      src={`data:${data}`}
      height={50}
      width={'350px'}
      style={{marginBottom: '2px'}}
      alt='Banner'
    />
  }

  let Logo = ({ data }) => {
    return <img
      src={`data:${data}`}
      height={'64px'}
      width={'64px'}
      alt='Logo'
    />
  }

  let Documentation = async (vendor) => {
    setVendor(vendor)
    let endpoint = `/backend/${vendor}/doc/swagger.yaml/`
    let response = await fetchAndParseYaml(endpoint)
    if (response.status && response.status !== 200 ) {

      let error = Object.assign(response, {
        component: 'header',
        vendor: 'concerto',
        errorType: 'documentationError'
      })
      props.dispatch(err(error))
      return
    }
    else {
      let yamlString = Buffer.from(response.data, 'binary').toString('utf-8');
      let parsedData = yaml.load(yamlString);
  
      setDoc(parsedData)
      handleOpenModal()
    }
  }

  let fetchAndParseYaml = async(url) => {
    let response
    try {
      response = await axios.get(url, {
        responseType: 'arraybuffer', // Necessario per gestire i dati binari
        headers: {
          'Authorization': `Bearer ${props.token}`, // Sostituisci con il tuo header
        },
      });
      return response;
    } catch (error) {
      let response = {}
      response.status = error.response.status
      response.message = error.response.statusText
      response.type = error.response.type
      response.url = error.response.config.url

      const arrayBuffer = error.response.data;
      // Convertire l'Array Buffer in una stringa
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      response.reason = text

      return response;
    }
    
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'header') {
      return <Error error={[props.error]} visible={true}/> 
    }
  };

  const menu = (
    <Menu>
      <Menu.SubMenu title="Documentation">
        <Menu.Item key="infoblox" onClick={async () => await Documentation('infoblox')}>Infoblox</Menu.Item>
        <Menu.Item key="f5" onClick={async () => await Documentation('f5')}>F5</Menu.Item>
        <Menu.Item key="checkpoint" onClick={async () => await Documentation('checkpoint')}>Checkpoint</Menu.Item>
        <Menu.Item key="vmware" onClick={async () => await Documentation('vmware')}>Vmware</Menu.Item>
      </Menu.SubMenu>
      <Divider/>
      <Menu.Item key="logout" onClick={async () => await logoutHandler()}>Logout</Menu.Item>
    </Menu>
  )

  return (
    <>
      {console.log(doc)}
      <Header className="header" style={{padding: '0 10px', backgroundColor: HeaderColor()}}>
        <Row>
          { props.banner ?
            <React.Fragment>
              <Col span={4} style={{justifyContent: 'center'}}>
                <Banner data={props.banner}/>
              </Col>
              <Col span={15} style={{justifyContent: 'center'}}>
              </Col>
            </React.Fragment>
          :
            <React.Fragment>
              {props.logoWhite ?
                <React.Fragment>
                  <Col span={1} style={{display: 'flex', justifyContent: 'center'}}>
                    <Logo data={props.logoWhite}/>
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


          { (props.username && props.token) ?
            <Col span={5} style={{paddingRight: '10px'}}>
              <div>
                <Dropdown overlay={menu} trigger={['click']}>
                  <Avatar
                    style={{float: "right", marginTop: '15px'}}
                    icon={<UserOutlined/>}
                  >
                  </Avatar>
                </Dropdown>
                <p style={{float: "right", marginRight: '15px', color: 'white'}}>{props.username}</p>
              </div>
            </Col>
          :
            null
          }
        </Row>
      </Header>
      {errorsComponent()}
      {doc ?
        <JsonModal
        jsonObject={doc}
        isVisible={isModalVisible}
        handleClose={handleCloseModal}
        vendor={vendor}
      />
      : 
        null
      }
    </>
    
  )
}


export default connect((state) => ({
  username: state.authentication.username,
  token: state.authentication.token,
  logoWhite: state.authentication.logoWhite,
  banner: state.authentication.banner,
  headerColor: state.authentication.headerColor,
  error: state.concerto.err,
}))(HeaderCustom);
