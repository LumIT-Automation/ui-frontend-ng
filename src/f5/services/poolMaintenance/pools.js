import React, { useState, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import { getColumnSearchProps, handleSearch, handleReset } from '../../../_helpers/tableUtils';

import { Table, Space } from 'antd'

import PoolMembers from '../../poolMembers/manager'


function Pools(props) {

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  const columns = [
    {
      title: 'Name',
      align: 'left',
      dataIndex: 'name',
      width: 300,
      key: 'name',
      ...getColumnSearchProps(
        'name', 
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
      title: 'Monitor',
      align: 'center',
      dataIndex: 'monitor',
      width: 300,
      key: 'monitor',
      ...getColumnSearchProps(
        'monitor', 
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
      title: 'Partition',
      align: 'center',
      dataIndex: 'partition',
      key: 'partition',
      ...getColumnSearchProps(
        'partition', 
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
        dataSource={props.pools}
        bordered
        rowKey="name"
        scroll={{x: 'auto'}}
        pagination={{ pageSize: 10 }}
        style={{paddig: '200%', marginBottom: 10}}
      />
  )
  
}


export default connect((state) => ({
  token: state.authentication.token,

  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,
  pools: state.f5.pools
}))(Pools);
