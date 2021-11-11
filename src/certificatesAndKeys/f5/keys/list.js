import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../../error'

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
        title: 'NAME',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'KEYSIZE',
        align: 'center',
        dataIndex: 'keySize',
        key: 'keySize',
        ...this.getColumnSearchProps('keySize'),
      },
      {
        title: 'KEYTYPE',
        align: 'center',
        dataIndex: 'keyType',
        key: 'keyType',
       ...this.getColumnSearchProps('keyType'),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.key_delete || this.props.authorizations.any) ?
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
          <React.Fragment>
            <Table
              columns={columns}
              dataSource={this.props.keys}
              bordered
              rowKey="name"
              scroll={{x: 'auto'}}
              //pagination={false}
              pagination={{ pageSize: 10 }}
              style={{marginBottom: 10}}
            />
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  keys: state.f5.keys,
  authorizations: state.authorizations.f5,
}))(List);
