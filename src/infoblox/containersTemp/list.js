import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import { DownOutlined } from '@ant-design/icons';

import Ip from '../ip'

import { Table, Input, Button, Space, Spin, Collapse, Badge, Menu, Dropdown } from 'antd';

import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

const { Panel } = Collapse




class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
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

  expandedRowRender = () => {
    const columns = [
      { title: 'Date', dataIndex: 'date', key: 'date' },

    ];

    const data = [];
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i,
        date: '2014-12-24 23:12:00',

      });
    }
    return <Table columns={columns} dataSource={data} pagination={false} scroll={{x: 'auto'}}/>;
  };


  render() {


    const expandedRowRender = () => {
    const columns = [
      { title: 'Network', dataIndex: 'network', key: 'network' },
      {
         title: 'IP',
         dataIndex: 'ip',
         key: 'ip',
         render: (name, obj)  => (
           <Space size="small">
             <Button type="primary" name='IP' />
           </Space>
         ),
       },
    ];

    const data = [];
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i,
        network: '10.20.30.40/24',
        ip: true
      });
    }
    return <Table columns={columns} dataSource={data} pagination={false} scroll={{x: 'auto'}}/>;
  };

    const containerColumns = [
      { title: 'Container', dataIndex: 'container', key: 'container' },
    ];

  const data = [];
    this.props.containers.forEach( c => {
      //
      let network = c.network
      data.push({
        key: network,
        container: network,
      })
    })
    /*
    const columns = [
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        ...this.getColumnSearchProps('network'),
      },


      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.node_delete || this.props.authorizations.any) ?
            <Delete name={name} obj={obj} />
            :
            '-'
          }
          </Space>
        ),
      }
    ];*/


    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        {/*
          <Table
          columns={columns}
          dataSource={this.props.containers}
          bordered
          rowKey="network"
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
        */}
        <Table
          columns={containerColumns}
          expandable={{ expandedRowRender }}
          dataSource={data}
          scroll={{x: 'auto'}}
        />
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.infoblox,

  containers: state.infoblox.containers
}))(List);
