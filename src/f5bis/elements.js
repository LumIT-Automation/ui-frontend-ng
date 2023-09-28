import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css';
import '../App.css'
import { Space, Table, Input, Select, Button, Spin, Checkbox, Radio, Card } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Error from './error'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions';

import {
  err,

} from './store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*
@todo:
aggiornamento antd
foreach --> map
1 funzione, 1 azione
1 get
1 set
validation
del, post, patch
createElement
localStorage
*/ 

class F5Elements extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};
    this.textAreaRefs = {};

    this.state = {
      searchText: '',
      searchedColumn: '',
      disableCommit: false,
      f5elements: [],
      monitorTypes: [],
      profileTypes: [],
      originf5elements: [],
      nodeSessions: ['user-enabled', 'user-disabled'],
      nodeStates: ['unchecked', 'user-down'],
      errors: {}
    };
  }

  componentDidMount() {
    if (this.props.f5elements) {
      this.main()
    }
  }
  
  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state.f5elements)
    console.log(this.state.searchText)
    if (this.props.asset !== prevProps.asset || this.props.partition !== prevProps.partition) {
      this.main()
    }
    if (this.props.f5elements !== prevProps.f5elements) {
      this.main()
    }
  }

  componentWillUnmount() {
  }


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
    console.log(clearFilters())
    console.log(confirm())
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  main = async () => {
    await this.setState({f5elements: [], originf5elements: [], loading: true})
    let id = 1
    
    if (this.props.f5elements === 'nodes') {
      let routeDomains = await this.dataGet('routedomains', this.props.asset.id)
      if (routeDomains.status && routeDomains.status !== 200 ) {
        this.props.dispatch(err(routeDomains))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({routeDomains: routeDomains.data.items})
      }

      let f5elements = await this.dataGet('nodes', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let elements = f5elements.data.items.map(el => {
          el.existent = true, 
          el.isModified = {}
          el.id = id
          id++
          return el
        })
        await this.setState({f5elements: elements, originf5elements: elements, loading: false})
      }
    }

    else if (this.props.f5elements === 'monitors') {
      let f5elements = await this.dataGet('monitorTypes', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({monitorTypes: f5elements.data.items})
      }
    
      f5elements = await this.dataGet('monitors', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let list = []
  
        for (let t in f5elements.data) {
          let type = t
          let values = Object.values(f5elements.data[t])
  
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
        await this.setState({f5elements: list, originf5elements: list, loading: false})
      }
    }

    else if (this.props.f5elements === 'irules') {
      let f5elements = await this.dataGet('irules', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let elements = f5elements.data.items.map(el => {
          el.existent = true, 
          el.isModified = {}
          el.id = id
          id++
          return el
        })
        await this.setState({f5elements: elements, originf5elements: elements, loading: false})
      }
    }

    else if (this.props.f5elements === 'certificates') {
      let f5elements = await this.dataGet('certificates', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let elements = f5elements.data.items.map(el => {
          el.existent = true, 
          el.isModified = {}
          el.id = id
          el.issuer = el.apiRawValues.issuer
          el.expiration = el.apiRawValues.expiration
          id++
          return el
        })
        await this.setState({f5elements: elements, originf5elements: elements, loading: false})
      }
    }

    else if (this.props.f5elements === 'keys') {
      let f5elements = await this.dataGet('keys', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let elements = f5elements.data.items.map(el => {
          el.existent = true, 
          el.isModified = {}
          el.id = id
          //el.issuer = el.apiRawValues.issuer
          //el.expiration = el.apiRawValues.expiration
          id++
          return el
        })
        await this.setState({f5elements: elements, originf5elements: elements, loading: false})
      }
    }

    else if (this.props.f5elements === 'profiles') {
      let f5elements = await this.dataGet('profileTypes', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        await this.setState({profileTypes: f5elements.data.items})
      }
    
      f5elements = await this.dataGet('profiles', this.props.asset.id)
      if (f5elements.status && f5elements.status !== 200 ) {
        this.props.dispatch(err(f5elements))
        await this.setState({loading: false})
        return
      }
      else {
        let list = []
  
        for (let t in f5elements.data) {
          let type = t
          let values = Object.values(f5elements.data[t])
  
          values.forEach(o => {
            o.forEach(p => {
              Object.assign(p, {type: type, id: id, existent: true, isModified: {}});
              list.push(p)
              id++
            })
          })
        }
        await this.setState({f5elements: list, originf5elements: list, loading: false})
      }
    }
  }

  dataGet = async (entities, assetId) => {
    let endpoint = `f5/${entities}/`
    let r
    if (assetId) {
      endpoint = `f5/${assetId}/${this.props.partition}/${entities}/`
    }
    if (entities === 'routedomains') {
      endpoint = `f5/${assetId}/${entities}/`
    }
    if (entities === 'monitorTypes') {
      endpoint = `f5/${assetId}/${this.props.partition}/monitors/`
    }
    if (entities === 'monitors') {
      endpoint = `f5/${assetId}/${this.props.partition}/${entities}/ANY/`
    }
    if (entities === 'profileTypes') {
      endpoint = `f5/${assetId}/${this.props.partition}/profiles/`
    }
    if (entities === 'profiles') {
      endpoint = `f5/${assetId}/${this.props.partition}/${entities}/ANY/`
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

  elementAdd = async (elements) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.elementAdd(elements)
    await this.setState({f5elements: list})
  }

  elementRemove = async (el, elements) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.elementRemove(el, elements)
    await this.setState({f5elements: list})
  }

  /*
    SET
  */

  transformFile = async file => {
    console.log('transformFile', file)
    let reader = new FileReader();
    console.log(reader)
    let r

    try {
      reader.onload = function () {
        console.log(reader.result);
        r = reader
      }
      console.log(reader)
  
      reader.readAsText(file);
      console.log(reader)
      
    }
    catch (error) {
      console.log(error)
      r = error
    }
    return r    
  }

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

  set = async (key, value, el) => {
    let elements = JSON.parse(JSON.stringify(this.state.f5elements))
    //console.log(key)
    //console.log(value)
    //console.log(el)

    if (el) {
      let origEl = this.state.originf5elements.find(e => e.id === el.id)
      let e = elements.find(e => e.id === el.id)

      if (key === 'name'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${el.id}_${key}`]
  
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

        await this.setState({f5elements: elements})
        ref = this.myRefs[`${el.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'address'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${el.id}_${key}`]
  
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

        await this.setState({f5elements: elements})
        ref = this.myRefs[`${el.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'interval'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${el.id}_${key}`]
  
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

        await this.setState({f5elements: elements})
        ref = this.myRefs[`${el.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'timeout'){
        let start = 0
        let end = 0
        let ref = this.myRefs[`${el.id}_${key}`]
  
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

        await this.setState({f5elements: elements})
        ref = this.myRefs[`${el.id}_${key}`]
  
        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }
  
        ref.focus()
      }

      if (key === 'routeDomain') {
        value = value.toString()
        if (value) {
          e[key] = value
          delete e[`${key}Error`]
        }
        else {
          //blank value while typing.
          e[key] = ''
        }
        await this.setState({f5elements: elements})
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
        await this.setState({f5elements: elements})
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
        await this.setState({f5elements: elements})
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
        await this.setState({f5elements: elements})
      }

      if (key === 'apiAnonymous') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${el.id}_${key}`]

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

        await this.setState({f5elements: elements})
        ref = this.textAreaRefs[`${el.id}_${key}`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'sourceType') {
        e.sourceType = value
        delete e[`${key}Error`]
        await this.setState({f5elements: elements})
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

        await this.setState({f5elements: elements})
      }

      if (key === 'text') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${el.id}_${key}`]

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

        await this.setState({f5elements: elements})
        ref = this.textAreaRefs[`${el.id}_${key}`]

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
        await this.setState({f5elements: elements})
      }
    }
    
  }

  /*
    VALIDATION
  */

  validationCheck = async () => {
    let elements = JSON.parse(JSON.stringify(this.state.f5elements))
    let errors = 0
    let validators = new Validators()

    if (this.props.f5elements === 'nodes') {

      for (const el of Object.values(elements)) {

        if (!el.name) {
          el.nameError = true
          ++errors
        }
        if (!el.address) {
          el.addressError = true
          ++errors
        }
        if (!el.session) {
          el.sessionError = true
          ++errors
        }
        if (!el.state) {
          el.stateError = true
          ++errors
        }

      }
      await this.setState({f5elements: elements})
      return errors
    }

    else if (this.props.f5elements === 'monitors') {

      for (const el of Object.values(elements)) {

        if (!el.name) {
          el.nameError = true
          ++errors
        }
        if (!el.type) {
          el.typeError = true
          ++errors
        }
        if ((el.type === 'inband')) {
          continue
        }
        if (!el.interval) {
          el.intervalError = true
          ++errors
        }
        if (!el.timeout) {
          el.timeoutError = true
          ++errors
        }

      }
      await this.setState({f5elements: elements})
      return errors
    }

    else if (this.props.f5elements === 'irules') {

      for (const el of Object.values(elements)) {

        if (!el.name) {
          el.nameError = true
          ++errors
        }
        if (!el.apiAnonymous) {
          console.log('NO CODE OBJECT N ', el.id )
          el.apiAnonymousError = true
          ++errors
        }

      }
      await this.setState({f5elements: elements})
      return errors
    }

    else if (this.props.f5elements === 'certificates') {

      for (const el of Object.values(elements)) {

        if (el.existent) {
          if (el.sourceType && !el.text) {
            el.textError = true
            ++errors
          }
        }
        else {
          if (!el.name) {
            el.nameError = true
            ++errors
          }
          if (!el.sourceType && !el.text) {
            el.sourceTypeError = true
            el.textError = true
            ++errors
          }
        }
      }
      await this.setState({f5elements: elements})
      return errors
    }

    else if (this.props.f5elements === 'keys') {

      for (const el of Object.values(elements)) {

        if (el.existent) {
          if (el.sourceType && !el.text) {
            el.textError = true
            ++errors
          }
        }
        else {
          if (!el.name) {
            el.nameError = true
            ++errors
          }
          if (!el.sourceType && !el.text) {
            el.sourceTypeError = true
            el.textError = true
            ++errors
          }
        }
      }
      await this.setState({f5elements: elements})
      return errors
    }

    else if (this.props.f5elements === 'profiles') {

      for (const el of Object.values(elements)) {

        if (!el.name) {
          el.nameError = true
          ++errors
        }
        if (!el.type) {
          el.typeError = true
          ++errors
        }

      }
      await this.setState({f5elements: elements})
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
    CREATE, UPDATE, DELETE
  */
  cudManager = async () => {
    let elements = JSON.parse(JSON.stringify(this.state.f5elements))
    let toPost = []
    let toDelete = []
    let toPatch = []

    for (const el of Object.values(elements)) {
      if (!el.existent) {
        toPost.push(el)
      }
      if (el.toDelete) {
        toDelete.push(el)
      }
      if (el.isModified && Object.keys(el.isModified).length > 0) {
        toPatch.push(el)
      }
    }

    if (toPost.length > 0) {
      for (const el of toPost) {
        let body = {}

        if (this.props.f5elements === 'nodes') {
          body.data = {
            "address": el.address,
            "name": el.name,
            "session": el.session,
            "state": el.state
          }

          if(el.routeDomain) {
            body.data.address = `${el.address}%${el.routeDomain}`
          }
        }

        if (this.props.f5elements === 'monitors') {
          body.data = {
            "name": el.name,
            "type": el.type,
            "interval": +el.interval,
            "timeout": +el.timeout,
          }
        }

        if (this.props.f5elements === 'irules') {
          body.data = {
            "name": el.name,
            "apiAnonymous": el.apiAnonymous
          }
        }
        
        if (this.props.f5elements === 'certificates') {
          body.certificate = {
            "name": el.name,
            "content_base64": btoa(el.text)
          }
        }

        if (this.props.f5elements === 'keys') {
          body.key = {
            "name": el.name,
            "content_base64": btoa(el.text)
          }
        }

        if (this.props.f5elements === 'profiles') {
          body.data = {
            "name": el.name,
            "type": el.type
          }
        }

        el.loading = true
        await this.setState({f5elements: elements})

        let e = await this.elPost(body)
        if (e.status && e.status !== 201 ) {
          this.props.dispatch(err(e))
          el.loading = false
          await this.setState({f5elements: elements})
        }
        else {
          el.loading = false
          await this.setState({f5elements: elements})
        }
      }
    }

    if (toDelete.length > 0) {
      for (const el of toDelete) {
        el.loading = true
        await this.setState({f5elements: elements})

        if (this.props.f5elements === 'certificates') {
          let l = el.name.split('/')
          el.name  = l[2]
        }

        if (this.props.f5elements === 'keys') {
          let l = el.name.split('/')
          el.name  = l[2]
        }

        let e = await this.elDelete(el.name, el.type ? el.type : null )
        if (e.status && e.status !== 200 ) {
          this.props.dispatch(err(e))
          el.loading = false
          await this.setState({f5elements: elements})
        }
        else {
          el.loading = false
          await this.setState({f5elements: elements})
        }

      }
    }

    if (toPatch.length > 0) {
      for (const el of toPatch) {
        let body = {}

        if (this.props.f5elements === 'monitors') {
          body.data = {
            "destination": "*:*",
            "interval": +el.interval,
            "manualResume": "disabled",
            "timeUntilUp": 0,
            "timeout": +el.timeout,
            "transparent": "disabled",
            "upInterval": 0
          }
        }

        if (this.props.f5elements === 'irules') {
          body.data = {
            "name": el.name,
            "apiAnonymous": el.apiAnonymous
          }
        }

        if (this.props.f5elements === 'certificates') {
          let l = el.name.split('/')
          el.name = l[2]
          body.certificate = {
            "content_base64": btoa(el.text)
          }
        }

        if (this.props.f5elements === 'keys') {
          let l = el.name.split('/')
          el.name = l[2]
          body.key = {
            "content_base64": btoa(el.text)
          }
        }

        el.loading = true
        await this.setState({f5elements: elements})

        let e = await this.elPatch(el.name, el.type ? el.type : null, body)
        if (e.status && e.status !== 200 ) {
          this.props.dispatch(err(e))
          el.loading = false
          await this.setState({f5elements: elements})
        }
        else {
          el.loading = false
          await this.setState({f5elements: elements})
        }
      }
    }


    this.setState({disableCommit: false})
    this.main()
  }

  elPost = async (body) => {
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
    if (this.props.f5elements === 'monitors') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/${body.data.type}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'irules') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'certificates') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'keys') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'profiles') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/${body.data.type}/`, this.props.token, body )
    }
    else {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/${this.props.f5elements}/`, this.props.token, body )
    }
    
    return r
  }

  elDelete = async (name, type) => {
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
    //@todo: element as a prop
    if (this.props.f5elements === 'monitors') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${type}/${name}/`, this.props.token )
    }
    else if (this.props.f5elements === 'irules') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/irule/${name}/`, this.props.token )
    }
    else if (this.props.f5elements === 'certificates') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/certificate/${name}/`, this.props.token )
    }
    else if (this.props.f5elements === 'keys') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/key/${name}/`, this.props.token )
    }
    else if (this.props.f5elements === 'profiles') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profile/${type}/${name}/`, this.props.token )
    }
    else {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/node/${name}/`, this.props.token )
    }
    return r
  }

  elPatch = async (name, type, body) => {
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
    //@todo: element as a prop
    if (this.props.f5elements === 'monitors') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitor/${type}/${name}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'irules') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/irule/${name}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'certificates') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/certificate/${name}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'keys') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/key/${name}/`, this.props.token, body )
    }
    else if (this.props.f5elements === 'profiles') {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profile/${type}/${name}/`, this.props.token )
    }
    else {
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/node/${name}/`, this.props.token )
    }
    return r
  }


  render() {

    let today = new Date().getTime();
    let thirtyDays = 2592000000
    let inThirtyDays = new Date(today + thirtyDays);

    let randomKey = () => {
      return Math.random().toString()
    }

    let createElement = (element, key, choices, obj, action) => {
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
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
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
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
            />          
          )
        }
        else if (key === 'interval') {
          return (
            <Input
              value={obj[key]}
              style=
                {obj[`${key}Error`] ?
                  {borderColor: 'red', width: 80}
                :
                  {width: 80}
                }
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
            />          
          )
        }
        else if (key === 'timeout') {
          return (
            <Input
              value={obj[key]}
              style=
                {obj[`${key}Error`] ?
                  {borderColor: 'red', width: 80}
                :
                  {width: 80}
                }
              ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
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
              onChange={e => this.set(key, e.target.files[0], obj)} 
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
              value={obj.routeDomain}
              showSearch
              style={{width: 150}}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set('routeDomain', event, obj)}
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
        if (action === 'elementRemove') {
          return (
            <Button
              type='danger'
              onClick={() => this.elementRemove(obj, this.state.f5elements)}
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
      if (this.props.f5elements === 'nodes') {
        return nodesColumns
      }
      if (this.props.f5elements === 'monitors') {
        return monitorsColumns
      }
      if (this.props.f5elements === 'irules') {
        return irulesColumns
      }
      if (this.props.f5elements === 'certificates') {
        return certificatesColumns
      }
      if (this.props.f5elements === 'keys') {
        return keysColumns
      }
      if (this.props.f5elements === 'profiles') {
        return profilesColumns
      }
    }

    let rd = (address) => {
      let val = address.split('%')
      if (val.length > 1) {
        return val[1]
      }
      else {
        return null
      }
    }

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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
          obj.existent ?
            rd(obj.address)
          :
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
            }
          </Space>
        ),
      }
    ];

    const certificatesColumns = [
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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
        title: 'Issuer',
        align: 'center',
        width: '100px',
        dataIndex: 'issuer',
        key: 'issuer',
        ...this.getColumnSearchProps('issuer'),
      },
      {
        title: 'Expiration',
        align: 'center',
        width: 200,
        dataIndex: 'expiration',
        key: 'expiration',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
          if (a?.expiration && b?.expiration) {
            return new Date(a.expiration) - new Date(b.expiration)
          }
        },
        ...this.getColumnSearchProps('expiration'),
        render: (val, obj) => (
          obj?.expiration ?
            <div
              style={{
                background: (new Date(val).getTime()) < today ? 
                  '#FCF2F0' 
                : (new Date(val).getTime()) < inThirtyDays.getTime() ?
                    '#FFFBE6'
                  :
                    'white'
              }}
            >
              {val}
            </div>
          :
            null
        )
      },
      {
        title: 'Edit',
        align: 'center',
        dataIndex: '',
        key: 'edit',
        render: (val, obj)  => (
          <Space size="small">
            <Radio.Group 
              onChange={e => this.set('sourceType', e.target.value, obj)} 
              value={obj.sourceType}
              style={obj.sourceTypeError ? {backgroundColor: 'red'} : {}}
            >
              <Radio value={"upload"}>Upload</Radio>
              <Radio value={"text"}>Text</Radio>
            </Radio.Group>
          </Space>
        )
      },
      {
        title: 'Content',
        align: 'center',
        dataIndex: '',
        key: 'content',
        render: (val, obj)  => (
          (obj.sourceType === 'text') ? 
            createElement('textarea', 'text', '', obj, '')
          :
            (obj.sourceType === 'upload') ?
              createElement('file', 'upload', '', obj, '')
            :
              null
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
            }
          </Space>
        ),
      }
    ];

    const keysColumns = [
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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
        title: 'Key Type',
        align: 'center',
        width: '100px',
        dataIndex: 'keyType',
        key: 'keyType',
        ...this.getColumnSearchProps('keyType'),
      },
      {
        title: 'Security Type',
        align: 'center',
        width: '100px',
        dataIndex: 'securityType',
        key: 'securityType',
        ...this.getColumnSearchProps('securityType'),
      },
      {
        title: 'Edit',
        align: 'center',
        dataIndex: '',
        key: 'edit',
        render: (val, obj)  => (
          <Space size="small">
            <Radio.Group 
              onChange={e => this.set('sourceType', e.target.value, obj)} 
              value={obj.sourceType}
              style={obj.sourceTypeError ? {backgroundColor: 'red'} : {}}
            >
              <Radio value={"upload"}>Upload</Radio>
              <Radio value={"text"}>Text</Radio>
            </Radio.Group>
          </Space>
        )
      },
      {
        title: 'Content',
        align: 'center',
        dataIndex: '',
        key: 'content',
        render: (val, obj)  => (
          (obj.sourceType === 'text') ? 
            createElement('textarea', 'text', '', obj, '')
          :
            (obj.sourceType === 'upload') ?
              createElement('file', 'upload', '', obj, '')
            :
              null
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
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
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
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
              createElement('button', 'elementRemove', '', obj, 'elementRemove')
            }
          </Space>
        ),
      }
    ];

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
                onClick={() => this.elementAdd(this.state.f5elements)}
              >
                +
              </Radio.Button>
            </Radio.Group>

            <br/>
            <br/>

            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 5}}
              dataSource={this.state.f5elements}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
            <br/>

            {createElement('button', '', '', '', 'commit')}

          </React.Fragment>
        }

        { this.props.err ? <Error object={this.props.f5elements} error={[this.props.err]} visible={true} type={'err'} /> : null }
  
      </React.Fragment>
    )
  }

}

export default connect((state) => ({
token: state.authentication.token,

asset: state.f5bis.asset,
partition: state.f5bis.partition,

err: state.f5bis.err,

}))(F5Elements);
  
  