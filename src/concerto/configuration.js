import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'

import { Space, Table, Input, Button, Spin, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';


import {
  configurations,
  configurationsError,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

//import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      configurations: [],
      errors: {},
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (!this.props.configurationsError && !this.props.configurations) {
      this.setState({configurationsRefresh: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({configurationsRefresh: false})
      this.main()
    }
    if (this.state.configurationsRefresh) {
      this.setState({configurationsRefresh: false})
      this.main()
    }
  }

  componentWillUnmount() {
    this.setState({configurations: []})
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
    let conf = []
    let configurationsFetched = await this.configurationGet()
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      this.props.dispatch(configurationsError(configurationsFetched))
      await this.setState({loading: false})
      return
    }
    else {
      console.log(configurationsFetched.data.configuration)
      if (configurationsFetched.data.configuration.length > 0) {
        conf = JSON.parse(configurationsFetched.data.configuration)
      }
      await this.setState({loading: false, configurations: conf})
      this.props.dispatch(configurations(configurationsFetched))
    }
  }

  configurationsRefresh = async () => {
    await this.setState({configurationsRefresh: true})
  }

  configurationGet = async () => {
    let endpoint = `${this.props.vendor}/configuration/global/`
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

    await rest.doXHR(`${endpoint}`, this.props.token)

    return r
  }

  addRecord = async () => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let idList = []
    let n

    if (conf.length < 1) {
      n = 1
    }
    conf.forEach(r => {
      idList.push(Number(r.id))
    });

    let m = Math.max(...idList)
    if ( !n ) {
      n = m + 1
    }

    let r = {id: n}
    conf.push(r)
    await this.setState({configurations: conf})
  }

  removeRecord = async obj => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let newList = conf.filter(n => {
      return obj.id !== n.id
    })
    console.log('newList', newList)
    await this.setState({configurations: newList})
  }

  keySet = async (event, id) => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let record = conf.find( r => r.id === id )
    record.key = event
    delete record.keyError
    await this.setState({configurations: conf})
  }

  valueSet = async (event, id) => {
    let conf = JSON.parse(JSON.stringify(this.state.configurations))
    let record = conf.find( r => r.id === id )
    record.value = event
    await this.setState({configurations: conf})
  }

  validationCheck = async () => {
    let configurations = JSON.parse(JSON.stringify(this.state.configurations))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (configurations.length > 0) {
      configurations.forEach((conf, i) => {
        errors[conf.id] = {}

        if (!conf.key) {
          errors[conf.id].keyError = true
          this.setState({errors: errors})
        }
        else {
          delete errors[conf.id]
          this.setState({errors: errors})
        }
      })
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.modifyConfiguration()
    }
  }


  modifyConfiguration = async () => {
    let conf = JSON.stringify(this.state.configurations)
    await this.setState({loading: true})

    let b = {}
    b.data = {
      "configuration": conf
    }

    let rest = new Rest(
      "PUT",
      resp => {
        this.setState({loading: false})
        this.main()
      },
      error => {
        this.setState({loading: false})
        this.props.dispatch(configurationsError(error))
      }
    )
    await rest.doXHR(`f5/configuration/global/`, this.props.token, b )
  }




  render() {
    console.log(this.state.configurations)
    console.log(this.state.errors)

    let returnCol = () => {
      switch (this.props.vendor) {
        case 'checkpoint':
          return checkpointColumns
          break;
        case 'f5':
          return f5Columns
          break;
        default:

      }
    }

    const checkpointColumns = [
      {
        title: 'Config Object Type',
        align: 'center',
        width: 300,
        dataIndex: 'config_object_type',
        key: 'config_object_type',
        ...this.getColumnSearchProps('config_object_type'),
      },
      {
        title: 'Name',
        align: 'center',
        width: 500,
        dataIndex: 'config_object_name',
        key: 'config_object_name',
        ...this.getColumnSearchProps('config_object_name'),
      },
      {
        title: 'Description',
        align: 'center',
        width: 500,
        dataIndex: 'config_object_description',
        key: 'config_object_description',
        ...this.getColumnSearchProps('config_object_description'),
      },
      {
        title: 'Action',
        align: 'center',
        width: 500,
        dataIndex: 'action',
        key: 'action',
        ...this.getColumnSearchProps('action'),
      },
      {
        title: 'Date',
        align: 'center',
        dataIndex: 'date',
        key: 'date',
        defaultSortOrder: 'descend',
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
        ...this.getColumnSearchProps('date'),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        ...this.getColumnSearchProps('status'),
      },
      {
        title: 'Username',
        align: 'center',
        dataIndex: 'username',
        key: 'username',
        ...this.getColumnSearchProps('username'),
      }
    ];
    const f5Columns = [
      {
        title: 'Key',
        align: 'center',
        dataIndex: 'key',
        key: 'key',
        render: (name, obj)  => (
          <Input
            defaultValue={obj.key}
            style={(this.state.errors[obj.id] && this.state.errors[obj.id].keyError) ? { width: '250px', borderColor: 'red'} : { width: '250px'} }
            onBlur={e => this.keySet(e.target.value, obj.id)}
          />
        ),
      },
      {
        title: 'Value',
        align: 'center',
        dataIndex: 'value',
        key: 'value',
        render: (name, obj)  => (
          <Checkbox
            checked={obj.value}
            onChange={e => this.valueSet(e.target.checked, obj.id)}
          />
        ),
      },
      {
        title: 'Remove record',
        align: 'center',
        dataIndex: 'remove',
        width: 150,
        key: 'remove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.removeRecord(obj)} shape='round'>
            -
          </Button>
        ),
      },
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>

            <Button onClick={() => this.configurationsRefresh()} shape='round'><ReloadOutlined/></Button>
            <br/>
            <Button type="primary" onClick={() => this.addRecord()} shape='round'> + </Button>

            <Table
              columns={returnCol()}
              dataSource={this.state.configurations}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />

            <Button
              type="primary"
              style={{float: "right", marginTop: '15px'}}
              onClick={() => this.validation()}
              shape='round'
            >
              Update configuration
            </Button>
          </Space>
        }
        { this.props.configurationsError ? <Error vendor={this.props.vendor} error={[this.props.configurationsError]} visible={true} type={'configurationsError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  configurations: state.concerto.configurations,
  configurationsError: state.concerto.configurationsError,
}))(Manager);
