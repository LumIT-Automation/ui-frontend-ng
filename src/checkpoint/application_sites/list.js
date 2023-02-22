import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Modify from './modify'
import Delete from './delete'

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
          <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        }
        else if ( Array.isArray(dataIndex) ) {
          let r = record[dataIndex[0]]
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase())
        }
        else {
          return ''
        }
      }
      catch (error){

      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text => {
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  render() {
    const columns = [
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Domain',
        align: 'center',
        width: 'auto',
        dataIndex: ['domain', 'name'],
        key: 'domain',
        ...this.getColumnSearchProps(['domain', 'name']),
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
      },
      {
        title: 'Primary-category',
        align: 'center',
        dataIndex: 'primary-category',
        key: 'primary-category',
        ...this.getColumnSearchProps('primary-category'),
      },
      {
        title: 'Risk',
        align: 'center',
        dataIndex: 'risk',
        key: 'risk',
        ...this.getColumnSearchProps('risk'),
      },
      {
        title: 'Comments',
        align: 'center',
        width: 'auto',
        dataIndex: 'comments',
        key: 'comments',
        ...this.getColumnSearchProps('comments'),
      },
      {
        title: 'Description',
        align: 'center',
        dataIndex: 'description',
        key: 'description',
        ...this.getColumnSearchProps('description'),
      },
      {
        title: 'User-defined',
        align: 'center',
        width: 'auto',
        dataIndex: 'user-defined',
        key: 'user-defined',
        ...this.getColumnSearchProps('user-defined'),
      },
      {
        title: 'Creation-time',
        align: 'center',
        width: 'auto',
        dataIndex: ['meta-info', 'creation-time', 'iso-8601'],
        key: 'creation-time',
      },
      {
        title: 'Creator',
        align: 'center',
        width: 'auto',
        dataIndex: ['meta-info', 'creator'],
        key: 'creator',
        ...this.getColumnSearchProps(['meta-info', 'creator']),
      },
      {
        title: 'Last-modifier',
        align: 'center',
        dataIndex: ['meta-info', 'last-modifier'],
        key: 'last-modifier',
        ...this.getColumnSearchProps(['meta-info', 'last-modifier']),
      },
      {
        title: 'Last-modify-time',
        align: 'center',
        width: 'auto',
        dataIndex: ['meta-info', 'last-modify-time', 'iso-8601'],
        key: 'last-modify-time'
      },
      {
        title: 'Lock',
        align: 'center',
        width: 'auto',
        dataIndex: ['meta-info', 'lock'],
        key: 'lock',
        ...this.getColumnSearchProps(['meta-info', 'lock']),
      },
      {
        title: 'Url-list',
        align: 'center',
        dataIndex: 'url-list',
        key: 'url-list',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.application_site_modify || this.props.authorizations.any) ?
            <Modify name={name} obj={obj} />
            :
            '-'
          }
          </Space>
        ),
      },
      {
        title: 'Validation-state',
        align: 'center',
        width: 'auto',
        dataIndex: ['meta-info', 'validation-state'],
        key: 'validation-state',
        ...this.getColumnSearchProps(['meta-info', 'validation-state']),
      },
      {
        title: 'Read-only',
        align: 'center',
        width: 'auto',
        dataIndex: 'read-only',
        key: 'read-only',
        ...this.getColumnSearchProps('read-only'),
      },
      {
        title: 'Tags',
        align: 'center',
        width: 'auto',
        dataIndex: 'tags',
        key: 'tags',
        ...this.getColumnSearchProps('tags'),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.application_site_delete || this.props.authorizations.any) ?
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
          dataSource={this.props.application_sites}
          bordered
          rowKey="name"
          scroll={{x: 'auto'}}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
      </Space>

    )
  }
}

export default connect((state) => ({
  authorizations: state.authorizations.checkpoint,
  application_sites: state.checkpoint.application_sites,
}))(List);
