import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css';
import '../App.css'
import { Space, Table, Input, Select, Button, Spin, Checkbox, Radio, Card } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error'

import {
  err
} from '../concerto/store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const memberIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class ItemsView extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};
    this.textAreaRefs = {};

    this.state = {
      searchText: '',
      searchedColumn: '',
      disableCommit: false,
      routeDomains: [],
      originitems: [],
      items: [],
      monitorTypes: [],
      loadBalancingModes: ['round-robin', 'least-connections-member', 'observed-member', 'predictive-member'],
      profileTypes: [],
      items: [],
      expandedKeys: [],
      nodeSessions: ['user-enabled', 'user-disabled'],
      nodeStates: ['unchecked', 'user-down'],
      errors: {}
    };
  }

  componentDidMount() {
    if (this.props.items) {
      this.main()
    }
  }
  
  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset !== prevProps.asset || this.props.partition !== prevProps.partition) {
      this.main()
    }
    if (this.props.items !== prevProps.items) {
      this.main()
    }
  }

  componentWillUnmount() {
  }

  /*
    Antd Table methods for search, filter and order data
  */

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
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
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text => {
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  onTableRowExpand = (expanded, record) => {
    let keys = Object.assign([], this.state.expandedKeys);

    if(expanded){
      keys.push(record.id); // I have set my record.id as row key. Check the documentation for more details.
    }
    else {
      keys = keys.filter(k => k !== record.id)
    }
    this.setState({expandedKeys: keys});
  }

  /*
    Fetching Data, Rendering in a table, Add/Remove items
  */

  main = async () => {
    await this.setState({items: [], originitems: [], expandedKeys: [], loading: true})
    let id = 1

    let routeDomains = await this.dataGet(this.props.asset.id, 'routedomains')
    if (routeDomains.status && routeDomains.status !== 200 ) {
      let error = Object.assign(routeDomains, {
        component: 'itemsView',
        vendor: 'f5',
        errorType: 'routeDomainsError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({routeDomains: routeDomains.data.items})
    }
    
    if (this.props.items === 'nodes') {

      let fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'nodesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          item.existent = true
          item.isModified = {}
          item.id = id
          if (item.address.includes('%')) {
            let list = item.address.split('%')
            item.routeDomain = list[1]
            item.address = list[0]
            let rd = this.state.routeDomains.find(r => r.id == item.routeDomain)
            item.routeDomainName = rd.name
          }
          id++
          return item
        })
        await this.setState({items: items, originitems: items, loading: false})
      }
    }

    else if (this.props.items === 'monitors') {
      let fetched = await this.dataGet(this.props.asset.id, 'monitorTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorTypesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({monitorTypes: fetched.data.items})
      }
    
      fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorsError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
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
        await this.setState({items: list, originitems: list, loading: false})
      }
    }

    else if (this.props.items === 'snatpools') {
      
      let fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'snatpoolsError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        let items = fetched.data.items.map(item => {
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
              let rd = this.state.routeDomains.find(r => r.id == o.routeDomain)
              o.routeDomainName = rd.name
            }
            o.id = mid
            mid++
            return o
          })

          
          id++
          return item
        })
        await this.setState({items: items, originitems: items, loading: false})
      }
    }

    else if (this.props.items === 'pools') {
      let fetched = await this.dataGet(this.props.asset.id, 'monitorTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'monitorTypesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({monitorTypes: fetched.data.items})
      }

      fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'poolsError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        let items = fetched.data.items.map(item => {
          let mid = 1
          item.existent = true
          item.isModified = {}
          item.id = id          
          id++
          return item
        })
        await this.setState({items: items, originitems: items, loading: false})
      }
    }

    else if (this.props.items === 'irules') {
      let fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'irulesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
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
        await this.setState({items: items, originitems: items, loading: false})
      }
    }

    else if (this.props.items === 'profiles') {
      let fetched = await this.dataGet(this.props.asset.id, 'profileTypes')
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'profileTypesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({profileTypes: fetched.data.items})
      }
    
      fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'f5',
          errorType: 'profilesError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
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
        await this.setState({items: list, originitems: list, loading: false})
      }
    }
  }

  dataGet = async (assetId, entities) => {
    let endpoint
    let r

    if (entities === 'routedomains') {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    else if (entities === 'monitorTypes') {
      endpoint = `${this.props.vendor}/${assetId}/${this.props.partition}/monitors/`
    }
    else if (entities === 'profileTypes') {
      endpoint = `${this.props.vendor}/${assetId}/${this.props.partition}/profiles/`
    }
    else if (this.props.items === 'monitors') {
      endpoint = `${this.props.vendor}/${assetId}/${this.props.partition}/${this.props.items}/ANY/`
    }
    else if (this.props.items === 'profiles') {
      endpoint = `${this.props.vendor}/${assetId}/${this.props.partition}/${this.props.items}/ANY/`
    }
    else {
      endpoint = `${this.props.vendor}/${assetId}/${this.props.partition}/${this.props.items}/`
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
    await rest.doXHR(endpoint, this.props.token)
    return r
  }

  getPoolmembers = async(pool) => {
    let items = JSON.parse(JSON.stringify(this.state.items))
    let p = items.find(item => item.id === pool.id)
    p.loading = true
    await this.setState({items: items})
    let endpoint = `${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.item}/${pool.name}/members/`
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
    await rest.doXHR(endpoint, this.props.token)

    if (r.status && r.status !== 200 ) {
      let error = Object.assign(r, {
        component: 'itemsView',
        vendor: 'f5',
        errorType: 'getPoolmembersError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      let mid = 1 
      p.members = r.data.items
      p.members = p.members.map(m => {
        let o = {}
        o.existent = true
        o.id = mid
        mid++
        o.name = m.name
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
      })

    }
    p.loading = false
    await this.setState({items: items})
  }

  itemAdd = async (items, type) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(items, type)
    await this.setState({items: list})
  }

  itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(item, items)
    await this.setState({items: list})
  }

  subItemAdd = async (obj) => {
    let items = JSON.parse(JSON.stringify(this.state.items))
    let item = items.find(item => item.id === obj.id)

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

    await this.setState({items: items})
  }

  subItemRemove = async (subItem, father) => {
    let items = JSON.parse(JSON.stringify(this.state.items))
    let item = items.find(item => item.id === father.id)
    let member = item.members.find(m => m.id === subItem.id)
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(member, father.members)
    item.members = list

    if (item.existent) {
      let origItems = JSON.parse(JSON.stringify(this.state.originitems))
      let origItem = origItems.find(item => item.id === father.id)
      if (JSON.stringify(item.members) === JSON.stringify(origItem.members)) {
        delete item.isModified.members
      }
      else {
        item.isModified.members = true
      }
    }
    
    await this.setState({items: items})
  }

  /*
    Setting item's values
  */

  readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = res => {
        resolve(res.target.result);
      };
      reader.onerror = err => reject(err);
  
      reader.readAsText(file);
    });
  }

  set = async (key, value, record, father) => {
    let items = JSON.parse(JSON.stringify(this.state.items))

    if (father) {
      let fath = items.find(item => item.id === father.id)
      let origFather = this.state.originitems.find(item => item.id === father.id)
      let m = fath.members.find(m => m.id === record.id)
      
      if (key === 'name'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
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
        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'address'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
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
        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'routeDomain') {
        //value could be 0
        value = value.toString()
        let rd = this.state.routeDomains.find(r => r.id == value)

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

        await this.setState({items: items})
      }

      if (key === 'port'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
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
        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }
    }

    else if (record) {
      let origEl = this.state.originitems.find(item => item.id === record.id)
      let e = items.find(item => item.id === record.id)

      if (key === 'name'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }
  
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'address'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }

        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'interval'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
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

        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'timeout'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
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

        await this.setState({items: items})
        ref = this.myRefs[`${record.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'routeDomain') {
        if (value) {
          value = value.toString()
          let rd = this.state.routeDomains.find(r => r.id == value)

          e[key] = value
          e.routeDomainName = rd.name

          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }
        await this.setState({items: items})
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
        await this.setState({items: items})
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
        await this.setState({items: items})
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
        await this.setState({items: items})
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
        await this.setState({items: items})
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
        await this.setState({items: items})
      }

      if (key === 'apiAnonymous') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${record.id}_${key}`]

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

        await this.setState({items: items})
        ref = this.textAreaRefs[`${record.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'sourceType') {
        e.sourceType = value
        delete e[`${key}Error`]
        await this.setState({items: items})
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
              let t = await this.readFile(value)
              e.text = t
            }
            else {
              delete e.isModified[key]
              e.file = value
              e.fileName = value.name
              e.size = value.size
              e.type = value.type
              let t = await this.readFile(value)
              e.text = t
            }
          }
          else {
            e.file = value
            e.fileName = value.name
            e.size = value.size
            e.type = value.type
            let t = await this.readFile(value)
            e.text = t
          }
          delete e[`textError`]
        }
        else {
          //blank value while typing.
          e.text = ''
        }

        await this.setState({items: items})
      }

      if (key === 'text') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${record.id}_${key}`]

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

        await this.setState({items: items})
        ref = this.textAreaRefs[`${record.id}_${key}`]

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
        await this.setState({items: items})
      }
    }
    
  }

  /*
    Validate data before send them to backend
  */

  validationCheck = async () => {
    console.log('validationCheck')
    let items = JSON.parse(JSON.stringify(this.state.items))
    let errors = 0
    let validators = new Validators()

    if (this.props.items === 'nodes') {

      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if ( !(validators.ipv4(item.address) || validators.ipv6(item.address) || item.address === 'any6') ) {
          item.addressError = true
          ++errors
        }
        if (!item.session) {
          item.sessionError = true
          ++errors
        }
        if (!item.state) {
          item.stateError = true
          ++errors
        }

      }
      await this.setState({items: items})
      return errors
    }

    else if (this.props.items === 'monitors') {

      for (const item of Object.values(items)) {

        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if (!item.type) {
          item.typeError = true
          ++errors
        }
        if ((item.type === 'inband')) {
          continue
        }
        if (!item.interval) {
          item.intervalError = true
          ++errors
        }
        if (!item.timeout) {
          item.timeoutError = true
          ++errors
        }

      }
      await this.setState({items: items})
      return errors
    }

    else if (this.props.items === 'snatpools') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if (!item.members || item.members.length < 1) {
          item.membersError = true
          ++errors
        }
        else {
          item.members.forEach(e => {
            if (!(validators.ipv4(e.address) || validators.ipv6(e.address)) ) {
              e.addressError = true
              ++errors
              this.setState({errors: errors})
            }
            
          });
        }
      }
      await this.setState({items: items})
      return errors
    }

    else if (this.props.items === 'irules') {

      for (const item of Object.values(items)) {

        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if (!item.apiAnonymous) {
          item.apiAnonymousError = true
          ++errors
        }

      }
      await this.setState({items: items})
      return errors
    }

    else if (this.props.items === 'profiles') {

      for (const item of Object.values(items)) {

        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if (!item.type) {
          item.typeError = true
          ++errors
        }

      }
      await this.setState({items: items})
      return errors
    }

    else if (this.props.items === 'pools') {
      for (const item of Object.values(items)) {
        if (!item.name) {
          item.nameError = true
          ++errors
        }
        if (!item.loadBalancingMode) {
          item.loadBalancingModeError = true
          ++errors
        }
      }
      await this.setState({items: items})
      return errors
    }
  }

  validation = async () => {
    this.setState({disableCommit: true})
    let errors = await this.validationCheck()
    console.log(errors)
    this.setState({disableCommit: false})

    if (errors === 0) {
      this.setState({disableCommit: true})
      this.cudManager()
    }
  }

  /*
    Send Data to backend
  */
 
  cudManager = async () => {
    let items = JSON.parse(JSON.stringify(this.state.items))
    let toPost = []
    let toDelete = []
    let toPatch = []

    for (const item of Object.values(items)) {
      if (!item.existent) {
        console.log(item)
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
        item.loading = true
        await this.setState({items: items})

        let e = await this.itemDelete(item.name, item.type ? item.type : null )
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'deleteError'
          })
          this.props.dispatch(err(error))
          item.loading = false
          await this.setState({items: items})
        }
        else {
          item.loading = false
          await this.setState({items: items})
        }

      }
    }

    if (toPost.length > 0) {
      for (const item of toPost) {
        let body = {}

        if (this.props.items === 'nodes') {
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

        if (this.props.items === 'monitors') {
          body.data = {
            "name": item.name,
            "type": item.type,
            "interval": +item.interval,
            "timeout": +item.timeout,
          }
        }

        if (this.props.items === 'snatpools') {
          let members = item.members.map(m => {
            let str = `/${this.props.partition}/${m.address}`
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

        if (this.props.items === 'irules') {
          body.data = {
            "name": item.name,
            "apiAnonymous": item.apiAnonymous
          }
        }

        if (this.props.items === 'profiles') {
          body.data = {
            "name": item.name,
            "type": item.type
          }
        }

        if (this.props.items === 'pools') {
          body.data = {
            "name": item.name,
            "monitor": `/${this.props.partition}/${item.monitor}`,
            "loadBalancingMode": item.loadBalancingMode
          }
        }

        item.loading = true
        await this.setState({items: items})

        let e = await this.itemPost(body)
        if (e.status && e.status !== 201 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'postError'
          })
          this.props.dispatch(err(error))
          item.loading = false
          await this.setState({items: items})
        }
        else {
          item.loading = false
          await this.setState({items: items})
        }
      }
    }

    if (toPatch.length > 0) {
      for (const item of toPatch) {
        let body = {}

        if (this.props.items === 'monitors') {
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

        if (this.props.items === 'snatpools') {
          let members = item.members.map(m => {
            let str = `/${this.props.partition}/${m.address}`
            if (m.routeDomain) {
              str = `${str}%${m.routeDomain}`
            }
            return str
          })
          body.data = {
            "members": members
          }
        }

        if (this.props.items === 'irules') {
          body.data = {
            "name": item.name,
            "apiAnonymous": item.apiAnonymous
          }
        }

        item.loading = true
        await this.setState({items: items})

        let e = await this.itemPatch(item.name, item.type ? item.type : null, body)
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'f5',
            errorType: 'patchError'
          })
          this.props.dispatch(err(error))
          item.loading = false
          await this.setState({items: items})
        }
        else {
          item.loading = false
          await this.setState({items: items})
        }
      }
    }

    this.setState({disableCommit: false})
    this.main()
  }

  itemPost = async (body) => {
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
    if (this.props.items === 'monitors') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.items}/${body.data.type}/`, this.props.token, body )
    }
    else if (this.props.items === 'profiles') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.items}/${body.data.type}/`, this.props.token, body )
    }
    else {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.items}/`, this.props.token, body )
    }
    
    return r
  }

  itemDelete = async (name, type) => {
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
    if (this.props.items === 'monitors') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/monitor/${type}/${name}/`, this.props.token )
    }
    else if (this.props.items === 'profiles') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/profile/${type}/${name}/`, this.props.token )
    }
    else {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.item}/${name}/`, this.props.token )
    }
    return r
  }

  itemPatch = async (name, type, body) => {

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

    if (this.props.items === 'monitors') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/monitor/${type}/${name}/`, this.props.token, body )
    }
    else if (this.props.items === 'profiles') {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/profile/${type}/${name}/`, this.props.token, body  )
    }
    else {
      await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.partition}/${this.props.item}/${name}/`, this.props.token, body )
    }
    return r
  }

  /*
    Render Data in DOM
  */

  render() {

    let randomKey = () => {
      return Math.random().toString()
    }

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
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj, father ? father : null)}
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
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
            />          
          )
        }
      }

      else if (element === 'textarea') {
        return (
          <Input.TextArea
            rows={12}
            value={obj[key]}
            ref={ref => this.textAreaRefs[`${obj.id}_${key}`] = ref}
            onChange={event => this.set(key, event.target.value, obj)}
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
              onSelect={event => this.set('routeDomain', event, obj, father)}
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
              onSelect={event => this.set(key, event, obj)}
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
            onChange={event => this.set(action, event.target.checked, obj)}
          />
        )
      }

      else if (element === 'button'){
        if (action === 'itemRemove') {
          return (
            <Button
              type='danger'
              onClick={() => this.itemRemove(obj, this.state.items)}
            >
              -
            </Button>
          )
        }
        else if (action === 'subItemRemove') {
          return (
            <Button
              type='danger'
              onClick={() => this.subItemRemove(obj, choices)}
            >
              -
            </Button>
          )
        }
        else if (action === 'commit') {
          return (
            <Button
              type="primary"
              disabled={this.state.disableCommit}
              style={{float: 'right', marginRight: 5, marginBottom: 15}}
              onClick={() => this.validation()}
            >
              Commit
            </Button>
          )
        }
      }
    }

    let returnCol = () => {
      if (this.props.items === 'nodes') {
        return nodesColumns
      }
      if (this.props.items === 'monitors') {
        return monitorsColumns
      }
      if (this.props.items === 'snatpools') {
        return snatpoolsColumns
      }
      if (this.props.items === 'pools') {
        return poolsColumns
      }
      if (this.props.items === 'irules') {
        return irulesColumns
      }
      if (this.props.items === 'profiles') {
        return profilesColumns
      }
    }

    const expandedRowRender = (...params) => {
      const columns = [
        {
          title: 'Address',
          align: 'center',
          dataIndex: 'address',
          key: 'address',
          ...this.getColumnSearchProps('address'),
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
          ...this.getColumnSearchProps('routeDomain'),
          render: (val, obj)  => (
            createElement('select', 'routeDomain', this.state.routeDomains, obj, '', params[0])
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
          ...this.getColumnSearchProps('address'),
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
          dataIndex: 'address',
          key: 'address',
          ...this.getColumnSearchProps('port'),
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
          ...this.getColumnSearchProps('state'),
          render: (val, obj)  => (
            obj.existent ?
              val
            :
              createElement('select', 'state', this.state.nodeSessions, obj, '', params[0])
          )
        },
        {
          title: 'Session',
          align: 'center',
          dataIndex: 'session',
          key: 'session',
        },
        {
          title: 'Member State',
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
                createElement('button', 'itemRemove', '', obj, 'itemRemove', params[0])
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
            onClick={() => this.subItemAdd(params[0])}
          >
            Add member
          </Button>
          { this.props.items === 'pools' ? 
              <Button
                type="primary"
                onClick={() => this.getPoolmembers(params[0])}
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
              columns={this.props.items === 'pools' ? poolmembersColumn : columns}
              rowKey={record => record.id}
              //style={{backgroundColor:'black'}}
              dataSource={params[0].members}
              pagination={{pageSize: 10}}
            />
          }
          
        </React.Fragment>
      )
    };

    const nodesColumns = [
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
        ...this.getColumnSearchProps('name'),
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
        ...this.getColumnSearchProps('address'),
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
        ...this.getColumnSearchProps('routeDomain'),
        render: (val, obj)  => (
          createElement('select', 'routeDomain', this.state.routeDomains, obj, '')
        )
      },
      {
        title: 'Session',
        align: 'center',
        dataIndex: 'session',
        key: 'session',
        ...this.getColumnSearchProps('session'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'session', this.state.nodeSessions, obj, '')
        )
      },
      {
        title: 'State',
        align: 'center',
        dataIndex: 'state',
        key: 'state',
        ...this.getColumnSearchProps('state'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'state', this.state.nodeStates, obj, '')
        )
      },
      {
        title: 'Monitor',
        align: 'center',
        dataIndex: 'monitor',
        key: 'monitor',
        ...this.getColumnSearchProps('monitor'),
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

    const monitorsColumns = [
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
        ...this.getColumnSearchProps('name'),
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
        ...this.getColumnSearchProps('type'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'type', this.state.monitorTypes, obj, '')
        )
      },
      {
        title: 'Interval',
        align: 'center',
        dataIndex: 'interval',
        key: 'interval',
        ...this.getColumnSearchProps('interval'),
        render: (val, obj)  => (
          createElement('input', 'interval', '', obj, '')
        )
      },
      {
        title: 'Timeout',
        align: 'center',
        dataIndex: 'timeout',
        key: 'timeout',
        ...this.getColumnSearchProps('timeout'),
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

    const snatpoolsColumns = [
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
        ...this.getColumnSearchProps('name'),
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

    const poolsColumns = [
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
        ...this.getColumnSearchProps('name'),
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
        ...this.getColumnSearchProps('monitor'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'monitor', this.state.monitorTypes, obj, '')
        )
      },
      {
        title: 'Load Balancing Mode',
        align: 'center',
        dataIndex: 'loadBalancingMode',
        key: 'loadBalancingMode',
        ...this.getColumnSearchProps('loadBalancingMode'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'loadBalancingMode', this.state.loadBalancingModes, obj, '')
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

    const irulesColumns = [
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
        ...this.getColumnSearchProps('name'),
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
        ...this.getColumnSearchProps('apiAnonymous'),
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

    const profilesColumns = [
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
        ...this.getColumnSearchProps('name'),
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
        ...this.getColumnSearchProps('type'),
        render: (val, obj)  => (
          obj.existent ?
            val
          :
            createElement('select', 'type', this.state.profileTypes, obj, '')
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

    let errors = () => {
      if (this.props.error && this.props.error.component === 'itemsView') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <React.Fragment>
            {/*to do: createElement()*/} 
            <Radio.Group>
              <Radio.Button
                style={{marginLeft: 10 }}
                onClick={() => this.main()}
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
                onClick={() => this.itemAdd(this.state.items, this.props.items)}
              >
                +
              </Radio.Button>
            </Radio.Group>

            <br/>
            <br/>
            { this.props.items === 'snatpools' || this.props.items === 'pools' ?
              <Table
                columns={returnCol()}
                dataSource={this.state.items}
                bordered
                scroll={{x: 'auto'}}
                pagination={{pageSize: 10}}
                style={{marginBottom: 10}}
                onExpand={this.onTableRowExpand}
                expandedRowKeys={this.state.expandedKeys}
                rowKey={record => record.id}
                expandedRowRender={ record => expandedRowRender(record)}
              />
            :
              <Table
                columns={returnCol()}
                style={{width: '100%', padding: 5}}
                dataSource={this.state.items}
                bordered
                rowKey={randomKey}
                scroll={{x: 'auto'}}
                pagination={{ pageSize: 10 }}
              />
            }
            <br/>

            {createElement('button', '', '', '', 'commit')}

          </React.Fragment>
        }

        {errors()}
  
      </React.Fragment>
    )
  }

}

export default connect((state) => ({
token: state.authentication.token,
error: state.concerto.err,

asset: state.f5.asset,
partition: state.f5.partition,
}))(ItemsView);
  
  