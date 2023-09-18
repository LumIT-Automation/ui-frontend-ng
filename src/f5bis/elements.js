import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css';
import '../App.css'
import { Space, Table, Input, Button, Spin, Checkbox, Radio } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Error from './error'
import CommonFunctions from '../_helpers/commonFunctions';

import {
  nodesError,
} from './store'
  
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const elementLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class F5Elements extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      f5elements: [],
      originf5elements: [],
      element: 'node',
      errors: {}
    };
  }

  componentDidMount() {
    console.log('mount')
    if (this.props.f5elements) {
      this.main()
    }
  }
  
  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
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
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  main = async () => {
    await this.setState({loading: true})
    let f5elements = await this.dataGet(this.props.f5elements, this.props.asset.id)
    console.log(f5elements)
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
    console.log('el', el)
    console.log('elements', elements)
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.elementRemove(el, elements)
    await this.setState({f5elements: list})
  }

  set = async (key, value, el) => {
    let elements = JSON.parse(JSON.stringify(this.state.f5elements))
    let origEl = this.state.originf5elements.find(e => e.id === el.id)
    let e = elements.find(e => e.id === el.id)
    if (key === 'toDelete') {
      if (value) {
        e.toDelete = true
      }
      else {
        delete e.toDelete
      }
    }
    await this.setState({f5elements: elements})
  }
  

  render() {
    console.log('f5elements', this.state.f5elements)

    let randomKey = () => {
      return Math.random().toString()
    }

    let createElement = (element, key, choices, obj, action, event) => {
      switch (element) {
        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
              onChange={event => this.set(event.target.value, key)}
              onPressEnter={() => this.validation(action)}
            />
          )
          break;
        
        case 'checkbox':
          return (
            <Checkbox 
              checked={obj.toDelete}
              //onChange={e => console.log(action)}
              onChange={e => this.set(action, e.target.checked, obj)}
            />
          )
        
        default:

      }

    }

    let returnCol = () => {
      if (this.props.f5elements === 'nodes') {
        return nodesColumns
      }
    }

    const nodesColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={elementLoadIcon} style={{margin: '10% 10%'}}/> : null }
            {/*to do: createElement()*/} 
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
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...this.getColumnSearchProps('address'),
      },
      {
        title: 'Session',
        align: 'center',
        dataIndex: 'session',
        key: 'session',
       ...this.getColumnSearchProps('session'),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'state',
        key: 'state',
       ...this.getColumnSearchProps('state'),
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
        render: (name, obj)  => (
          <Space size="small">
            {/*to do: createElement()*/} 
            { obj.existent ? 
              createElement('checkbox', 'toDelete', '', obj, 'toDelete')
            :
              <Button
                type='danger'
                onClick={(e) => this.elementRemove(obj, this.state.f5elements)}
              >
                -
              </Button>
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
            {/*to do: createElement()*/} 
            <Button
              type="primary"
              style={{float: 'right', marginRight: 5, marginBottom: 15}}
              //onClick={() => this.validation()}
            >
              Commit
            </Button>
          </React.Fragment>
        }

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
}))(F5Elements);
  
  