import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from '../concerto/error'

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
  const [errors, setErrors] = useState({

  });
  const [interfaces, setInterfaces] = useState([

  ]);
  const [request, setRequest] = useState({
    name: '',
    address: ''
  });
 


  //MOUNT
  useEffect( () => { 
    interfaces.push({id:1})
    setInterfaces(interfaces)
  }, [] );

  //UPDATE
  useEffect( () => { 
    if (interfaces && interfaces.length === 0) {
      interfaces.push({id:2})
      setInterfaces(interfaces)
    }
  }, [visible] );

  useEffect( () => { 
    console.log('request', request)
  }, [request] );


  //SETTER
  const set = (value, key) => {
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


  //ONCLOSE
  const closeModal = () => {
    setVisible(false)
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
                    onChange={e => set(e.target.value, 'name')} 
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
                    onChange={e => set(e.target.value, 'address')} 
                  />
                </Col>
              </Row>
              <br/>
            {/*
              <Row>
                <Col span={1}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={4}>
                  {errors.addressError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="address" id='address' onChange={e => this.addressSet(e)} />
                  :
                    <Input defaultValue={request.address} style={{width: 250}} name="address" id='name' onChange={e => this.addressSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Divider/>


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