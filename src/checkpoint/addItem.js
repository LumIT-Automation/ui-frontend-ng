import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

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
  const [request, setRequest] = useState({
    name: '', 
    address: '',
    tags: ''
  });
 


  //MOUNT
  useEffect( () => { 
    if (props.items === 'hosts') {
      interfaces.push({id:1})
      setInterfaces(interfaces)
    }
  }, [] );

  
  
  //UPDATE
  useEffect( () => { 
    if (props.items === 'hosts') {
      if (interfaces && interfaces.length === 0) {
        interfaces.push({id:1})
        setInterfaces(interfaces)
      }
    }
    else if (props.items === 'networks') {

    }
  }, [visible] );


  //SETTER
  const set = async (key, value, record, father) => {
    let commonFunctions = new CommonFunctions()
    try {
      //Due modi per settare la proprietà di un oggetto.
      if (key === 'name') {
        setRequest((prevRequest) => ({
          ...prevRequest,
          name: value
        }))
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors.nameError
          return newErrors
        })
      } 
      else if (key === 'address') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest.address = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors.addressError
          return newErrors
        })
      }
      else if (key === 'subnet4') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['subnet4'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors.subnet4Error
          return newErrors
        })
      }
      else if (key === 'mask-length4') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['mask-length4'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors['mask-length4Error']
          return newErrors
        })
      }
      else if (key === 'subnet6') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['subnet6'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors.subnet6Error
          return newErrors
        })
      }
      else if (key === 'mask-length6') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['mask-length6'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors['mask-length6Error']
          return newErrors
        })
      }
      else if (key === 'tags') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          let tags = value 
          tags = tags.split(',').map(function(item) {
            return item.trim();
          });
          newRequest['tags'] = tags
          return newRequest
        })
      }
      else if (key === 'ipv4-address-first') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['ipv4-address-first'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors['ipv4-address-firstError']
          return newErrors
        })
      }
      else if (key === 'ipv4-address-last') {
        setRequest((prevRequest) => {
          const newRequest = {...prevRequest}
          newRequest['ipv4-address-last'] = value
          return newRequest
        })
        setErrors((prevErrors) => {
          let newErrors = {...prevErrors}
          delete newErrors['ipv4-address-lastError']
          return newErrors
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
      console.error(error)
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

    if (props.items === 'hosts') {
      if (!request.address || !validators.ipv4(request.address)) {
        errors.addressError = true
        await setErrors(errors)
      }
    }
    else if (props.items === 'networks') {
      if (!request['subnet4'] || !validators.ipv4(request['subnet4'])) {
        errors['subnet4Error'] = true
        await setErrors(errors)
      }
  
      if (!request['mask-length4'] || !validators.mask_length4(request['mask-length4'])) {
        errors['mask-length4Error'] = true
        await setErrors(errors)
      }
    }
    else if (props.items === 'addressRanges') {
      if (!request['ipv4-address-first'] || !validators.ipv4(request['ipv4-address-first'])) {
        errors['ipv4-address-firstError'] = true
        await setErrors(errors)
      }
  
      if (!request['ipv4-address-last'] || !validators.ipv4(request['ipv4-address-last'])) {
        errors['ipv4-address-lastError'] = true
        await setErrors(errors)
      }
    }

    setCommit(true)
    return ok
  }

  const validation = async () => {
    let ok = await validationCheck()

    if ((Object.keys(errors).length === 0) && ok) {
      itemAdd()
    }
  }

  const itemAdd = async () => {
    let b = {}
    
    if (props.items === 'hosts') {
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
    }

    else if (props.items === 'networks') {
      b.data = {
        "name": request.name,
        "subnet4": request.subnet4 || null,
        "mask-length4": request['mask-length4'] || null,
        "subnet6": request.subnet6 || null,
        "mask-length6": request['mask-length6'] || null,
        "tags": request.tags || []
      }
    }

    else if (props.items === 'addressRanges') {
      b.data = {
        "name": request.name,
        "ipv4-address-first": request['ipv4-address-first'],
        "ipv4-address-last": request['ipv4-address-last']
      }
    }
    else if (props.items === 'groups') {
      b.data = {
        "name": request.name,
      }
    }
    
    setLoading(true)

    let endpoint = `checkpoint/${props.asset.id}/${props.domain}/${props.items}/`

    if (props.items === 'addressRanges') {
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/address-ranges/`
    }

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
    await rest.doXHR(endpoint, props.token, b)
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
                  width: 250, 
                  borderColor: 'red'
                }
              :
                {width: 250}
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

    else if (element === 'textArea') {
      return (
        <Input.TextArea
          rows={12}
          placeholder='tag1, tag2'
          //ref={ref => (textAreaRefs.current[`${record.id}_${key}`] = ref)}
          onBlur={event => set(key, event.target.value)}
          style=
            { errors[`${key}Error`] ?
              {borderColor: `red`, width: 250}
            :
              {width: 250}
            }
        />
      )
    }

    else if (element === 'button'){
      if (action === 'recordRemove') {
        return (
          <Button 
            type="primary"
            danger
            onClick={() => set('recordRemove', '', record)}
          >
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
          open={visible}
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
               title={`${props.item} Added`}
             />
          }

          { !loading && !response &&
            <React.Fragment>
              {props.items === 'hosts' ?
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
              :
                props.items === 'networks' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'name')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Subnet4:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'subnet4')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Mask-length4:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'mask-length4')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Subnet6:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'subnet6')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Mask-length:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'mask-length')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={9} span={1}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('textArea', 'tags')}
                      </Col>
                    </Row>
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
                :
                  props.items === 'addressRanges' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={9} span={1}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                        </Col>
                        <Col span={4}>
                          {createElement('input', 'name')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={7} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ipv4-address-first:</p>
                        </Col>
                        <Col span={4}>
                          {createElement('input', 'ipv4-address-first')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={7} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ipv4-address-last:</p>
                        </Col>
                        <Col span={4}>
                          {createElement('input', 'ipv4-address-last')}
                        </Col>
                      </Row>
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
                  :
                    props.items === 'groups' ?
                      <React.Fragment>
                        <Row>
                          <Col offset={9} span={1}>
                            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                          </Col>
                          <Col span={4}>
                            {createElement('input', 'name')}
                          </Col>
                        </Row>
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
                    :
                      null                
              }
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