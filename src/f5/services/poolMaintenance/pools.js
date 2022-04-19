import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Table, Input, Button, Space } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

import PoolMembers from '../../poolMembers/manager'



class Pools extends React.Component {

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
        title: 'Name',
        align: 'left',
        dataIndex: 'name',
        width: 300,
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Monitor',
        align: 'center',
        dataIndex: 'monitor',
        width: 300,
        key: 'monitor',
        ...this.getColumnSearchProps('monitor'),
      },
      {
        title: 'Partition',
        align: 'center',
        dataIndex: 'partition',
        key: 'partition',
       ...this.getColumnSearchProps('partition'),
      },
      {
        title: 'Details',
        align: 'center',
        dataIndex: 'details',
        width: 300,
        key: 'details',
        render: (name, record)  => (
          <Space size="small">
            {<PoolMembers name={name} obj={record} />}
          </Space>
        ),
      },
    ];

    return (
        <Table
          columns={columns}
          dataSource={this.props.pools}
          bordered
          rowKey="name"
          scroll={{x: 'auto'}}
          pagination={{ pageSize: 10 }}
          style={{paddig: '200%', marginBottom: 10}}
        />
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,
  pools: state.f5.pools
}))(Pools);
