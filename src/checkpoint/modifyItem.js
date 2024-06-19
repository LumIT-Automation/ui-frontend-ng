import React, { useState, useEffect, useRef } from 'react';
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

import { Input, Button, Space, Modal, Spin, Result, Checkbox, Divider, Table, Row, Col, Radio } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />

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


function ModifyItem(props) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);
  const [commit, setCommit] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const [dataLoading, setDataLoading]  = useState(false);
  const [itemTypes, setItemTypes] = useState('');

  const [errors, setErrors] = useState({});
  const [interfaces, setInterfaces] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [domainData, setDomainData] = useState([]);
  const [domainDataPurged, setDomainDataPurged] = useState([]);
  const [request, setRequest] = useState({});
 
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    setSearchText('');
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        }
        else if ( Array.isArray(dataIndex) ) {
          let r = record[dataIndex[0]]
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase())
        }
        else {
          return ''
        }
      }
      catch (error){

      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text => {
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  //MOUNT
  
  //UPDATE
  useEffect( () => { 
    setRequest({...props.obj})

    setRequest((prevRequest) => {
      const newRequest = {...prevRequest}
      let tags = newRequest.tags 
      tags = tags.map(function(tag) {
        return tag.name;
      });
      newRequest['tags'] = tags
      return newRequest
    })
  }, [visible] );

  useEffect( () => { 
    if (visible && (props.items === 'groups') && itemTypes)  {
      dataGet()
    }
  }, [itemTypes] );

  useEffect( () => { 
    console.log('domainDataPurged', domainDataPurged)
    console.log('groupData', groupData)
    console.log(domainData)
  }, [domainDataPurged, groupData, domainData] );

  const dataGet = async () => {
    let list = []
    setDataLoading(true)

    let domData = await domainDataGet()
    if (domData.status && domData.status !== 200 ) {
      let error = Object.assign(domData, {
        component: 'groupsModify',
        vendor: 'checkpoint',
        errorType: `${itemTypes}Error`
      })
      props.dispatch(err(error))
      setDataLoading(false)
      return
    }
    else {
      domData = domData.data.items
    }
      

    let grData = await groupDataGet()
    if (grData.status && grData.status !== 200 ) {
      let error = Object.assign(grData, {
        component: 'groupsModify',
        vendor: 'checkpoint',
        errorType: `${itemTypes}Error`
      })
      props.dispatch(err(error))
      setDataLoading(false)
      return
    }
    else {
      let domDataPurged = domData.filter(a => !grData.data.items.map(b=>b.uid).includes(a.uid))
      list = grData.data.items
      list.forEach((item, i) => {
        item.groupMember = true
        item.flagged = true
      });

      setGroupData(list)
      setDomainDataPurged(domDataPurged)  
    }

    setDataLoading(false)
  }

  const groupDataGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/group/${request.uid}/${itemTypes}/`, props.token)
    return r
  }

  const domainDataGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/${itemTypes}/`, props.token)
    return r
  }

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
      else if (key === 'flagSet') {
        let item
        if (record.groupMember) {
          setGroupData((prevGroupData) => {
            let newGroupData = [...prevGroupData]
            item = newGroupData.find( o => o.uid === record.uid )
            if (value.target.checked) {
              item.flagged = true
            }
            else {
              delete item.flagged
            }
            return newGroupData
          })
        }
        else {
          setDomainDataPurged((prevDomainDataPurged) => {
            let newDomainDataPurged = [...prevDomainDataPurged]
            item = newDomainDataPurged.find( o => o.uid === record.uid )
            if (value.target.checked) {
              item.flagged = true
            }
            else {
              delete item.flagged
            }
            return newDomainDataPurged
          })
        }
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
      if (props.items === 'groups') {
        groupModify()
      } else {
        itemModify()
      }
      
    }
  }

  const itemModify = async () => {
    let b = {}
    
    if (props.items === 'networks') {
      b.data = {
        "new-name": request.name.trim(),
        "subnet4": request.subnet4 || null,
        "mask-length4": request['mask-length4'] || null,
        "subnet6": request.subnet6 || null,
        "mask-length6": request['mask-length6'] || null,
        "tags": request.tags || []
      }
    }

    else if (props.items === 'addressRanges') {
      b.data = {
        "new-name": request.name,
        "ipv4-address-first": request['ipv4-address-first'],
        "ipv4-address-last": request['ipv4-address-last']
      }
    }
    else if (props.items === 'groups') {
      b.data = {
        "new-name": request.name,
      }
    }
    
    setLoading(true)

    let endpoint = `checkpoint/${props.asset.id}/${props.domain}/${props.item}/${request.uid}/`

    if (props.items === 'addressRanges') {
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/address-range/${request.uid}/`
    }

    let rest = new Rest(
      "PATCH",
      resp => {
        setLoading(true)
        setResponse(true)
        responseF()
      },
      error => {
        error = Object.assign(error, {
          component: 'groupsModify',
          vendor: 'checkpoint',
          errorType: `${props.item}ModifyError`
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(endpoint, props.token, b)
  }

  const groupModify = async() => {
    let toAdd = []
    let toRemove = []

    domainDataPurged.forEach((item, i) => {
      if (item.flagged) {
        toAdd.push(item.uid)
      }
    });

    groupData.forEach((item, i) => {
      if (!item.flagged) {
        toRemove.push(item.uid)
      }
    });

    if (toRemove.length > 0 || toAdd.length > 0) {
      setLoading(true)

      if (toRemove.length > 0) {
        await removeHandler(toRemove)
      }

      if (toAdd.length > 0) {
        await addHandler(toAdd)
      }

      setLoading(false)
      await dataGet()

    }
  }

  const removeHandler = async (toRemove) => {
    let itemType
    switch(itemTypes) {
      case 'hosts':
        itemType = 'host'
        break;
      case 'groups':
        itemType = 'group'
        break;
      case 'networks':
        itemType = 'network'
        break;
      case 'address-ranges':
        itemType = 'address-range'
        break;
    }

    for (const item of toRemove) {
      await removeItem(item, itemType)
    }

  }

  const addHandler = async (toAdd) => {
    await addItems(toAdd)
  }

  const removeItem = async (item, itemType) => {
    let r

    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        error = Object.assign(error, {
          component: 'groupsModify',
          vendor: 'checkpoint',
          errorType: `${itemTypes}Error`
        })
        props.dispatch(err(error))
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/group/${props.obj.uid}/${itemType}/${item}/`, props.token)
    return r
  }

  const addItems = async (toAdd) => {
    let r
    let b = {}
    b.data = {
      [itemTypes]: toAdd,
    }

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        error = Object.assign(error, {
          component: 'groupsModify',
          vendor: 'checkpoint',
          errorType: `${itemTypes}Error`
        })
        props.dispatch(err(error))
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/group/${props.obj.uid}/${itemTypes}/`, props.token, b)
    return r
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
            value={request[key]}
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
          defaultValue={request[key]}
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

  //ONCLOSE
  const closeModal = () => {
    setVisible(false)
    setInterfaces([])
    setRequest({})
  }

  //eee

  let columns = [
    {
      title: 'Group member',
      align: 'center',
      dataIndex: 'groupMember',
      key: 'groupMember',
      render: (name, obj)  => (
        <React.Fragment>
          <Checkbox checked={obj.flagged} onChange={e => set('flagSet', e, obj)}/>
        </React.Fragment>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'IPv4-address',
      align: 'center',
      dataIndex: 'ipv4-address',
      key: 'ipv4-address',
     ...getColumnSearchProps('ipv4-address'),
    },
    {
      title: 'Subnet4',
      align: 'center',
      dataIndex: 'subnet4',
      key: 'subnet4',
      ...getColumnSearchProps('subnet4'),
    },
    {
      title: 'Mask-length4',
      align: 'center',
      dataIndex: 'mask-length4',
      key: 'mask-length4',
      ...getColumnSearchProps('mask-length4'),
    },
    {
      title: 'Subnet-mask',
      align: 'center',
      dataIndex: 'subnet-mask',
      key: 'subnet-mask',
      ...getColumnSearchProps('subnet-mask'),
    },
    {
      title: 'IPv4-address-first',
      align: 'center',
      dataIndex: 'ipv4-address-first',
      key: 'ipv4-address-first',
      ...getColumnSearchProps('ipv4-address-first'),
    },
    {
      title: 'IPv4-address-last',
      align: 'center',
      dataIndex: 'ipv4-address-last',
      key: 'ipv4-address-last',
      ...getColumnSearchProps('ipv4-address-last'),
    },
    {
      title: 'Domain',
      align: 'center',
      dataIndex: ['domain', 'name'],
      key: 'domain',
      ...getColumnSearchProps(['domain', 'name']),
    }
  ]

  let returnColumns = () => {
    switch(itemTypes) {
      case 'hosts':
        columns = columns.filter(col => col.dataIndex !== 'subnet4')
        columns = columns.filter(col => col.dataIndex !== 'mask-length4')
        columns = columns.filter(col => col.dataIndex !== 'subnet-mask')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-first')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-last')
        return columns
        break;
      case 'groups':
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address')
        columns = columns.filter(col => col.dataIndex !== 'subnet4')
        columns = columns.filter(col => col.dataIndex !== 'mask-length4')
        columns = columns.filter(col => col.dataIndex !== 'subnet-mask')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-first')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-last')
        return columns
        break;
      case 'networks':
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-first')
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address-last')
        return columns
        break;
      case 'address-ranges':
        columns = columns.filter(col => col.dataIndex !== 'ipv4-address')
        columns = columns.filter(col => col.dataIndex !== 'subnet4')
        columns = columns.filter(col => col.dataIndex !== 'mask-length4')
        columns = columns.filter(col => col.dataIndex !== 'subnet-mask')
        return columns
        break;
    }
    return columns
  }

  let randomKey = () => {
    return Math.random().toString()
  }

  let joinedData = () => {
    return groupData.concat(domainDataPurged)
  }
  
  const capital = (str) => {
    return str.toUpperCase()
  }

  const showErrors = () => {
    if (props.error && props.error.component === 'groupsModify') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => setVisible(true)}/>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY {capital(props.item)}</p>}
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
               title={`${props.item} Modified`}
             />
          }

          { !loading && !response &&
            <React.Fragment>
              {props.items === 'networks' ?
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
                      <Col span={6}>
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
                          <Col offset={1} span={16}>
                            <Radio.Group 
                              disabled={dataLoading} 
                              onChange={e => setItemTypes(e.target.value)} 
                              value={itemTypes}
                            >
                              <Radio value={'hosts'}>hosts</Radio>
                              <Radio value={'groups'}>groups</Radio>
                              <Radio value={'networks'}>networks</Radio>
                              <Radio value={'address-ranges'}>address ranges</Radio>
                            </Radio.Group>
                          </Col>
                        </Row>

                        <Divider/>

                        <Row>
                          <Col span={24}>
                          {dataLoading ?
                            <Spin indicator={spinIcon} style={{margin: '2% 50%'}}/>
                          :
                            <Row>
                              <Col span={24}>
                                <Table
                                  columns={itemTypes ? returnColumns() : null}
                                  dataSource={(groupData && domainDataPurged) ? joinedData() : null}
                                  bordered
                                  rowKey={randomKey}
                                  scroll={{x: 'auto'}}
                                  pagination={{ pageSize: 10 }}
                                />
                              </Col>
                            </Row>
                          }
                          </Col>
                        </Row>

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
  }))(ModifyItem);