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
  fetchItems,
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
  const [response, setResponse] = useState(false);
  const [commit, setCommit] = useState(true);

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



  const validationCheck = async () => {
    setCommit(false)
    let validators = new Validators()
    let ok = true

    if (!request.name) {
      errors.nameError = true
      await setErrors(errors)
    }
    else {
      delete errors.nameError
      await setErrors(errors)
    }

    if (!request.address || !validators.ipv4(request.address)) {
      errors.addressError = true
      await setErrors(errors)
    }
    else {
      delete errors.addressError
      await setErrors(errors)
    }
    //await setInterfaces(interfaces)

    setCommit(true)
    return ok
  }

  const validation = async () => {
    let nicsOk = await validationCheck()

    if ((Object.keys(errors).length === 0) && nicsOk) {
      itemAdd()
    }
  }

  const itemAdd = async () => {
    let b = {}
    let nics = []

    b.data = {
      "ipv4-address": request.address,
      "name": request.name,
    }
    if (interfaces.length > 0 && interfaces[0].name) {
      interfaces.forEach((nic, i) => {
        let o = {}
        o.name = nic.nicName
        o.nic.subnet4 = nic.subnet4
        o.nic.subnet6 = nic.subnet6
        o['mask-length4'] = nic.mask_length4
        o['mask-length6'] = nic.mask_length6
        nics.push(o)
      });
      b.data.interfaces = nics
    }

    setLoading(true)

    let rest = new Rest(
      "POST",
      resp => {
        setLoading(true)
        setResponse(true)
        responseF()
      },
      error => {
        error = Object.assign(error, {
          component: `${props.item}Add`,
          vendor: 'checkpoint',
          errorType: `${props.item}AddError`
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/${props.items}/`, props.token, b)
  }


  const responseF = () => {
    setTimeout( () => setResponse(false), 2000)
    setTimeout( () => props.dispatch(fetchItems(true)), 2030)
    setTimeout( () => closeModal(), 2050)
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
 
  const returnCol = () => {
    if (props.items === 'hosts') {
      return hostsCol
    }
  }

  const hostsCol = [
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
  
  const capital = (str) => {
    console.log(str)
    return str.toUpperCase()
  }

  const showErrors = () => {
    if (props.error && props.error.component === `${props.item}Add`) {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => setVisible(true)}/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD {capital(props.item)}</p>}
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
                columns={returnCol()}
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
                <Button 
                  type="primary"
                  disable={!commit} 
                  onClick={() => validation()}
                >
                  Commit
                </Button>
              </Col>
            </Row>
          
            </React.Fragment>
          }
        </Modal>

        {showErrors()}


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