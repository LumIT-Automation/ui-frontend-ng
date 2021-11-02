import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'

import Delete from './delete'
import Modify from './modify'

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



/*

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

    const columns = [
      {
        title: 'FQDN',
        align: 'center',
        dataIndex: 'fqdn',
        key: 'fqdn',
        ...this.getColumnSearchProps('fqdn'),
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...this.getColumnSearchProps('address'),
      },
      {
        title: 'Environment',
        align: 'center',
        dataIndex: 'environment',
        key: 'environment',
        ...this.getColumnSearchProps('environment'),
      },
      {
        title: 'Datacenter',
        align: 'center',
        dataIndex: 'datacenter',
        key: 'datacenter',
       ...this.getColumnSearchProps('datacenter'),
      },
      {
        title: 'Position',
        align: 'center',
        dataIndex: 'position',
        key: 'position',
        ...this.getColumnSearchProps('position'),
      },
      {
        title: 'Modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        render: (name, obj)  => (
          <Space size="small">
           { this.props.infobloxAuth && (this.props.infobloxAuth.asset_patch || this.props.infobloxAuth.any) ?
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
            { this.props.infobloxAuth && (this.props.infobloxAuth.asset_delete || this.props.infobloxAuth.any) ?
            <Delete name={name} obj={obj} />
            :
            '-'
          }
          </Space>
        ),
      }
    ];


    return (
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} visible={true} />
        :
          <Table
            columns={columns}
            dataSource={this.props.assets}
            bordered
            rowKey="id"
            scroll= {{x: 350}}
            //pagination={false}
            pagination={{ pageSize: 10 }}
            style={{marginBottom: 10}}
          />
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  assets: state.infoblox.assets,
  error: state.error.error,
  infobloxAuth: state.authorizations.infoblox
}))(List);
