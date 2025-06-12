import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
//import 'antd/dist/reset.css'

import { Table, Input, Button, Space, Spin } from 'antd'
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


function List(props) {

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);
  let [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: 'ip_address',
      align: 'center',
      dataIndex: 'ip_address',
      key: 'ip_address',
      ...getColumnSearchProps(
        'ip_address', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'mac_address',
      align: 'center',
      dataIndex: 'mac_address',
      key: 'mac_address',
      ...getColumnSearchProps(
        'mac_address', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'status',
      align: 'center',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps(
        'status', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Request',
      align: 'center',
      dataIndex: 'request',
      key: 'request',
      ...getColumnSearchProps(
        'request', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'modify',
      align: 'center',
      dataIndex: 'modify',
      key: 'modify',
    },
    {
      title: 'release',
      align: 'center',
      dataIndex: 'release',
      key: 'release',
    },
  ];

  return (
    <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
      { props.ipLoading ?
        <Spin indicator={spinIcon} style={{margin: '50% 45%'}}/>
      :
        <Table
          columns={columns}
          dataSource={props.ipv4Info}
          bordered
          rowKey="ip_address"
          scroll={{x: 'auto'}}
          //pagination={false}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'], 
            onShowSizeChange: (current, size) => setPageSize(size), 
          }}
          style={{marginBottom: 50}}
        />
      }
    </Space>

  )
}

export default connect((state) => ({
  token: state.authentication.token,
}))(List);
