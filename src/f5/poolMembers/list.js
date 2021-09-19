import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'


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


  enableMember = async (member) => {
    const body = { "data": { "state": "user-up", "session":"user-enabled" } }
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        console.error(error)
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body)
  }

  disableMember = async (member) => {
    const body = {"data":{"state":"user-up", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        console.error(error)
        this.setState({error: error})
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body )
  }

  forceOfflineMember = async (member) => {
    const body = {"data":{"state":"user-down", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        console.error(error)
        this.setState({error: error})
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body )
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    console.log('members list')
    console.log(this.props.obj)

    const columns = [
      {
        title: 'Member',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: 'State',
        align: 'center',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: 'Session',
        align: 'center',
        dataIndex: 'session',
        key: 'session',
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render(name, record) {
          return {
            props: {
              style: { margin: 0, alignItems: 'center', justifyContent: 'center' }
            },
            children: <div title={record.status} style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: record.color, margin: '0 auto', padding: 0}}></div>
          };
        }
      },
      {
        title: 'Enable',
        align: 'center',
        dataIndex: 'enable',
        key: 'enable',
        render: (name, obj)  => (
          <Space size="small">
            <Button type="primary" onClick={() => this.enableMember(obj)}>
              Enable
            </Button>
          </Space>
        ),
      },
      {
        title: 'Disable',
        align: 'center',
        dataIndex: 'disable',
        key: 'disable',
        render: (name, obj)  => (
          <Space size="small">
            <Button type="primary" onClick={() => this.disableMember(obj)}>
              Disable
            </Button>
          </Space>
        ),
      },
      {
        title: 'Force Offline',
        align: 'center',
        dataIndex: 'foff',
        key: 'foff',
        render: (name, obj)  => (
          <Space size="small">
            <Button type="primary" onClick={() => this.forceOfflineMember(obj)}>
              Force Offline
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Space>
          <Table
            dataSource={this.props.poolMembers}
            columns={columns}
            pagination={false}
            rowKey="name"
            style={{marginLeft: '200px'}}
            //rowClassName={(record, index) => (record.isMonitored ? "red" : "green")}
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
  poolMembers: state.f5.poolMembers
}))(List);
