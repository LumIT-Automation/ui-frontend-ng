import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import RolesDescription from './rolesDescription'
import Modify from './modify'
import Delete from './delete'

import { Table, Input, Button, Space, Spin, Form } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';



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
    this.addAssetDetails()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  addAssetDetails = () => {

    let permissions = Object.assign({}, this.props.permissions)
    let assets = Object.assign({}, this.props.assets)

    permissions = JSON.parse(JSON.stringify(permissions))
    assets = JSON.parse(JSON.stringify(assets))
    assets = Object.assign([], assets)

    for (const [key, value] of Object.entries(permissions)) {
      const asset = assets.find(a => a.id === value.network.asset_id)
      value.asset = asset
    }
    permissions = Object.assign([], permissions)
    this.setState({permissions: permissions})
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

    const columns = [
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
        ...this.getColumnSearchProps('identity_group_name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
        ...this.getColumnSearchProps('identity_group_identifier'),
      },
      {
        title: 'Asset',
        align: 'center',
        dataIndex: ['asset', 'fqdn' ],
        key: 'fqdn',
        ...this.getColumnSearchProps(['asset', 'fqdn' ]),
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: ['asset', 'address' ],
        key: 'address',
        ...this.getColumnSearchProps(['asset', 'address' ]),
      },
      {
        title: 'Network',
        align: 'center',
        dataIndex: ['network', 'name' ],
        key: 'network',
        ...this.getColumnSearchProps(['network', 'name' ]),
      },
      {
        title: <RolesDescription/>,
        align: 'center',
        dataIndex: 'role',
        key: 'role',
        ...this.getColumnSearchProps('role'),

      },
      {
        title: 'Modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        render: (name, obj)  => (
          <Space size="small">
           { this.props.authorizations && (this.props.authorizations.permission_identityGroup_patch || this.props.authorizations.any) ?
            <Modify name={name} obj={obj} />
            :
            '-'
          }
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
           { this.props.authorizations && (this.props.authorizations.permission_identityGroup_delete || this.props.authorizations.any) ?
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

        <br/>
        <Table
          columns={columns}
          dataSource={this.state.permissions}
          bordered
          rowKey="permissionId"
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  assets: state.infoblox.assets,
  authorizations: state.authorizations.infoblox,
  permissions: state.infoblox.permissions
}))(List);
