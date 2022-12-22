import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Table, Input, Button, Space, Spin } from 'antd'
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      network: false,
      ipLoading: false,
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


  render() {

    const columns = [
      {
        title: 'ip_address',
        align: 'center',
        dataIndex: 'ip_address',
        key: 'ip_address',
        ...this.getColumnSearchProps('ip_address'),
      },
      {
        title: 'mac_address',
        align: 'center',
        dataIndex: 'mac_address',
        key: 'mac_address',
        ...this.getColumnSearchProps('mac_address'),
      },
      {
        title: 'status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        ...this.getColumnSearchProps('status'),
      },
      {
        title: 'Request',
        align: 'center',
        dataIndex: 'request',
        key: 'request',
        ...this.getColumnSearchProps('request'),
      },
      {
        title: 'modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        /*render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.ipv4_patch || this.props.authorizations.any) ?
              <Modify name={name} obj={obj} />
            :
              '-'
            }
          </Space>
        ),*/
      },
      {
        title: 'release',
        align: 'center',
        dataIndex: 'release',
        key: 'release',
        /*render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.ipv4_delete || this.props.authorizations.any) ?
              <Delete name={name} obj={obj} />
            :
              '-'
            }
          </Space>
        ),*/
      },
    ];

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        { this.props.ipLoading ?
          <Spin indicator={spinIcon} style={{margin: '50% 45%'}}/>
        :
          <Table
            columns={columns}
            dataSource={this.props.ipv4Info}
            bordered
            rowKey="ip_address"
            scroll={{x: 'auto'}}
            //pagination={false}
            pagination={{ pageSize: 50 }}
            style={{marginBottom: 50}}
          />
        }
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,
}))(List);
