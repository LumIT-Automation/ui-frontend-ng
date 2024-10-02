import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css';
import '../App.css'
import { Space, Table, Input, Select, Button, Spin, List, Checkbox, Radio, Card } from 'antd';
import Highlighter from 'react-highlight-words';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import {
  fetchItems,
} from '../f5/store'

import {
  err
} from '../concerto/store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function ItemsView(props) {
  
  let [disableCommit, setDisableCommit] = useState(false);
  let [loading, setLoading] = useState(false);
  let [originitems, setOriginitems] = useState([]);
  let [items, setItems] = useState([]);
  let [errors, setErrors] = useState({});

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);
  let myRefs = useRef(null);
  let textAreaRefs = useRef(null);

  //UPDATE
  useEffect(() => {
    if (props.asset && props.partition && props.items) {
      main();
    }
  }, [props.asset, props.partition, props.items]);


  useEffect(() => {
    if (props.fetchItems) {
      props.dispatch(fetchItems(false))
      main()
    }
  }, [props.fetchItems]);

  /*
    Fetching Data, Rendering in a table, Add/Remove items
  */

  const main = async () => {
    setItems([])
    setOriginitems([])
    setLoading(true)
    let id = 1
    
    if (props.items === 'certificates') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: props.vendor,
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
    else if (props.items === 'keys') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: props.vendor,
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

    endpoint = `${props.vendor}/${assetId}/${props.partition}/${props.items}/`

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
      console.log(error)
    }
  }

  /*
    This component, at the moment, doesn't add or modify so it has non sense validate. 

    Validate data before send them to backend
  */

  const validationCheck = async () => {
    let errors = 0
    let validators = new Validators()

    if (props.items === 'certificates') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
      }
      await setItems(items)
      return errors
    }
    else if (props.items === 'keys') {
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
      //cudManager()
    }
  }

  /*
    Send Data to backend
  */
 
  /*
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
  }*/

  const isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  const authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }


  /*let createElement = (element, key, choices, obj, action, father) => {
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
            type='danger'
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
  }*/

  let returnCol = () => {
    if (props.items === 'certificates') {
      return certificatesColumns
    }
    else if (props.items === 'keys') {
      return keysColumns
    }
  }

  let today = new Date().getTime();
    let thirtyDays = 2592000000
    let inThirtyDays = new Date(today + thirtyDays);

  const certificatesColumns = [
    {
      title: 'NAME',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps(
        'name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'ISSUER',
      align: 'center',
      dataIndex: ['apiRawValues','issuer'],
      key: 'issuer',
      ...getColumnSearchProps(
        ['apiRawValues','issuer'], 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'EXPIRATION',
      align: 'center',
      dataIndex: ['apiRawValues','expiration'],
      key: ['apiRawValues','expiration'],
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.apiRawValues.expiration) - new Date(b.apiRawValues.expiration),
      ...getColumnSearchProps(
        ['apiRawValues','expiration'], 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (value, obj) => {
        return {
          props: {
            style: {
              background: (new Date(value).getTime()) < today ?
                '#FCF2F0'
              :
                (new Date(value).getTime()) < inThirtyDays.getTime() ?
                  '#FFFBE6'
                :
                  'white',
            }
          },
          children: <div>{value}</div>,
        }
      }
    },
    /*{
      title: 'Modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
      render: (name, obj)  => (
        <Space size="small">
         {(authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', `${props.item}_patch`)) ? 
          <Modify name={name} obj={obj} />
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
      render: (name, obj)  => (
        <Space size="small">
          {(authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', `${props.item}_delete`)) ? 
          <Delete name={name} obj={obj} />
          :
          '-'
        }
        </Space>
      ),
    }*/
  ];

  const keysColumns = [
    {
      title: 'NAME',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps(
        'name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'KeyType',
      align: 'center',
      dataIndex: 'keyType',
      key: 'keyType',
      ...getColumnSearchProps(
        'keyType', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'KeySize',
      align: 'center',
      dataIndex: 'keySize',
      key: 'keySize',
      ...getColumnSearchProps(
        'keySize', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'SecurityType',
      align: 'center',
      dataIndex: 'securityType',
      key: 'securityType',
      ...getColumnSearchProps(
        'securityType', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    /*{
      title: 'Modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
      render: (name, obj)  => (
        <Space size="small">
         {(authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', `${props.item}_patch`)) ? 
          <Modify name={name} obj={obj} />
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
      render: (name, obj)  => (
        <Space size="small">
                    {(authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', `${props.item}_delete`)) ?
          <Delete name={name} obj={obj} />
          :
          '-'
        }
        </Space>
      ),
    }*/
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

          {/*createElement('button', '', '', '', 'commit')*/}

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

asset: state.f5.asset,
partition: state.f5.partition,
fetchItems: state.f5.fetchItems
}))(ItemsView);
  
  