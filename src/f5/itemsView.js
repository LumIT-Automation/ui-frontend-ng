import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css';

//import '../App.css'
import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error'

import {
  err
} from '../concerto/store'

import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Select, Button, Spin, Checkbox, Radio } from 'antd';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const memberIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function ItemsView(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);

  let [disableCommit, setDisableCommit] = useState(false);
  let [routeDomains, setRouteDomains] = useState([]);
  let [originitems, setOriginitems] = useState([]);
  let [items, setItems] = useState([]);
  let [monitorTypes, setMonitorTypes] = useState([]);
  let [loadBalancingModes, setLoadBalancingModes] = useState(['round-robin', 'least-connections-member', 'observed-member', 'predictive-member']);
  let [profileTypes, setProfileTypes] = useState([]);
  let [expandedKeys, setExpandedKeys] = useState([]);
  let [states, setStates] = useState(['enabled', 'disabled', 'forced offline']);
  let [nodeSessions, setNodeSessions] = useState(['user-enabled', 'user-disabled']);
  let [nodeStates, setNodeStates] = useState(['unchecked', 'user-down']);
  let [errors, setErrors] = useState([]);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let [response, setResponse] = useState(false);

  //if use useRef the object is not accessible directly. you have to create a "current" property
  let myRefs = useRef({});
  let textAreaRefs = useRef({});

  useEffect(() => {
    start()
  }, [props.items, props.asset, props.partition]);

  /*
    Antd Table methods for search, filter and order data
  */

  let onTableRowExpand = (expanded, record) => {
    console.log(expanded)
    console.log(record)
    let expandedKeysCopy = JSON.parse(JSON.stringify(expandedKeys))

    if(expanded){
      expandedKeysCopy.push(record.id); // I have set my record.id as row key. Check the documentation for more details.
    }
    else {
      expandedKeysCopy = expandedKeysCopy.filter(k => k !== record.id)
    }
    setExpandedKeys(expandedKeysCopy)
  }

  /*
    Fetching Data, Rendering in a table, Add/Remove items
  */

  let start = async () => {
    setItems([])
    setOriginitems([])
    setExpandedKeys([])
    setLoading(true)

    let id = 1
    let routeDomainsLocal = []

    let data = await dataGet(props.asset.id, 'routedomains')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'itemsView',
        vendor: 'f5',
        errorType: 'routeDomainsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      routeDomainsLocal = data.data.items
      setRouteDomains(routeDomainsLocal)
    }
    
    if (props.items === 'nodes') {

      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'nodesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let itemsCopy = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          if (item.address.includes('%')) {
            let list = item.address.split('%')
            item.address = list[0]
            item.routeDomain = list[1]
            let rd = routeDomainsLocal.find(r => r.id == item.routeDomain)
            item.routeDomainName = rd.name
          }
          return item
        })

        setItems(itemsCopy)
        setOriginitems(itemsCopy)
        setLoading(false)
      }
    }

    else if (props.items === 'monitors') {
      let fetched = await dataGet(props.asset.id, 'monitorTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorTypesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setMonitorTypes(fetched.data.items)
      }
    
      fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let list = []
  
        for (let t in fetched.data) {
          let type = t
          let values = Object.values(fetched.data[t])
  
          values.forEach(mt => {
            mt.forEach(m => {
              Object.assign(m, {type: type, id: id, existent: true, isModified: {}});
              if (m.interval || m.interval === 0) {
                m.interval = m.interval.toString()
              }
              if (m.timeout || m.timeout === 0) {
                m.timeout = m.timeout.toString()
              }
              list.push(m)
              id++
            })
          })
        }
        setItems(list)
        setOriginitems(list)
        setLoading(false)
      }
    }

    else if (props.items === 'snatpools') {
      
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'snatpoolsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let itemsCopy = fetched.data.items.map(item => {
          let mid = 1
          item.existent = true
          item.isModified = {}
          item.id = id

          item.members = item.members.map(m => {
            let l = m.split('/')
            let o = {}
            o.existent = true
            o.address  = l[2]
            if (o.address.includes('%')) {
              let list = o.address.split('%')
              o.routeDomain = list[1]
              o.address = list[0]
              let rd = routeDomainsLocal.find(r => r.id == o.routeDomain)
              o.routeDomainName = rd.name
            }
            o.id = mid
            mid++
            return o
          })

          
          id++
          return item
        })
        setItems(itemsCopy)
        setOriginitems(itemsCopy)
        setLoading(false)
      }
    }

    else if (props.items === 'pools') {
      let fetched = await dataGet(props.asset.id, 'monitorTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorTypesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setMonitorTypes(fetched.data.items)
      }

      fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'poolsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let itemsCopy = fetched.data.items.map(item => {
          let mid = 1
          item.existent = true
          item.isModified = {}
          item.id = id          
          id++
          return item
        })
        setItems(itemsCopy)
        setOriginitems(itemsCopy)
        setLoading(false)
      }
    }

    else if (props.items === 'irules') {
      let fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'irulesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let itemsCopy = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          id++
          return item
        })
        setItems(itemsCopy)
        setOriginitems(itemsCopy)
        setLoading(false)
      }
    }

    else if (props.items === 'profiles') {
      let fetched = await dataGet(props.asset.id, 'profileTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'profileTypesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setProfileTypes(fetched.data.items)
      }
    
      fetched = await dataGet(props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'profilesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        let list = []
  
        for (let t in fetched.data) {
          let type = t
          let values = Object.values(fetched.data[t])
  
          values.forEach(o => {
            o.forEach(p => {
              Object.assign(p, {type: type, id: id, existent: true, isModified: {}});
              list.push(p)
              id++
            })
          })
        }
        setItems(list)
        setOriginitems(list)
        setLoading(false)
      }
    }
  }

  let dataGet = async (assetId, entities) => {
    let endpoint
    let r

    if (entities === 'routedomains') {
      endpoint = `${props.vendor}/${assetId}/${entities}/`
    }
    else if (entities === 'monitorTypes') {
      endpoint = `${props.vendor}/${assetId}/${props.partition}/monitors/`
    }
    else if (entities === 'profileTypes') {
      endpoint = `${props.vendor}/${assetId}/${props.partition}/profiles/`
    }
    else if (props.items === 'monitors') {
      endpoint = `${props.vendor}/${assetId}/${props.partition}/${props.items}/ANY/`
    }
    else if (props.items === 'profiles') {
      endpoint = `${props.vendor}/${assetId}/${props.partition}/${props.items}/ANY/`
    }
    else {
      endpoint = `${props.vendor}/${assetId}/${props.partition}/${props.items}/`
    }
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

  let getPoolmembers = async(pool) => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let p = itemsCopy.find(item => item.id === pool.id)
    let origItems = JSON.parse(JSON.stringify(originitems))
    let origP = origItems.find(item => item.id === pool.id)
    p.loading = true
    setItems(itemsCopy)

    let endpoint = `${props.vendor}/${props.asset.id}/${props.partition}/${props.item}/${pool.name}/members/`
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
    await rest.doXHR(endpoint, props.token)

    if (r.status && r.status !== 200 ) {
      let error = Object.assign(r, {
        component: 'itemsView',
        vendor: 'f5',
        errorType: 'getPoolmembersError'
      })
      props.dispatch(err(error))
      return
    }
    else {
      let mid = 1 
      p.members = r.data.items
      p.members = p.members.map(m => {
        try {
          let o = {}
          o.existent = true
          o.id = mid
          mid++
          o.name = m.name
          o.address = m.address 
          o.port = m.fullPath.split(':')
          o.port = o.port[1]        
          o.state = m.state
          o.session = m.session
          o.parentState = m.parentState

          o.connections = 0
          o.isMonitored= false
          o.isLoading = false
          o.intervalId = null

          if (m.state === 'up' && m.session === 'monitor-enabled' && m.parentState === 'enabled') {
            o.status = 'enabled'
            o.color = '#90ee90'
          }
          else if (m.state === 'up' && m.session === 'user-disabled') {
            o.status = 'disabled' 
            o.status = 'color'
          }
          else if (m.state === 'checking' && m.session === 'user-disabled') {
            o.status = 'checking'
            o.color = 'blue'
          }
          else if (m.state === 'down' && m.session === 'monitor-enabled') {
            o.status = 'checking' 
            o.color = 'red'
          }
          else if (m.state === 'down' && m.session === 'user-enabled') {
            o.status = 'rechecking'
            o.color = 'blue'
          }
          else if (m.state === 'user-down' && m.session === 'user-disabled') {
            o.status = 'Force offline'
            o.color = 'black'
          }
          else {
            o.status = 'other'
            o.color = 'grey'
          }
          return o
        }
        catch (error) {
          console.log(error)
        }  
      })

    }
    p.loading = false
    origP.members = p.members 

    setItems(itemsCopy)
    setOriginitems(origItems)
  }

  let itemAdd = async (items, type) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(items, type)
    setItems(list)
  }

  let itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(item, items)
    setItems(list)
  }

  let subItemAdd = async (obj) => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let item = itemsCopy.find(item => item.id === obj.id)

    if (item < 1) {
      item.members.push({id:1})
    }
    else {
      let idList = item.members.map(member => {
        return member.id 
      })
      let n = Math.max(...idList)
      n++
      let member = {id: n}
      item.members = [member].concat(item.members)
    }

    if (item.existent) {
      item.isModified.members = true
    }

    setItems(itemsCopy)
  }

  let subItemRemove = async (subItem, father) => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let item = itemsCopy.find(item => item.id === father.id)
    let member = item.members.find(m => m.id === subItem.id)
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(member, father.members)
    item.members = list

    if (item.existent) {
      let origItems = JSON.parse(JSON.stringify(originitems))
      let origItem = origItems.find(item => item.id === father.id)
      if (JSON.stringify(item.members) === JSON.stringify(origItem.members)) {
        delete item.isModified.members
      }
      else {
        item.isModified.members = true
      }
    }
    
    setItems(itemsCopy)
  }

  /*
    Setting item's values
  */

  let readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = res => {
        resolve(res.target.result);
      };
      reader.onerror = err => reject(err);
  
      reader.readAsText(file);
    });
  }

  let set = async (key, value, record, father) => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let originitemsCopy  = JSON.parse(JSON.stringify(originitems))

    if (father) {
      
      let fath = itemsCopy.find(item => item.id === father.id)
      let origFather = originitemsCopy.find(item => item.id === father.id)
      let m = fath.members.find(m => m.id === record.id)
      
      if (key === 'name'){
        let start = 0
        let end = 0
        let ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          m[key] = value
          delete m[`${key}Error`]
        }
        else {
          //blank value while typing.
          m[key] = ''
        }

        delete m[`${key}Error`]
        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      else if (key === 'address'){
        let start = 0
        let end = 0
        let ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          m[key] = value
          delete m[`${key}Error`]
        }
        else {
          //blank value while typing.
          m[key] = ''
        }

        delete m[`${key}Error`]
        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      else if (key === 'routeDomain') {
        //value could be 0
        value = value.toString()
        let rd = routeDomains.find(r => r.id == value)

        if (fath.existent) {
          let originM = origFather.members.find(m => m.id === record.id)
          if (m.existent) {
            if (originM[key] !== value) {
              fath.isModified[m.id] = true
              //m.isModified = {}
              //m.isModified[key] = true
              m[key] = value
              m.routeDomainName = rd.name
            }
            else {
              //delete m.isModified
              delete fath.isModified[m.id]
              m[key] = value
              m.routeDomainName = rd.name
            }
          }
          else {
            fath.isModified[m.id] = true
            m[key] = value
            m.routeDomainName = rd.name
          }
          
        }
        else {
          m[key] = value
          m.routeDomainName = rd.name
        }
        delete m[`${key}Error`]

        setItems(itemsCopy)
      }

      else if (key === 'port'){
        let start = 0
        let end = 0
        let ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          m[key] = value
          delete m[`${key}Error`]
        }
        else {
          //blank value while typing.
          m[key] = ''
        }

        delete m[`${key}Error`]
        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }
      
      if (key === 'toDelete') {
        if (value) {
          m.toDelete = true
        }
        else {
          delete m.toDelete
        }
        setItems(itemsCopy)
      }

      if (father.existent) {
        if (JSON.stringify(fath.members) === JSON.stringify(origFather.members)) {
          delete fath.isModified.members
        }
        else {
          fath.isModified.members = true
        }
      }
      
      setItems(itemsCopy)
    }

    else if (record) {
      let origEl = originitemsCopy.find(item => item.id === record.id)
      let e = itemsCopy.find(item => item.id === record.id)      

      if (key === 'name'){
        
        let ref = myRefs.current[`${record.id}_${key}`]
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
        if (ref?.current?.[`${record.id}_${key}`]?.input) {
          ref.current[`${record.id}_${key}`].input.focus();
        }
      }

      if (key === 'address'){
        
        let ref = myRefs.current[`${record.id}_${key}`]
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
        if (ref?.current?.[`${record.id}_${key}`]?.input) {
          ref.current[`${record.id}_${key}`].input.focus();
        }
      }

      if (key === 'routeDomain') {
        let rd = routeDomains.find(r => r.id == value)

        e[key] = value
        e.routeDomainName = rd.name

        delete e[`${key}Error`]
        
        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'interval'){
        
        let ref = myRefs.current[`${record.id}_${key}`]
        
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          console.log(origEl[key])
          console.log(e[key])
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
            console.log(e.isModified[key])
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
        if (ref?.current?.[`${record.id}_${key}`]?.input) {
          ref.current[`${record.id}_${key}`].input.focus();
        }
      }

      if (key === 'timeout'){
        let ref = myRefs.current[`${record.id}_${key}`]
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
        ref = myRefs.current[`${record.id}_${key}`]
        if (ref?.current?.[`${record.id}_${key}`]?.input) {
          ref.current[`${record.id}_${key}`].input.focus();
        }
      }   

      if (key === 'session') {
        
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'monitor') {
        
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'loadBalancingMode') {
        
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        } 

        setItems(itemsCopy)
      }

      if (key === 'state') {
        
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'type') {
        
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        } 

        setItems(itemsCopy)
      }

      if (key === 'apiAnonymous') {
        
        let start = 0
        let end = 0
        let ref = textAreaRefs.current[`${record.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          start = ref.resizableTextArea.textArea.selectionStart
          end = ref.resizableTextArea.textArea.selectionEnd
        }

        if (value) {
          if (e.existent) {
            if (origEl[key] !== value) {
              e.isModified[key] = true
              e[key] = value
            }
            else {
              delete e.isModified[key]
              e[key] = value
            }
          }
          else {
            e[key] = value
          }
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        setItems(itemsCopy)
        ref = textAreaRefs.current[`${record.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'sourceType') {
        
        e.sourceType = value
        delete e[`${key}Error`]

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'upload') {

        if (value) {
          if (e.existent) {
            if (origEl[key] !== value) {
              e.isModified[key] = true
              e.file = value
              e.fileName = value.name
              e.size = value.size
              e.type = value.type
              let t = await readFile(value)
              e.text = t
            }
            else {
              delete e.isModified[key]
              e.file = value
              e.fileName = value.name
              e.size = value.size
              e.type = value.type
              let t = await readFile(value)
              e.text = t
            }
          }
          else {
            e.file = value
            e.fileName = value.name
            e.size = value.size
            e.type = value.type
            let t = await readFile(value)
            e.text = t
          }
          delete e[`textError`]
        }
        else {
          //blank value while typing.
          e.text = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
      }

      if (key === 'text') {
        
        let start = 0
        let end = 0
        let ref = textAreaRefs.current[`${record.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          start = ref.resizableTextArea.textArea.selectionStart
          end = ref.resizableTextArea.textArea.selectionEnd
        }

        if (value) {
          if (e.existent) {
            if (origEl[key] !== value) {
              e.isModified[key] = true
              e[key] = value
            }
            else {
              delete e.isModified[key]
              e[key] = value
            }
          }
          else {
            e[key] = value
          }
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        if (e.existent) {
          if (origEl[key] !== e[key]) {
            e.isModified[key] = true
          }
          else {
            delete e.isModified[key]
          }
        }

        setItems(itemsCopy)
        ref = textAreaRefs.current[`${record.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }
  
      if (key === 'toDelete') {
        if (value) {
          e.toDelete = true
        }
        else {
          delete e.toDelete
        }
        setItems(itemsCopy)
      }

    }
    
  }

  /*
    Validate data before send them to backend
  */

  let validationCheck = async () => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let errorsLocal = 0
    let validators = new Validators()

    if (props.items === 'nodes') {

      for (const item of Object.values(itemsCopy)) {
        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if ( !(validators.ipv4(item.address) || validators.ipv6(item.address) || item.address === 'any6') ) {
          item.addressError = true
          ++errorsLocal
        }
        if (!item.session) {
          item.sessionError = true
          ++errorsLocal
        }
        if (!item.state) {
          item.stateError = true
          ++errorsLocal
        }

      }
      setItems(itemsCopy)
      return errorsLocal
    }

    else if (props.items === 'monitors') {

      for (const item of Object.values(itemsCopy)) {

        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if (!item.type) {
          item.typeError = true
          ++errorsLocal
        }
        if ((item.type === 'inband')) {
          continue
        }
        if (!item.interval) {
          item.intervalError = true
          ++errorsLocal
        }
        if (!item.timeout) {
          item.timeoutError = true
          ++errorsLocal
        }

      }
      setItems(itemsCopy)
      return errorsLocal
    }

    else if (props.items === 'snatpools') {
      for (const item of Object.values(itemsCopy)) {
        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if (!item.members || item.members.length < 1) {
          item.membersError = true
          ++errorsLocal
        }
        else {
          item.members.forEach(e => {
            if (!(validators.ipv4(e.address) || validators.ipv6(e.address)) ) {
              e.addressError = true
              ++errorsLocal
              setErrors(errorsLocal)
            }
            
          });
        }
      }
      setItems(itemsCopy)
      return errorsLocal
    }

    else if (props.items === 'irules') {

      for (const item of Object.values(itemsCopy)) {

        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if (!item.apiAnonymous) {
          item.apiAnonymousError = true
          ++errorsLocal
        }

      }
      setItems(itemsCopy)
      return errorsLocal
    }

    else if (props.items === 'profiles') {

      for (const item of Object.values(itemsCopy)) {

        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if (!item.type) {
          item.typeError = true
          ++errorsLocal
        }

      }
      setItems(itemsCopy)
      return errorsLocal
    }

    else if (props.items === 'pools') {
      for (const item of Object.values(itemsCopy)) {
        if (!item.name) {
          item.nameError = true
          ++errorsLocal
        }
        if (!item.loadBalancingMode) {
          item.loadBalancingModeError = true
          ++errorsLocal
        }
        if (item.members && item.members.length > 0) {
          item.members.forEach(m => {
            if (!m.name) {
              m.nameError = true
              ++errorsLocal
            }
            if ( !(validators.ipv4(m.address) || validators.ipv6(m.address) || m.address === 'any6') ) {
              m.addressError = true
              ++errorsLocal
            }
            if (!m.port || !validators.port(m.port)) {
              m.portError = true
              ++errorsLocal
            }
          });
        }

        //pool members
      }
      setItems(itemsCopy)
      return errorsLocal
    }
  }

  let validation = async () => {
    setDisableCommit(true)
    let errorsLocal = await validationCheck()
    setDisableCommit(false)

    if (errorsLocal === 0) {
      setDisableCommit(true)
      cudManager()
    }
  }

  /*
    Send Data to backend
  */
 
  let cudManager = async () => {
    let itemsCopy = JSON.parse(JSON.stringify(items))
    let toPost = []
    let toDelete = []
    let toPatch = []

    for (const item of Object.values(itemsCopy)) {
      if (!item.existent) {
        toPost.push(item)
      }
      if (item.toDelete) {
        toDelete.push(item)
      }
      if (item.isModified && Object.keys(item.isModified).length > 0) {
        console.log(item)
        toPatch.push(item)
      }
      
    }

    if (toDelete.length > 0) {
      for (const item of toDelete) {
        item.loading = true
        setItems(itemsCopy)

        let e = await itemDelete(item.name, item.type ? item.type : null )
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'deleteError'
          })
          props.dispatch(err(error))
        }
        item.loading = false
        setItems(itemsCopy)
      }
    }

    if (toPost.length > 0) {
      for (const item of toPost) {
        let body = {}

        if (props.items === 'nodes') {
          body.data = {
            "address": item.address,
            "name": item.name,
            "session": item.session,
            "state": item.state
          }

          if(item.routeDomain) {
            body.data.address = `${item.address}%${item.routeDomain}`
          }
        }

        if (props.items === 'monitors') {
          body.data = {
            "name": item.name,
            "type": item.type,
            "interval": +item.interval,
            "timeout": +item.timeout,
          }
        }

        if (props.items === 'snatpools') {
          let members = item.members.map(m => {
            let str = `/${props.partition}/${m.address}`
            if (m.routeDomain) {
              str = `${str}%${m.routeDomain}`
            }
            return str
          })
          body.data = {
            "name": item.name,
            "members": members
          }
        }

        if (props.items === 'irules') {
          body.data = {
            "name": item.name,
            "apiAnonymous": item.apiAnonymous
          }
        }

        if (props.items === 'profiles') {
          body.data = {
            "name": item.name,
            "type": item.type
          }
        }

        if (props.items === 'pools') {
          body.data = {
            "name": item.name,
            "monitor": `/${props.partition}/${item.monitor}`,
            "loadBalancingMode": item.loadBalancingMode
          }
        }

        item.loading = true
        setItems(itemsCopy)

        let e = await itemPost(body)
        if (e.status && e.status !== 201 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'postError'
          })
          props.dispatch(err(error))
        }
        item.loading = false
        setItems(itemsCopy)
      }
    }

    if (toPatch.length > 0) {
      for (const item of toPatch) {
        if (props.items === 'pools') {
          continue
        }
        let body = {}

        if (props.items === 'monitors') {
          body.data = {
            "destination": "*:*",
            "interval": +item.interval,
            "manualResume": "disabled",
            "timeUntilUp": 0,
            "timeout": +item.timeout,
            "transparent": "disabled",
            "upInterval": 0
          }
        }

        if (props.items === 'snatpools') {
          let members = item.members.map(m => {
            let str = `/${props.partition}/${m.address}`
            if (m.routeDomain) {
              str = `${str}%${m.routeDomain}`
            }
            return str
          })
          body.data = {
            "members": members
          }
        }

        if (props.items === 'irules') {
          body.data = {
            "name": item.name,
            "apiAnonymous": item.apiAnonymous
          }
        }

        item.loading = true
        setItems(itemsCopy)
        console.log(body)

        let e = await itemPatch(item.name, item.type ? item.type : null, body)
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'patchError'
          })
          props.dispatch(err(error))
        }
        item.loading = false
        setItems(itemsCopy)
      }

      if (props.items === 'pools') {
        for (const item of toPatch) {
          if (item.isModified.members) {
            for (const m of item.members) {
              if (m.toDelete) {
                item.loading = true
                setItems(itemsCopy)
                let e = await memberDelete(m.name, item.name )
                if (e.status && e.status !== 200 ) {
                  let error = Object.assign(e, {
                    component: 'itemsView',
                    vendor: 'f5',
                    errorType: 'deleteError'
                  })
                  props.dispatch(err(error))
                }
                item.loading = false
                setItems(itemsCopy)                
              }
              if (!m.existent) {
                let body = {}
                body.data = {
                  "name": `/${props.partition}/${m.name}:${m.port}`,
                  "address": m.address,
                  "connectionLimit": 0,
                  "dynamicRatio": 1,
                  "ephemeral": "false",
                  "inheritProfile": "enabled",
                  "logging": "disabled",
                  "monitor": "default",
                  "priorityGroup": 0,
                  "rateLimit": "disabled",
                  "ratio": 1,
                  "state": "up",
                  "fqdn": {
                      "autopopulate": "disabled"
                  }
                }

                item.loading = true
                setItems(itemsCopy)  

                let e = await memberAdd(body, item.name)
                if (e.status && e.status !== 201 ) {
                  let error = Object.assign(e, {
                    component: 'itemsView',
                    vendor: 'f5',
                    errorType: 'postError'
                  })
                  props.dispatch(err(error))
                }
                item.loading = false
                setItems(itemsCopy)  
              }              
            }
          }
        }
      }

    }

    setDisableCommit(false)
    start()
  }

  let memberAdd = async (body, data) => {
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
      
    await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/pool/${data}/members/`, props.token, body )
    return r
  }

  let memberDelete = async (name, poolName) => {
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
    await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/pool/${poolName}/member/${name}/`, props.token )
    return r
  }

  let itemPost = async (body, type) => {
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
    if (props.items === 'monitors') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/${props.items}/${body.data.type}/`, props.token, body )
    }
    else if (props.items === 'profiles') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/${props.items}/${body.data.type}/`, props.token, body )
    }
    else {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/${props.items}/`, props.token, body )
    }
    
    return r
  }

  let itemDelete = async (name, type) => {
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
    //@todo: items as a prop
    if (props.items === 'monitors') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/monitor/${type}/${name}/`, props.token )
    }
    else if (props.items === 'profiles') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/profile/${type}/${name}/`, props.token )
    }
    else {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/${props.item}/${name}/`, props.token )
    }
    return r
  }

  let itemPatch = async (name, type, body) => {

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

    if (props.items === 'monitors') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/monitor/${type}/${name}/`, props.token, body )
    }
    else if (props.items === 'profiles') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/profile/${type}/${name}/`, props.token, body  )
    }
    else {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/${props.item}/${name}/`, props.token, body )
    }
    return r
  }

  /*
    Render Data in DOM
  */

  let createElement = (element, key, choices, obj, action, father) => {
    if (element === 'input') {
      let width = 200
      if (key === 'port') {
        width = 80
      }

      if (father) {
        return (
          <Input
            value={obj[key]}
            style=
              {obj[`${key}Error`] ?
                {borderColor: 'red', width: width}
              :
                {width: width}
              }
            ref={ref => myRefs.current[`${obj.id}_${key}`] = ref}
            onChange={event => set(key, event.target.value, obj, father ? father : null)}
          />          
        )
      }
      else {
        return (
          <Input
            value={obj[key]}
            style=
              {obj[`${key}Error`] ?
                {borderColor: 'red', width: width}
              :
                {width: width}
              }
            ref={ref => (myRefs.current[`${obj.id}_${key}`] = ref)}
            onChange={event => set(key, event.target.value, obj)}
          />          
        )
      }
    }

    else if (element === 'textarea') {
      return (
        <Input.TextArea
          rows={12}
          value={obj[key]}
          ref={ref => textAreaRefs.current[`${obj.id}_${key}`] = ref}
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
      if (key === 'routeDomain') {
        return (
          <Select
            value={obj.routeDomainName}
            showSearch
            style={{width: 150}}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={event => set('routeDomain', event, obj, father)}
          >
            <React.Fragment>
              {choices.map((rd, i) => {
                return (
                  <Select.Option key={i} value={rd.id}>{rd.name}</Select.Option>
                )
              })
              }
            </React.Fragment>
          </Select>
        )
      }
      else {
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
            onSelect={event => set(key, event, obj, father)}
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

    }

    else if (element === 'checkbox'){
      return (
        <Checkbox 
          checked={obj.toDelete}
          onChange={event => set(action, event.target.checked, obj, father)}
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
      else if (action === 'subItemRemove') {
        return (
          <Button
            type='danger'
            onClick={() => subItemRemove(obj, father)}
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
    if (props.items === 'nodes') {
      return nodesColumns
    }
    if (props.items === 'monitors') {
      return monitorsColumns
    }
    if (props.items === 'snatpools') {
      return snatpoolsColumns
    }
    if (props.items === 'pools') {
      return poolsColumns
    }
    if (props.items === 'irules') {
      return irulesColumns
    }
    if (props.items === 'profiles') {
      return profilesColumns
    }
  }

  let expandedRowRender = (...params) => {
    const columns = [
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...getColumnSearchProps(
          'address', 
          searchInput, 
          (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
          (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
          searchText, 
          searchedColumn, 
          setSearchText, 
          setSearchedColumn
        ),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('input', 'address', '', obj, '', params[0])
        )
      },
      {
        title: 'Route domain (optional)',
        align: 'center',
        dataIndex: 'routeDomain',
        key: 'routeDomain',
        ...getColumnSearchProps(
          'routeDomain', 
          searchInput, 
          (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
          (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
          searchText, 
          searchedColumn, 
          setSearchText, 
          setSearchedColumn
        ),
        render: (val, obj)  => (
          createElement('select', 'routeDomain', routeDomains, obj, '', params[0])
        )
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (val, obj)  => (
          <Space size="small">
            { obj.existent ? 
              createElement('checkbox', 'toDelete', '', obj, 'toDelete', params[0])
            :
              createElement('button', 'subItemRemove', '', obj, 'subItemRemove', params[0])
            }
          </Space>
        )
      }
    ];

    const poolmembersColumn = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={memberIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('input', 'name', '', obj, '', params[0])
        )
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...getColumnSearchProps(
          'address', 
          searchInput, 
          (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
          (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
          searchText, 
          searchedColumn, 
          setSearchText, 
          setSearchedColumn
        ),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('input', 'address', '', obj, '', params[0])
        )
      },
      {
        title: 'Port',
        align: 'center',
        dataIndex: 'port',
        key: 'port',
        ...getColumnSearchProps(
          'port', 
          searchInput, 
          (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
          (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
          searchText, 
          searchedColumn, 
          setSearchText, 
          setSearchedColumn
        ),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('input', 'port', '', obj, '', params[0])
        )
      },
      {
        title: 'State',
        align: 'center',
        dataIndex: 'state',
        key: 'state',
        ...getColumnSearchProps(
          'state', 
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
        title: 'Session',
        align: 'center',
        dataIndex: 'session',
        key: 'session',
      },
      {
        title: 'Node State',
        align: 'center',
        dataIndex: 'parentState',
        key: 'parentState',
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render(name, record) {
          return {
            props: {
              style: { margin: 0, alignItems: 'center', justifyContent: 'center' }
            },
            children: <div title={record.status} style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: record.color, margin: '0 auto', padding: 0}}></div>
          };
        }
      },
        
      {
        title: 'Connections',
        align: 'center',
        dataIndex: 'connections',
        key: 'connections',
      },
      {
        title: '',
        align: 'center',
        dataIndex: 'monitoring',
        key: 'monitoring',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isMonitored ? <Spin indicator={memberIcon} style={{margin: '10% 10%'}}/> : null }
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
            { obj.existent ? 
              createElement('checkbox', 'toDelete', '', obj, 'toDelete', params[0])
            :
              createElement('button', 'subItemRemove', '', obj, 'subItemRemove', params[0])
            }
        </Space>
        ),
      }
    ]

    return (
      <React.Fragment>
        <br/>
        <Button
          type="primary"
          disabled={params[0].members ? false : true}
          onClick={() => subItemAdd(params[0])}
        >
          Add member
        </Button>
        { props.items === 'pools' ? 
            <Button
              type="primary"
              onClick={() => getPoolmembers(params[0])}
            >
              Get members
            </Button>
          :
            null
        }
        
        <br/>
        <br/>
        { params[0].loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <Table
            columns={props.items === 'pools' ? poolmembersColumn : columns}
            rowKey={record => record.id}
            //style={{backgroundColor:'black'}}
            dataSource={params[0].members}
            pagination={{pageSize: 10}}
          />
        }
        
      </React.Fragment>
    )
  };

  let nodesColumns = [
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
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Address',
      align: 'center',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps(
        'address', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'address', '', obj, '')
      )
    },
    {
      title: 'Route domain (optional)',
      align: 'center',
      dataIndex: 'routeDomain',
      key: 'routeDomain',
      ...getColumnSearchProps(
        'routeDomain', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        createElement('select', 'routeDomain', routeDomains, obj, '')
      )
    },
    {
      title: 'Session',
      align: 'center',
      dataIndex: 'session',
      key: 'session',
      ...getColumnSearchProps(
        'session', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'session', nodeSessions, obj, '')
      )
    },
    {
      title: 'State',
      align: 'center',
      dataIndex: 'state',
      key: 'state',
      ...getColumnSearchProps(
        'state', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'state', nodeStates, obj, '')
      )
    },
    {
      title: 'Monitor',
      align: 'center',
      dataIndex: 'monitor',
      key: 'monitor',
      ...getColumnSearchProps(
        'monitor', 
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
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let monitorsColumns = [
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
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Type',
      align: 'center',
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps(
        'type', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'type', monitorTypes, obj, '')
      )
    },
    {
      title: 'Interval',
      align: 'center',
      dataIndex: 'interval',
      key: 'interval',
      ...getColumnSearchProps(
        'interval', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        createElement('input', 'interval', '', obj, '')
      )
    },
    {
      title: 'Timeout',
      align: 'center',
      dataIndex: 'timeout',
      key: 'timeout',
      ...getColumnSearchProps(
        'timeout', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        createElement('input', 'timeout', '', obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let snatpoolsColumns = [
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
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let poolsColumns = [
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
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Monitor',
      align: 'center',
      dataIndex: 'monitor',
      key: 'monitor',
      ...getColumnSearchProps(
        'monitor', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'monitor', monitorTypes, obj, '')
      )
    },
    {
      title: 'Load Balancing Mode',
      align: 'center',
      dataIndex: 'loadBalancingMode',
      key: 'loadBalancingMode',
      ...getColumnSearchProps(
        'loadBalancingMode', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'loadBalancingMode', loadBalancingModes, obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let irulesColumns = [
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
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Code',
      align: 'center',
      dataIndex: 'apiAnonymous',
      key: 'apiAnonymous',
      ...getColumnSearchProps(
        'apiAnonymous', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        createElement('textarea', 'apiAnonymous', '', obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let profilesColumns = [
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
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('input', 'name', '', obj, '')
      )
    },
    {
      title: 'Type',
      align: 'center',
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps(
        'type', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (val, obj)  => (
        obj.existent ?
          val
        :
          createElement('select', 'type', profileTypes, obj, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (val, obj)  => (
        <Space size="small">
          { obj.existent ? 
            createElement('checkbox', 'toDelete', '', obj, 'toDelete')
          :
            createElement('button', 'itemRemove', '', obj, 'itemRemove')
          }
        </Space>
      ),
    }
  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'itemsView') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {console.log(items)}
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
        <React.Fragment>
          {/*to do: createElement()*/} 
          <Radio.Group>
            <Radio.Button
              style={{marginLeft: 10 }}
              onClick={() => start()}
            >
              <ReloadOutlined/>
            </Radio.Button>
          </Radio.Group>

          <Radio.Group
            buttonStyle="solid"
          >
            <Radio.Button
              buttonStyle="solid"
              style={{marginLeft: 10 }}
              onClick={() => itemAdd(items, props.items)}
            >
              +
            </Radio.Button>
          </Radio.Group>

          <br/>
          <br/>
          { props.items === 'snatpools' || props.items === 'pools' ?
            <Table
              columns={returnCol()}
              dataSource={items}
              bordered
              scroll={{x: 'auto'}}
              pagination={{pageSize: 10}}
              style={{marginBottom: 10}}
              onExpand={onTableRowExpand}
              expandedRowKeys={expandedKeys}
              rowKey={record => record.id}
              expandedRowRender={ record => expandedRowRender(record)}
            />
          :
            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 5}}
              dataSource={items}
              bordered
              rowKey={record => record.id}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
          }
          <br/>

          {createElement('button', '', '', '', 'commit')}

        </React.Fragment>
      }

      {errorsComponent()}

    </React.Fragment>
  )
  
}

export default connect((state) => ({
token: state.authentication.token,
error: state.concerto.err,

asset: state.f5.asset,
partition: state.f5.partition,
}))(ItemsView);
  
  