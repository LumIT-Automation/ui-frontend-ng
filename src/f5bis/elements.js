import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css';
import '../App.css'
import { Space, Table, Input, Select, Button, Spin, Checkbox, Radio } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Error from './error'
import CommonFunctions from '../_helpers/commonFunctions';

import {
  nodesError,
  routeDomainsError,
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

    this.state = {
      searchText: '',
      searchedColumn: '',
      f5elements: [],
      originf5elements: [],
      element: 'node',
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
    console.log(this.state.routeDomains)
    console.log(this.state.f5elements)

    if (this.props.f5elements !== prevProps.f5elements || this.props.asset !== prevProps.asset || this.props.partition !== prevProps.partition) {
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
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  main = async () => {
    await this.setState({loading: true})

    let routeDomains = await this.dataGet('routedomains', this.props.asset.id)
    if (routeDomains.status && routeDomains.status !== 200 ) {
      this.props.dispatch(routeDomainsError(routeDomains))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({routeDomains: routeDomains.data.items})
    }

    let f5elements = await this.dataGet(this.props.f5elements, this.props.asset.id)
    let id = 1
    
    if (f5elements.status && f5elements.status !== 200 ) {
      this.props.dispatch(nodesError(f5elements))
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

  dataGet = async (entities, assetId) => {
    let endpoint = `f5/${entities}/`
    let r
    if (assetId) {
      endpoint = `f5/${assetId}/${this.props.partition}/${entities}/`
    }
    if (entities === 'routedomains') {
      endpoint = `f5/${assetId}/${entities}/`
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

  set = async (key, value, el) => {
    let elements = JSON.parse(JSON.stringify(this.state.f5elements))
    let origEl = this.state.originf5elements.find(e => e.id === el.id)
    let e

    if (el) {
      e = elements.find(e => e.id === el.id)

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


  render() {

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

        else if (key === 'session') {
          return (
            <Select
              value={obj.session}
              showSearch
              style={{width: 150}}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set('session', event, obj)}
            >
              <React.Fragment>
                {choices.map((session, i) => {
                  return (
                    <Select.Option key={i} value={session}>{session}</Select.Option>
                  )
                })
                }
              </React.Fragment>
            </Select>
          )
        }

        else if (key === 'state') {
          return (
            <Select
              value={obj.state}
              showSearch
              style={{width: 150}}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set('state', event, obj)}
            >
              <React.Fragment>
                {choices.map((state, i) => {
                  return (
                    <Select.Option key={i} value={state}>{state}</Select.Option>
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
              style={{float: 'right', marginRight: 5, marginBottom: 15}}
              //onClick={() => this.validation()}
              onClick={() => console.log('commit!!!')}
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
                Add {this.state.element}
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

        { this.props.routeDomainsError ? <Error object={this.props.f5elements} error={[this.props.routeDomainsError]} visible={true} type={'routeDomainsError'} /> : null }
        { this.props.nodesError ? <Error object={this.props.f5elements} error={[this.props.nodesError]} visible={true} type={'nodesError'} /> : null }

      </React.Fragment>
    )
  }

}

export default connect((state) => ({
token: state.authentication.token,

asset: state.f5.asset,
partition: state.f5.partition,

nodesError: state.f5.nodesError,
routeDomainsError: state.f5.routeDomainsError,
}))(F5Elements);
  
  