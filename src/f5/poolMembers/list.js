import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";

import { poolMembersLoading, poolMembersFetch } from '../../_store/store.f5'

import Delete from './delete'

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';





class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      poolMembers: null,
      renderedMembers: null,
      error: null
    };
  }

  componentDidMount() {
    if (this.props.obj && (this.state.poolMembers === null)) {

      this.fetchPoolMembers(this.props.obj.name)
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.poolMembersFetch  === true) {
      this.props.dispatch(poolMembersLoading(true))
      this.fetchPoolMembers(this.props.obj.name)
      this.props.dispatch(poolMembersFetch(false))
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

  fetchPoolMembers = async (name) => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(poolMembersLoading(false))
        this.setState({error: false, poolMembers: resp.data.items}, () => this.setRenderedMembers())
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(poolMembersLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${name}/members/`, this.props.token)
  }


  setRenderedMembers = () => {

    const current = Object.assign([], this.state.poolMembers);

    const newCurrent = current.map( m => {
      let n
      if (m.state === 'up' && m.session === 'monitor-enabled') {
        n = Object.assign(m, {status: 'enabled', color: '#90ee90'})
      }
      else if (m.state === 'up' && m.session === 'user-disabled') {
        n = Object.assign(m, {status: 'disabled', color: 'black'})
      }
      else if (m.state === 'checking' && m.session === 'user-disabled') {
        n = Object.assign(m, {status: 'checking', color: 'blue'})
      }
      else if (m.state === 'down' && m.session === 'monitor-enabled') {
        n = Object.assign(m, {status: 'checking', color: 'red'})
      }
      else if (m.state === 'down' && m.session === 'user-enabled') {
        n = Object.assign(m, {status: 'rechecking', color: 'blue'})
      }
      else if (m.state === 'user-down' && m.session === 'user-disabled') {
        n = Object.assign(m, {status: 'Force offline', color: 'black'})
      }
      else {
        n = Object.assign(m, {status: 'other', color: 'grey' })
      }
      return n
    })
    this.setState({renderedMembers: newCurrent})
  }


  poolMemberEnable = async (member) => {
    const b = { "data": { "state": "user-up", "session":"user-enabled" } }
    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, error: false, response: true}, () => this.fetchPoolMembers(this.props.obj.name) )
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(poolMembersLoading(false)))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b)
  }

  poolMemberDisable = async (member) => {
    const b = {"data":{"state":"user-up", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, error: false, response: true}, () => this.fetchPoolMembers(this.props.obj.name) )
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(poolMembersLoading(false)))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b )
  }

  poolMemberForceOffline = async (member) => {
    const b = {"data":{"state":"user-down", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, error: false, response: true}, () => this.fetchPoolMembers(this.props.obj.name) )
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(poolMembersLoading(false)))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b )
  }



  render() {

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
            <Button type="primary" onClick={() => this.poolMemberEnable(obj)}>
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
            <Button type="primary" onClick={() => this.poolMemberDisable(obj)}>
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
            <Button type="primary" onClick={() => this.poolMemberForceOffline(obj)}>
              Force Offline
            </Button>
          </Space>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.poolMember_delete || this.props.authorizations.any) ?
            <Delete name={name} obj={obj} poolName={this.props.obj.name} />
            :
            '-'
          }
          </Space>
        ),
      }
    ];

    return (
      <Space>
          <Table
            dataSource={this.state.renderedMembers}
            columns={columns}
            pagination={false}
            rowKey="name"
            scroll={{x: 'auto'}}
            style={{marginLeft: '200px'}}
            //rowClassName={(record, index) => (record.isMonitored ? "red" : "green")}
          />
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  poolMembers: state.f5.poolMembers
}))(List);
