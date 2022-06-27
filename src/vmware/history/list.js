import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Table, Input, Button, Space, Progress, Spin } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
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
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
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
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };



  render() {

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

    const columns = [
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
              style={{maxWidth: 'none', marginLeft: '-50px'}}
            />
          </React.Fragment>
        )
      },
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.historys}
        bordered
        rowKey={randomKey}
        scroll={{x: 'auto'}}
        pagination={{ pageSize: 10 }}
        style={{marginBottom: 10}}
      />
    )
  }
}

export default connect((state) => ({
  historys: state.vmware.historys,
  taskProgressLoading: state.vmware.taskProgressLoading,
  secondStageProgressLoading: state.vmware.secondStageProgressLoading,
}))(List);
