import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'


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
 				width: 'auto',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Type',
        align: 'center',
 				width: 'auto',
        dataIndex: 'type',
        key: 'type',
       ...this.getColumnSearchProps('type'),
      },
      {
        title: 'Destination',
        align: 'center',
 				width: 'auto',
        dataIndex: 'destination',
        key: 'destination',
       ...this.getColumnSearchProps('destination'),
       },
       {
         title: 'Subnet Mask',
         align: 'center',
 				width: 'auto',
         dataIndex: 'mask',
         key: 'mask',
        ...this.getColumnSearchProps('mask'),
      },
      {
        title: 'IP Protocol',
        align: 'center',
 				width: 'auto',
        dataIndex: 'ipProtocol',
        key: 'ipProtocol',
       ...this.getColumnSearchProps('ipProtocol'),
      },
      {
        title: 'Pool',
        align: 'center',
 				width: 'auto',
        dataIndex: 'pool',
        key: 'pool',
       ...this.getColumnSearchProps('pool'),
      },
      {
        title: 'Profiles',
        align: 'center',
 				width: 'auto',
        dataIndex: 'profiles',
        key: 'profiles',
       ...this.getColumnSearchProps('profiles'),
      },
      {
        title: 'Policies',
        align: 'center',
 				width: 'auto',
        dataIndex: 'policies',
        key: 'policies',
       ...this.getColumnSearchProps('policies'),
      },
      {
        title: 'iRules',
        align: 'center',
 				width: 'auto',
        dataIndex: 'irules',
        key: 'irules',
       ...this.getColumnSearchProps('irules'),
      },
      {
        title: 'sourceAddressTranslation',
        align: 'center',
 				width: 'auto',
        dataIndex: ['sourceAddressTranslation', 'type'],
        key: 'sourceAddressTranslation',
       //...this.getColumnSearchProps(['sourceAddressTranslation', 'type']),
      },
    ];


    return (
      <React.Fragment>
        <Table
          columns={columns}
          dataSource={this.props.virtualServers}
          scroll={{ x: 'auto', y: 'auto'}}
          bordered
          rowKey="name"
          //pagination={false}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  error: state.error.error,

  virtualServers: state.f5.virtualServers,

}))(List);
