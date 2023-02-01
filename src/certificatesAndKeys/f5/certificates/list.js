import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import styles from './test.css'

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
    let today = new Date().getTime();
    let thirtyDays = 2592000000
    let inThirtyDays = new Date(today + thirtyDays);
    console.log('today', today)
    console.log('thirtyDays', thirtyDays)
    console.log('inThirtyDays', inThirtyDays)
    console.log(styles.expired)

    /*
    render: (name, obj) => {
    return {
        props: {
          style: {
            background: 'red'
              //obj.apiRawValues.expiration.getTime() < inThirtyDays.getTime()
                //? "red"
                //: obj.status > (today + 30)
                //? "yellow"
                //: "white",
          },
        },
        children: <div>{obj}</div>,
      };
    },

    */

    const columns = [
      {
        title: 'NAME',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'ISSUER',
        align: 'center',
        dataIndex: ['apiRawValues','issuer'],
        key: 'issuer',
        ...this.getColumnSearchProps(['apiRawValues','issuer']),
      },
      {
        title: 'EXPIRATION',
        align: 'center',
        className: styles.expired,
        dataIndex: ['apiRawValues','expiration'],
        key: ['apiRawValues','expiration'],
        defaultSortOrder: 'descend',
        sorter: (a, b) => new Date(a.apiRawValues.expiration) - new Date(b.apiRawValues.expiration),
       ...this.getColumnSearchProps(['apiRawValues','expiration']),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.certificate_delete || this.props.authorizations.any) ?
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
      <h1 className={styles.bigblue}>Hello Car!</h1>
      <Table
        columns={columns}
        dataSource={this.props.certificates}
        bordered
        rowKey="name"
        scroll={{x: 'auto'}}
        //pagination={false}
        pagination={{ pageSize: 10 }}
        style={{marginBottom: 10}}
      />
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  certificates: state.f5.certificates,
  authorizations: state.authorizations.f5
}))(List);
