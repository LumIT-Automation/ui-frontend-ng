import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from '../concerto/error'
import CommonFunctions from '../_helpers/commonFunctions'

import {
  err
} from '../concerto/store'

import {
  hostsFetch,
} from './store'

import { Input, Button, Space, Modal, Spin, Result, Divider, Table, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



function AddItem(props) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const [errors, setErrors] = useState({});
  const [interfaces, setInterfaces] = useState([]);
  const [request, setRequest] = useState({name: '', address: ''});
 


  //MOUNT
  useEffect( () => { 
    interfaces.push({id:1})
    setInterfaces(interfaces)
  }, [] );

  

  //UPDATE
  useEffect( () => { 
    if (interfaces && interfaces.length === 0) {
      interfaces.push({id:1})
      setInterfaces(interfaces)
    }
  }, [visible] );

  useEffect( () => { 
    console.log('request', request)
  }, [request] );

  useEffect( () => { 
    console.log('interfaces', interfaces)
  }, [interfaces] );



  //SETTER
  const setRequestHandler = (key, value) => {

    setRequest((prevRequest) => {
      const newRequest = {...prevRequest}

      if (key === 'name') {
        newRequest.name = value
      } else if (key === 'address') {
        newRequest.address = value
      }
      return newRequest
    })

  }


  const setInterfacesHandler = async (key, value, item) => {
    let commonFunctions = new CommonFunctions()
    try {

      if (key === 'itemAdd') {
        const list = await commonFunctions.itemAdd(interfaces)
        setInterfaces(list)
      } else if (key === 'itemRemove') {
        const list = await commonFunctions.itemRemove(item, interfaces)
        if (list.length === 0) {
          setInterfaces([{id:1}])
        } else {
          setInterfaces(list)
        }
       
      }


    } catch(error) {
      console.log(error)
    }
  }
 

  const columns = [
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      key: 'id',
      name: 'dable',
      description: '',
    },
    {
      title: 'Remove request',
      align: 'center',
      dataIndex: 'remove',
      key: 'remove',
      render: (name, obj)  => (
        <Button type="danger" onClick={() => setInterfacesHandler('itemRemove', '', obj)}>
          -
        </Button>
      ),
    }
  ]

  //ONCLOSE
  const closeModal = () => {
    setVisible(false)
    setInterfaces([])
    setRequest({})
  }
  

  return (
    <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => setVisible(true)}/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD HOST</p>}
          centered
          destroyOnClose={true}
          visible={visible}
          footer={''}
          onOk={() => setVisible(true)}
          onCancel={closeModal}
          width={1500}
          maskClosable={false}
        >
          { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !loading && response &&
            <Result
               status="success"
               title="Host Added"
             />
          }

          { !loading && !response &&
            <React.Fragment>
              <Row>
                <Col span={1}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={4}>
                  <Input 
                    style={
                      errors.nameError ?
                        {width: 250, borderColor: 'red'}
                      :
                        {width: 250}
                    } 
                    onChange={e => setRequestHandler('name', e.target.value)} 
                  />
                </Col>
              </Row>
              <br/>


              <Row>
                <Col span={1}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={4}>
                  <Input 
                    style={
                      errors.addressError ?
                        {width: 250, borderColor: 'red'}
                      :
                        {width: 250}
                    } 
                    onChange={e => setRequestHandler('address', e.target.value)} 
                  />
                </Col>
              </Row>
              <br/>

              <Divider/>

              <Button type="primary" onClick={() => setInterfacesHandler('itemAdd')}>
                +
              </Button>
              <br/>
              <br/>
              <Table
                columns={columns}
                dataSource={interfaces}
                bordered
                rowKey="id"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />

              <br/>


            {/*
              <Button type="primary" onClick={() => this.interfaceAdd()}>
                +
              </Button>
              <br/>
              <br/>
              <Table
                columns={columns}
                dataSource={interfaces}
                bordered
                rowKey="id"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />

              <br/>


              <Row>
                <Col offset={11} span={2}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Host
                  </Button>
                </Col>
              </Row>
          */}
            </React.Fragment>
          }
        </Modal>


      </Space>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
  authorizations: state.authorizations,
  
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  }))(AddItem);