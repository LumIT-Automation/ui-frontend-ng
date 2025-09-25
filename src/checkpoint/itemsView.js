import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/reset.css';
import '../App.css'
import { Space, Table, Input, Select, Button, Spin, List, Checkbox, Radio, Card } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'

import AddItem from './addItem'
import AddASItem from './addApplicationSite'
import AddDSItem from './addDatacenterServer'
import AddDQItem from './addDatacenterQuery'

import ModifyItem from './modifyItem'
import ModifyASItem from './modifyApplicationSite'

import {
  fetchItems,
} from './store'

import {
  err
} from '../concerto/store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function ItemsView(props) {
  const [disableCommit, setDisableCommit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originitems, setOriginitems] = useState([]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  
  const myRefs = useRef(null);
  const textAreaRefs = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  //UPDATE
  useEffect(() => {
    if (props.asset && props.domain && props.items) {
      main();
    }
  }, [props.asset, props.domain, props.items]);


  useEffect(() => {
    if (props.fetchItems) {
      props.dispatch(fetchItems(false))
      main()
    }
  }, [props.fetchItems]);


  /*
    Antd Table methods for search, filter and order data
  */

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



  /*
    Fetching Data, Rendering in a table, Add/Remove items
  */

  const main = async () => {
    setItems([])
    setOriginitems([])
    setLoading(true)
    let id = 1
    
    if (props.items === 'hosts') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.address = item['ipv4-address']
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }
    else if (props.items === 'networks') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }
    else if (props.items === 'address-ranges') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }
    else if (props.items === 'groups') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }

    else if (props.items === 'application-sites') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }

    else if (props.items === 'datacenter-servers') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }
    else if (props.items === 'datacenter-queries') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: `${props.items}Error`
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(items)
        setOriginitems(items)
        setLoading(false)
      }
    }
  }

  const dataGet = async (assetId, entities) => {
    let endpoint
    let r

    endpoint = `${props.vendor}/${assetId}/${props.domain}/${props.items}/`

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, props.token)
    return r
  }

  const itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(item, items)
    setItems(list)
  }


  /*
    Setting item's values
  */

  const set = async (key, value, record, father) => {
    try {
      //let items = [...items]
      if (father) {

      }
      else {
        if (key === 'toDelete') {
          setItems((prevItems) => {
            const newItems = [...prevItems]
            let item = newItems.find( i => i.id === record.id )
            if (value) {
              item.toDelete = true
            }
            else {
              delete item.toDelete
            }
            return newItems
          })          
        }
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  /*
    This component, at the moment, doesn't add or modify so it has non sense validate. 

    Validate data before send them to backend
  */

  const validationCheck = async () => {
    let errors = 0
    let validators = new Validators()

    if (props.items === 'hosts') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if ( !(validators.ipv4(item.address) || validators.ipv6(item.address) || item.address === 'any6') ) {
          item.addressError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'networks') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'address-ranges') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'groups') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'application-sites') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'datacenter-servers') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'datacenter-queries') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
  }

  const validation = async () => {
    setDisableCommit(true)
    let errors = await validationCheck()
    
    setDisableCommit(false)
    if (errors === 0) {
      setDisableCommit(true)
      cudManager()
    }
  }

  /*
    Send Data to backend
  */
 
  const cudManager = async () => {
    let toPost = []
    let toDelete = []
    let toPatch = []

    for (const item of Object.values(items)) {
      if (!item.existent) {
        toPost.push(item)
      }
      if (item.toDelete) {
        toDelete.push(item)
      }
      if (item.isModified && Object.keys(item.isModified).length > 0) {
        toPatch.push(item)
      }
    }

    if (toDelete.length > 0) {
      for (const item of toDelete) {
        // Copia dell'elemento da modificare
        const updatedItem = { ...item, loading: true };
    
        // Aggiornamento dello stato
        await setItems(prevItems => prevItems.map(prevItem => prevItem.id === item.id ? updatedItem : prevItem));
    
        // Esecuzione dell'operazione asincrona
        let e = await itemDelete(updatedItem);
    
        // Gestione del risultato dell'operazione asincrona
        if (e.status && e.status !== 200) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `delete${props.item}Error`
          });
          props.dispatch(err(error));
          updatedItem.loading = false;
          await setItems(prevItems => prevItems.map(prevItem => prevItem.id === item.id ? updatedItem : prevItem));
        } else {
          updatedItem.loading = false;
          await setItems(prevItems => prevItems.map(prevItem => prevItem.id === item.id ? updatedItem : prevItem));
        }
      }
    }
