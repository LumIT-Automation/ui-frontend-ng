import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import { Table, Input, Button, Space } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

import RolesDescription from './rolesDescription'
import Modify from './modify'
import Delete from './delete'



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
          ref={application_site => {
            this.searchInput = application_site;
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
      if (JSON.stringify(this.state.searchedColumn) === JSON.stringify(dataIndex)) {
        if (Array.isArray(text)) {
          text = text.map(r => {
            return (
            <React.Fragment key={Math.random()}>
              <Highlighter
                 highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                 searchWords={[this.state.searchText]}
                 autoEscape
                 textToHighlight={r.toString()}
               />
               <br/>
            </React.Fragment>)
           })
          return text
        }
        else {
          return <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        }
      }
      else {
        if (Array.isArray(text)) {
          text = text.map(r => {
             return <React.Fragment key={Math.random()}>{r} <br/></React.Fragment>
           })
          return text
        }
        else {
          return text.toString()
        }
      }
    }
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
        title: 'Workflow name',
        align: 'center',
        dataIndex: ['workflow', 'name' ],
        key: 'name',
        ...this.getColumnSearchProps(['workflow', 'name' ]),
      },
      {
        title: 'Description',
        align: 'center',
        dataIndex: ['workflow', 'description' ],
        key: 'description',
        ...this.getColumnSearchProps(['workflow', 'description' ]),
      },
      {
        title: 'Assets',
        align: 'center',
        dataIndex: ['details', 'checkpoint', 'allowed_asset_ids' ],
        key: 'allowed_asset_ids',
        ...this.getColumnSearchProps(['details', 'checkpoint', 'allowed_asset_ids' ]),
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
        <Table
          columns={columns}
          dataSource={this.props.permissions}
          bordered
          rowKey={randomKey}
          scroll={{x: 'auto'}}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
    )
  }
}

export default connect((state) => ({
  permissions: state.workflow.permissions,
  authorizations: state.authorizations.workflow
}))(List);