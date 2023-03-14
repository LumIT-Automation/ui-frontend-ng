import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../_helpers/Rest'
import Error from './error'

import { Space, Table, Input, Button, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

import {
  historys,
  historysError,
  taskProgressLoading,
  secondStageProgressLoading,
} from './store'

//import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (this.props.vendor === 'vmware') {
      if (!this.props.historysError) {
        this.setState({refreshHistorys: false})
        if (!this.props.historys) {
          this.main()
        }
        this.interval = setInterval( () => this.refresh(), 15000)
      }
      else {
        clearInterval(this.interval)
      }
    }
    if (!this.props.historysError && !this.props.historys) {
      this.setState({refreshHistorys: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({refreshHistorys: false})
      this.main()
    }
    if (this.state.refreshHistorys) {
      if (this.props.vendor === 'vmware') {
        clearInterval(this.interval)
      }
      this.setState({refreshHistorys: false})
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

    let fetchedHistorys = await this.historyGet()
    if (fetchedHistorys.status && fetchedHistorys.status !== 200 ) {
      this.props.dispatch(historysError(fetchedHistorys))
      await this.setState({loading: false})
      return
    }
    else if (this.props.vendor === 'vmware'){
      let list = []
      await this.setState({loading: false})
      fetchedHistorys.data.items.forEach((item, i) => {
        let ts = item.task_startTime.split('.');
        item.task_startTime = ts[0]
        list.push(item)
      });

      this.props.dispatch(historys({data: {items:list}}))
    }
    else {
      await this.setState({loading: false})
      this.props.dispatch(historys(fetchedHistorys))
    }
  }

  refresh = async () => {

    let taskProgress = false
    let secondStage = false

    this.props.historys.forEach((item, i) => {
      if (item.second_stage_state === 'running') {
        secondStage = true
      }
      if (item.task_state === 'running') {
        taskProgress = true
      }
    });


    //second_stage_state === 'running'

    if (taskProgress) {
      this.props.dispatch(taskProgressLoading(true))
    }
    if (secondStage) {
      this.props.dispatch(secondStageProgressLoading(true))
    }

    let list = []

    let fetchedHistorys = await this.historyGet()
    this.props.dispatch(taskProgressLoading(false))
    this.props.dispatch(secondStageProgressLoading(false))

    if (fetchedHistorys.status && fetchedHistorys.status !== 200 ) {
      this.props.dispatch(historysError(fetchedHistorys))
      return
    }
    else {
      fetchedHistorys.data.items.forEach((item, i) => {
        let ts = item.task_startTime.split('.');
        item.task_startTime = ts[0]
        list.push(item)
      });
      this.props.dispatch(historys({data: {items:list}}))
    }
  }

  refreshHistorys = async () => {
    await this.setState({refreshHistorys: true})
  }

  historyGet = async () => {
    let endpoint = ''
    if (this.props.vendor === 'vmware') {
     endpoint = `${this.props.vendor}/stage2/targets/?results=10`
    }
    else {
      endpoint = `${this.props.vendor}/history/`
    }

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

  render() {
    console.log(this.props.vendor)
    console.log(this.props.historys)

    let returnCol = () => {
      switch (this.props.vendor) {
        case 'infoblox':
          return infobloxColumns
          break;
        case 'checkpoint':
          return checkpointColumns
          break;
        case 'f5':
          return f5Columns
          break;
        case 'vmware':
          return vmwareColumns
          break;
        default:

      }
    }

    const execCommands = [
      {
        title: 'Command',
        align: 'center',
        width: 200,
        dataIndex: 'command',
        key: 'command',
        ...this.getColumnSearchProps('command'),
      },
      {
        title: 'Status',
        align: 'center',
        width: 100,
        dataIndex: 'exit_status',
        key: 'exit_status',
        ...this.getColumnSearchProps('exit_status'),
      },
      {
        title: 'Error',
        align: 'center',
        width: 300,
        dataIndex: 'stderr',
        key: 'stderr',
        ...this.getColumnSearchProps('stderr'),
      }
    ]

    const infobloxColumns = [
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
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
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...this.getColumnSearchProps('address'),
      },
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        ...this.getColumnSearchProps('network'),
      },
      {
        title: 'Gateway',
        align: 'center',
        dataIndex: 'gateway',
        key: 'gateway',
        ...this.getColumnSearchProps('gateway'),
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
        title: 'Config Object Type',
        align: 'center',
        width: 300,
        dataIndex: 'config_object_type',
        key: 'config_object_type',
        ...this.getColumnSearchProps('config_object_type'),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        ...this.getColumnSearchProps('status'),
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
        title: 'Config Object',
        align: 'center',
        dataIndex: 'config_object',
        key: 'config_object',
        ...this.getColumnSearchProps('config_object'),
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
        title: 'Username',
        align: 'center',
        dataIndex: 'username',
        key: 'username',
        ...this.getColumnSearchProps('username'),
      }
    ];
    const vmwareColumns = [
      {
        title: 'Vm name',
        align: 'center',
        width: 150,
        dataIndex: 'vm_name',
        key: 'vm_name',
        ...this.getColumnSearchProps('vm_name'),
      },
      {
        title: 'Start time',
        align: 'center',
        width: 250,
        dataIndex: 'task_startTime',
        key: 'task_startTime',
        defaultSortOrder: 'descend',
        sorter: (a, b) => new Date(a.task_startTime) - new Date(b.task_startTime),
        ...this.getColumnSearchProps('task_startTime'),
      },
      {
        title: 'Task state',
        align: 'center',
        width: 100,
        dataIndex: 'task_state',
        key: 'task_state',
        ...this.getColumnSearchProps('task_state'),
      },
      {
        title: 'Task progress',
        align: 'center',
        width: 280,
        dataIndex: 'task_progress',
        key: 'task_progress',
        render: (name, obj)  => (
          <React.Fragment>
            { obj.task_progress ?
              <Progress percent={obj.task_progress} />
            :
              <React.Fragment>
              { obj.task_state === 'success' ?
                <Progress percent={100} />
              :
                null
              }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Task message',
        align: 'center',
        width: 200,
        dataIndex: 'task_message',
        key: 'task_message',
        ...this.getColumnSearchProps('task_message'),
      },
      {
        title: 'Second stage',
        align: 'center',
        width: 200,
        dataIndex: 'second_stage_state',
        key: 'second_stage_state',
        ...this.getColumnSearchProps('second_stage_state'),
      },
      {
        title: 'Commands Executions',
        align: 'center',
        width: 400,
        dataIndex: 'commandsExecutions',
        key: 'commandsExecutions',
        render: (name, obj)  => (
          <React.Fragment>
            <Table
              columns={execCommands}
              dataSource={obj.commandsExecutions}
              bordered
              rowKey={randomKey}
              scroll={{y: '30vh'}}
              pagination={false}
              style={{maxWidth: 'none', marginLeft: '-50px', minHeight: '30vh'}}
            />
          </React.Fragment>
        )
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
          <Space direction="vertical" style={{padding: 15, marginBottom: 10}}>

            <Button onClick={() => this.refreshHistorys()}><ReloadOutlined/></Button>
            <br/>
            <Table
              columns={returnCol()}
              dataSource={this.props.historys}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
          </Space>
        }
        { this.props.historysError ? <Error vendor={this.props.vendor} error={[this.props.historysError]} visible={true} type={'historyError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  historys: state.concerto.historys,
  historysError: state.concerto.historysError,
  taskProgressLoading: state.concerto.taskProgressLoading,
  secondStageProgressLoading: state.concerto.secondStageProgressLoading,
}))(Manager);