/*
    if (toPost.length > 0) {
      for (const item of toPost) {
        let body = {}

        if (props.items === 'hosts') {
          body.data = {
            "address": item.address,
            "name": item.name,
            "session": item.session,
            "state": item.state
          }
        }

        item.loading = true
        await setItems(items)

        let e = await itemPost(body)
        if (e.status && e.status !== 201 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `add${props.items}Error`
          })
          props.dispatch(err(error))
          item.loading = false
          await setItems(items)
        }
        else {
          item.loading = false
          await setItems(items)
        }
      }
    }

    if (toPatch.length > 0) {
      for (const item of toPatch) {
        let body = {}

        item.loading = true
        await setItems(items)

        let e = await itemPatch(item.name, item.type ? item.type : null, body)
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `edit${props.item}Error`
          })
          props.dispatch(err(error))
          item.loading = false
          await setItems(items)
        }
        else {
          item.loading = false
          await setItems(items)
        }
      }
    }
    */

    setDisableCommit(false)
    main()
  }

  const itemPost = async (body) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.domain}/${props.items}/`, props.token, body )
    
    return r
  }

  const itemDelete = async (item, type) => {
    let endpoint = `${props.vendor}/${props.asset.id}/${props.domain}/${props.item}/${item.uid}/`

    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    await rest.doXHR(endpoint, props.token )
    
    return r
  }

  const itemPatch = async (name, type, body) => {

    let r
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )

    await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.domain}/${props.item}/${name}/`, props.token, body )
    
    return r
  }

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }


  let createElement = (element, key, choices, obj, action, father) => {
    if (element === 'input') {
      if (key === 'name') {
        return (
          <Input
            value={obj[key]}
            style=
              {obj[`${key}Error`] ?
                {borderColor: 'red', width: 200}
              :
                {width: 200}
              }
            ref={ref => myRefs[`${obj.id}_${key}`] = ref}
            onChange={event => set(key, event.target.value, obj)}
          />          
        )
      }
      else if (key === 'address') {
        return (
          <Input
            value={obj[key]}
            style=
              {obj[`${key}Error`] ?
                {borderColor: 'red', width: 200}
              :
                {width: 200}
              }
            ref={ref => myRefs[`${obj.id}_${key}`] = ref}
            onChange={event => set(key, event.target.value, obj, father)}
          />          
        )
      }
      else {
        return (
          <Input
            style=
              {obj[`${key}Error`] ?
                {borderColor: 'red', width: 200}
              :
                {width: 200}
              }
            onBlur={event => set(key, event.target.value, obj)}
          />          
        )
      }
    }

    else if (element === 'file') {
      return (
        <React.Fragment>
          <Input 
            type="file"
            style=
              { 
                obj[`textError`] ?
                {borderColor: `red`, width: 350}
              :
                {width: 350}
              }
            onChange={e => set(key, e.target.files[0], obj)} 
          />
          <Card>
            <p>Name: {obj.fileName}</p>
            <p>Type: {obj.type}</p>
            <p>Size: {obj.size} Bytes</p>
          </Card>    
        </React.Fragment>    
      )
    }

    else if (element === 'textarea') {
      return (
        <Input.TextArea
          rows={12}
          value={obj[key]}
          ref={ref => textAreaRefs[`${obj.id}_${key}`] = ref}
          onChange={event => set(key, event.target.value, obj)}
          style=
            { obj[`${key}Error`] ?
              {borderColor: `red`, width: 350}
            :
              {width: 350}
            }
        />
      )
    }

    else if (element === 'select') {
      return (
        <Select
          value={obj[key]}
          showSearch
          style={
            obj[`${key}Error`] ?
              {border: `1px solid red`, width: 120}
            :
              {width: 120}
          }
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={event => set(key, event, obj)}
        >
          <React.Fragment>
            {choices.map((c, i) => {
              return (
                <Select.Option key={i} value={c}>{c}</Select.Option>
              )
            })
            }
          </React.Fragment>
        </Select>
      )
    }

    else if (element === 'checkbox'){
      return (
        <Checkbox 
          checked={obj.toDelete}
          onChange={event => set(action, event.target.checked, obj)}
        />
      )
    }

    else if (element === 'button'){
      if (action === 'itemRemove') {
        return (
          <Button
            type="primary"
            danger
            onClick={() => itemRemove(obj, items)}
          >
            -
          </Button>
        )
      }
      else if (action === 'commit') {
        return (
          <Button
            type="primary"
            disabled={disableCommit}
            style={{float: 'right', marginRight: 5, marginBottom: 15}}
            onClick={() => validation()}
          >
            Commit
          </Button>
        )
      }
    }
  }

  let returnCol = () => {
    if (props.items === 'hosts') {
      return hostsColumns
    }
    else if (props.items === 'networks') {
      return networksColumns
    }
    else if (props.items === 'address-ranges') {
      return addressRangesColumns
    }
    else if (props.items === 'groups') {
      return groupsColumns
    }
    else if (props.items === 'application-sites') {
      return applicationSitesColumns
    }
    else if (props.items === 'datacenter-servers') {
      return datacenterServersColumns
    }
    else if (props.items === 'datacenter-queries') {
      return datacenterQueriesColumns
    }
  }

  const hostsColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'IPv4-address',
      align: 'center',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address'),
      render: (val, obj)  => (
      obj.existent ?
        val
      :
        createElement('input', 'address', '', obj, '')
    )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const networksColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
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
      title: 'Tags',
      align: 'center',
      dataIndex: 'tags',
      key: 'tags',
      render: (name, record)  => (
        <List
          size="small"
          dataSource={record.tags}
          renderItem={item => <List.Item >{item.name ? item.name : item}</List.Item>}
        />
      )
    },
    {
      title: 'Modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
      render: (name, obj)  => (
        <Space size="small">
         { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_patch`)) ? 
          <ModifyItem name={name} obj={obj} items={props.items} item={props.item}/>
          :
          '-'
        }
        </Space>
      ),
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const addressRangesColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
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
      title: 'Modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
      render: (name, obj)  => (
        <Space size="small">
         { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_patch`)) ? 
          <ModifyItem name={name} obj={obj} items={props.items} item={props.item}/>
          :
          '-'
        }
        </Space>
      ),
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const groupsColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
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
      title: 'Tags',
      align: 'center',
      dataIndex: 'tags',
      key: 'tags',
      render: (name, record)  => (
        <List
          size="small"
          dataSource={record.tags}
          renderItem={item => <List.Item >{item.name ? item.name : item}</List.Item>}
        />
      )
    },
    {
      title: 'Modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
      render: (name, obj)  => (
        <Space size="small">
         { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_patch`)) ? 
          <ModifyItem name={name} obj={obj} items={props.items} item={props.item}/>
          :
          '-'
        }
        </Space>
      ),
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const applicationSitesColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Domain',
      align: 'center',
      width: 'auto',
      dataIndex: ['domain', 'name'],
      key: 'domain',
      ...getColumnSearchProps(['domain', 'name']),
    },
    {
      title: 'Type',
      align: 'center',
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps('type'),
    },
    {
      title: 'Primary-category',
      align: 'center',
      dataIndex: 'primary-category',
      key: 'primary-category',
      ...getColumnSearchProps('primary-category'),
    },
    {
      title: 'Risk',
      align: 'center',
      dataIndex: 'risk',
      key: 'risk',
      ...getColumnSearchProps('risk'),
    },
    {
      title: 'Comments',
      align: 'center',
      width: 'auto',
      dataIndex: 'comments',
      key: 'comments',
      ...getColumnSearchProps('comments'),
    },
    {
      title: 'Description',
      align: 'center',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
    },
    {
      title: 'User-defined',
      align: 'center',
      width: 'auto',
      dataIndex: 'user-defined',
      key: 'user-defined',
      ...getColumnSearchProps('user-defined'),
    },
    {
      title: 'Creation-time',
      align: 'center',
      width: 'auto',
      dataIndex: ['meta-info', 'creation-time', 'iso-8601'],
      key: 'creation-time',
    },
    {
      title: 'Creator',
      align: 'center',
      width: 'auto',
      dataIndex: ['meta-info', 'creator'],
      key: 'creator',
      ...getColumnSearchProps(['meta-info', 'creator']),
    },
    {
      title: 'Last-modifier',
      align: 'center',
      dataIndex: ['meta-info', 'last-modifier'],
      key: 'last-modifier',
      ...getColumnSearchProps(['meta-info', 'last-modifier']),
    },
    {
      title: 'Last-modify-time',
      align: 'center',
      width: 'auto',
      dataIndex: ['meta-info', 'last-modify-time', 'iso-8601'],
      key: 'last-modify-time'
    },
    {
      title: 'Lock',
      align: 'center',
      width: 'auto',
      dataIndex: ['meta-info', 'lock'],
      key: 'lock',
      ...getColumnSearchProps(['meta-info', 'lock']),
    },
    {
      title: 'Url-list',
      align: 'center',
      dataIndex: 'url-list',
      key: 'url-list',
      render: (name, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_modify`)) ? 
          <ModifyASItem name={name} obj={obj} />
          :
          '-'
        }
        </Space>
      ),
    },
    {
      title: 'Validation-state',
      align: 'center',
      width: 'auto',
      dataIndex: ['meta-info', 'validation-state'],
      key: 'validation-state',
      ...getColumnSearchProps(['meta-info', 'validation-state']),
    },
    {
      title: 'Read-only',
      align: 'center',
      width: 'auto',
      dataIndex: 'read-only',
      key: 'read-only',
      ...getColumnSearchProps('read-only'),
    },
    {
      title: 'Tags',
      align: 'center',
      width: 'auto',
      dataIndex: 'tags',
      key: 'tags',
      ...getColumnSearchProps('tags'),
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    },/*
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <Space size="small">
          { props.authorizations && (props.authorizations.application_site_delete || props.authorizations.any) ?
          <Delete name={name} obj={obj} />
          :
          '-'
        }
        </Space>
      ),
    }*/
  ];

  const datacenterServersColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const datacenterQueriesColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (val, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.item}_delete`)) ? 
            <Space size="small">
              { obj.existent ? 
                createElement('checkbox', 'toDelete', '', obj, 'toDelete')
              :
                createElement('button', 'itemRemove', '', obj, 'itemRemove')
              }
            </Space>
            :
              '-'
            
          }
        </Space>
      ),
    }
  ];

  const showErrors = () => {
    if (props.error && props.error.component === 'itemsView') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
        <React.Fragment>
          {/*to do: createElement()*/} 
          <Radio.Group style={{marginRight: 5}}>
            <Radio.Button
              style={{marginLeft: 10 }}
              onClick={() => main()}
            >
              <ReloadOutlined/>
            </Radio.Button>
          </Radio.Group>

          {authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'checkpoint', `${props.items}_post`) ?
            <React.Fragment>
              {props.items === 'application-sites' ?
                <AddASItem items={props.items} item={props.item}/>
              :
                <React.Fragment>
                  {props.items === 'datacenter-servers' ?
                    <AddDSItem items={props.items} item={props.item}/>
                  :
                    <React.Fragment>
                      {props.items === 'datacenter-queries' ?
                        <AddDQItem items={props.items} item={props.item}/>
                      :
                        <AddItem items={props.items} item={props.item}/>
                      }
                    </React.Fragment>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          :
            null
          }

          <br/>
          <br/>
            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 5}}
              dataSource={items}
              bordered
              rowKey={record => record.name}
              scroll={{x: 'auto'}}
              pagination={{pageSize: 10}}
            />
          <br/>

          {createElement('button', '', '', '', 'commit')}

        </React.Fragment>
      }

      {showErrors()}

    </React.Fragment>
  )
  

}

export default connect((state) => ({
token: state.authentication.token,
error: state.concerto.err,
authorizations: state.authorizations,

asset: state.checkpoint.asset,
domain: state.checkpoint.domain,
fetchItems: state.checkpoint.fetchItems
}))(ItemsView);
  
  