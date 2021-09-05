import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'

import Modify from './modify'
import Delete from './delete'

import { Table, Input, Button, Space, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


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

  resetError = () => {
    this.setState({ error: null})
  }


  render() {

    /*
    allowNat: "yes"
​​
allowSnat: "yes"
​​
fullPath: "/Common/GPino_vs_pool"
​​
generation: 364
​​
ignorePersistedWeight: "disabled"
​​
ipTosToClient: "pass-through"
​​
ipTosToServer: "pass-through"
​​
linkQosToClient: "pass-through"
​​
linkQosToServer: "pass-through"
​​
loadBalancingMode: "round-robin"
​​
membersReference: Object { link: "https://localhost/mgmt/tm/ltm/pool/~Common~GPino_vs_pool/members?ver=15.1.2.1", isSubcollection: true }
​​
minActiveMembers: 0
​​
minUpMembers: 0
​​
minUpMembersAction: "failover"
​​
minUpMembersChecking: "disabled"
​​
monitor: "/Common/https"
​​
name: "GPino_vs_pool"
​​
partition: "Common"
​​
queueDepthLimit: 0
​​
queueOnConnectionLimit: "disabled"
​​
queueTimeLimit: 0
​​
reselectTries: 0
​​
selfLink: "https://localhost/mgmt/tm/ltm/pool/~Common~GPino_vs_pool?ver=15.1.2.1"
​​
serviceDownAction: "none"
​​
slowRampTime: 10


    */

    const columns = [
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Monitor',
        align: 'center',
        dataIndex: 'monitor',
        key: 'monitor',
       ...this.getColumnSearchProps('monitor'),
      },
      {
        title: 'LoadBalancingMode',
        align: 'center',
        dataIndex: 'loadBalancingMode',
        key: 'loadBalancingMode',
       ...this.getColumnSearchProps('loadBalancingMode'),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.pool_delete || this.props.authorizations.any) ?
            <Delete name={name} obj={obj} />
            :
            '-'
          }
          </Space>
        ),
      }
    ];


    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Table
          columns={columns}
          dataSource={this.props.pools}
          bordered
          rowKey="name"
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  pools: state.f5.pools
}))(List);