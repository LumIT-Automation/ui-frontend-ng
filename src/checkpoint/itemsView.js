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
import Authorizators from '../_helpers/authorizators'

import AddItem from './addItem'

import {
  fetchItems,
} from './store'

import {
  err
} from '../concerto/store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class ItemsView extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};
    this.textAreaRefs = {};

    this.state = {
      searchText: '',
      searchedColumn: '',
      disableCommit: false,
      originitems: [],
      items: [],
      expandedKeys: [],
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
    console.log('items', this.state.items)
    console.log('errors', this.state.errors)
    if (this.props.asset !== prevProps.asset || this.props.domain !== prevProps.domain) {
      this.main()
    }
    if (this.props.items !== prevProps.items) {
      this.main()
    }
    if (this.props.fetchItems) {
      this.props.dispatch(fetchItems(false))
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
    
    if (this.props.items === 'hosts') {

      let fetched = await this.dataGet(this.props.asset.id)
      if (fetched.status && fetched.status !== 200 ) {
        let error = Object.assign(fetched, {
          component: 'itemsView',
          vendor: 'checkpoint',
          errorType: 'hostsError'
        })
        this.props.dispatch(err(error))
        await this.setState({loading: false})
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
        await this.setState({items: items, originitems: items, loading: false})
      }
    }

  }

  dataGet = async (assetId, entities) => {
    let endpoint
    let r


    endpoint = `${this.props.vendor}/${assetId}/${this.props.domain}/${this.props.items}/`

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

    if (item.members.length < 1) {
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
    console.log('èèèèèèè')
    let items = JSON.parse(JSON.stringify(this.state.items))
    let errors = 0
    let validators = new Validators()

    if (this.props.items === 'hosts') {

      for (const item of Object.values(items)) {
        if (!item.name) {
          console.log('name')
          item.nameError = true
          ++errors
        }
        if ( !(validators.ipv4(item.address) || validators.ipv6(item.address) || item.address === 'any6') ) {
          console.log('address')
          item.addressError = true
          ++errors
        }

      }
      await this.setState({items: items})
      console.log('items', this.state.items)
      console.log('errors', errors)
      return errors
    }

  }

  validation = async () => {
    this.setState({disableCommit: true})
    let errors = await this.validationCheck()
    
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
        toPost.push(item)
      }
      if (item.toDelete) {
        console.log('èèèèè')
        toDelete.push(item)
      }
      if (item.isModified && Object.keys(item.isModified).length > 0) {
        toPatch.push(item)
      }
    }

    if (toDelete.length > 0) {
      console.log(toDelete)
      for (const item of toDelete) {
        item.loading = true
        await this.setState({items: items})

        let e = await this.itemDelete(item)
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `delete${this.props.item}Error`
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

        if (this.props.items === 'hosts') {
          body.data = {
            "address": item.address,
            "name": item.name,
            "session": item.session,
            "state": item.state
          }
        }

        item.loading = true
        await this.setState({items: items})

        let e = await this.itemPost(body)
        if (e.status && e.status !== 201 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `add${this.props.items}Error`
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

        item.loading = true
        await this.setState({items: items})

        let e = await this.itemPatch(item.name, item.type ? item.type : null, body)
        if (e.status && e.status !== 200 ) {
          let error = Object.assign(e, {
            component: 'itemsView',
            vendor: 'checkpoint',
            errorType: `edit${this.props.item}Error`
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

    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.domain}/${this.props.items}/`, this.props.token, body )
    
    return r
  }

  itemDelete = async (item, type) => {
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

    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.domain}/${this.props.item}/${item.uid}/`, this.props.token )
    
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

    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/${this.props.domain}/${this.props.item}/${name}/`, this.props.token, body )
    
    return r
  }

  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }

  render() {

    let today = new Date().getTime();
    let thirtyDays = 2592000000
    let inThirtyDays = new Date(today + thirtyDays);


    let randomKey = () => {
      return Math.random().toString()
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
              onChange={event => this.set(key, event.target.value, obj, father)}
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
      if (this.props.items === 'hosts') {
        return hostsColumns
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
        ...this.getColumnSearchProps('name'),
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
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
      },
      {
        title: 'IPv4-address',
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
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (val, obj)  => (
          <Space size="small">
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'checkpoint', 'host_delete')) ? 
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
            <Radio.Group style={{marginRight: 5}}>
              <Radio.Button
                style={{marginLeft: 10 }}
                onClick={() => this.main()}
              >
                <ReloadOutlined/>
              </Radio.Button>
            </Radio.Group>

            {this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'checkpoint', 'hosts_post') ?
              <AddItem items={this.props.items} item={this.props.item}/>
            :
              null
            }

            <br/>
            <br/>
              <Table
                columns={returnCol()}
                style={{width: '100%', padding: 5}}
                dataSource={this.state.items}
                bordered
                rowKey={randomKey}
                scroll={{x: 'auto'}}
                pagination={{pageSize: 10}}
              />
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
authorizations: state.authorizations,

asset: state.checkpoint.asset,
domain: state.checkpoint.domain,
fetchItems: state.checkpoint.fetchItems
}))(ItemsView);
  
  