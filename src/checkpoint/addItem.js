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

/*
Iterabili in JavaScript: Gli iterabili sono oggetti che implementano il protocollo di iterazione, il quale consente di essere iterati tramite costrutti come for...of. 
Gli esempi di iterabili includono array, stringhe, mappe, set e oggetti personalizzati che implementano il protocollo di iterazione.

Symbol.iterator: Questo è un simbolo incorporato che rappresenta una funzione che restituisce un iteratore. 
Un iteratore è un oggetto che implementa il metodo next, che restituisce un oggetto con due proprietà: value e done. 
La funzione Symbol.iterator è ciò che permette all'oggetto di essere iterato.

Sintassi di Spread: La sintassi di spread, rappresentata da ..., consente di espandere un iterabile in elementi individuali. 
Ad esempio, [...array] espande un array in elementi individuali, e function(...args) raccoglie gli argomenti passati come un array.

La sintassi ...obj e {...obj} funzionano in contesti diversi e per scopi diversi in JavaScript:

Sintassi di spread per iterabili (...iterable):
  Utilizzata con array, stringhe e altri oggetti iterabili.
  Espande gli elementi di un iterabile in un contesto in cui sono attesi più elementi, come negli array literals o nelle chiamate a funzione.

Sintassi di spread per oggetti ({...obj}):
  Utilizzata per clonare o combinare oggetti.
  Copia le proprietà di un oggetto in un nuovo oggetto.
*/


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
  const set = async (key, value, record, father) => {
    let commonFunctions = new CommonFunctions()
    try {
      if (key === 'name') {
        setRequest((prevRequest) => ({
          ...prevRequest,
          name: value
        }))
      } 
      else if (key === 'address') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest.address = value
          return newRequest
        })
      } 

      else if (key === 'recordAdd') {
        const list = await commonFunctions.itemAdd(interfaces)
        setInterfaces(list)
      } 
      else if (key === 'recordRemove') {
        const list = await commonFunctions.itemRemove(record, interfaces)
        if (list.length === 0) {
          setInterfaces([{id:1}])
        } else {
          setInterfaces(list)
        }
      }
      else if (father === 'interfaces') {
        setInterfaces((prevInterfaces) => {
          const newInterfaces = [...prevInterfaces]
          let nic = newInterfaces.find( nic => nic.id === record.id )
          nic[key] = value
          delete nic[`${key}Error`]
          return newInterfaces
        })
      }
    } 
    catch(error) {
      console.log(error)
    }
  }



  const createElement = (element, key, choices, record, action, father) => {
    if (element === 'input') {
      if (father) {
        return (
          <Input 
            style={
              errors[`${key}Error`] ?
                {
                  width: 150, 
                  borderColor: 'red'
                }
              :
                {width: 150}
            } 
            onChange={e => set(key, e.target.value, record, father)} 
          />        
        )
      }
      else if (key === 'key2') {
        return (
          <Input 
            style={
              errors[`${key}Error`] ?
                {
                  width: 250, 
                  borderColor: 'red'
                }
              :
                {width: 250}
            } 
            onChange={e => set(key, e.target.value)} 
          />        
        )
      }
      else {
        return (
          <Input 
            style={
              errors[`${key}Error`] ?
                {
                  width: 250, 
                  borderColor: 'red'
                }
              :
                {width: 250}
            } 
            onChange={e => set(key, e.target.value, record)} 
          />        
        )
      }
    }

    else if (element === 'button'){
      if (action === 'recordRemove') {
        return (
          <Button type="danger" onClick={() => set('recordRemove', '', record)}>
          -
          </Button>
        )
      }
      if (action === 'recordAdd') {
        return (
          <Button type="primary" onClick={() => set('recordAdd')}>
            +
          </Button>
        )
      }      
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
      title: 'Interface name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      render: (name, record)  => (
        createElement('input', 'nicName', '', record, '', 'interfaces')
      ),
    },
    {
      title: 'Subnet4',
      align: 'center',
      dataIndex: 'subnet4',
      key: 'subnet4',
      render: (name, record)  => (
        createElement('input', 'subnet4', '', record, '', 'interfaces')
      ),
    },
    {
      title: 'Mask-length4',
      align: 'center',
      dataIndex: 'mask-length4',
      key: 'mask-length4',
      render: (name, record)  => (
        createElement('input', 'mask-length4', '', record, '', 'interfaces')
      ),
    },
    {
      title: 'Subnet6',
      align: 'center',
      dataIndex: 'subnet6',
      key: 'subnet6',
      render: (name, record)  => (
        createElement('input', 'subnet6', '', record, '', 'interfaces')
      ),
    },
    {
      title: 'Mask-length6',
      align: 'center',
      dataIndex: 'mask-length6',
      key: 'mask-length6',
      render: (name, record)  => (
        createElement('input', 'mask-length6', '', record, '', 'interfaces')
      ),
    },
    {
      title: 'Remove request',
      align: 'center',
      dataIndex: 'remove',
      key: 'remove',
      render: (name, record)  => (
        createElement('button', '', '', record, 'recordRemove')
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
                  {createElement('input', 'name')}
                </Col>
              </Row>
              <br/>

              
              <Row>
                <Col span={1}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={4}>
                  {createElement('input', 'address')}
                </Col>
              </Row>
              <br/>

              <Divider/>

              {createElement('button', '', '', '', 'recordAdd')}

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