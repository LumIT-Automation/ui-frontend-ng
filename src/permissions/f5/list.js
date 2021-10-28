import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest";

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
        title: 'Partitions',
        align: 'center',
        dataIndex: ['partition', 'name' ],
        key: 'partition',
        ...this.getColumnSearchProps(['partition', 'name' ]),
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

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        <br/>
        <Table
          columns={columns}
          dataSource={this.props.permissions}
          bordered
          rowKey={randomKey}
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
  assets: state.f5.assets,
  authorizations: state.authorizations.f5,
  permissions: state.f5.permissions
}))(List);
