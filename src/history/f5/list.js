import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



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
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              this.setState({
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
              });
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
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
    const columns = [
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
  historys: state.f5.historys,
}))(List);
