import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../ConcertoError'

import { superAdminPermissions, superAdminPermissionsError, superAdminPermissionsBeauty } from '../../_store/store.authorizations'

import { Input, Button, Space, Spin } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'

import List from './list'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class PermissionsTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    this.superAdminsGet()
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

  superAdminsGet = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(superAdminPermissions( resp ))
        this.superAdminInRows()
      },
      error => {
        this.props.dispatch(superAdminPermissionsError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("superadmins", this.props.token )
  }

  superAdminInRows = () => {
    let superAdmin = JSON.parse(JSON.stringify(this.props.superAdmin))
    let list = []

    for ( let s in superAdmin) {

      const regex = /(cn=)([\w\d]+)/gm
      let m = regex.exec(superAdmin[s]);
      try {
        list.push({'dn': superAdmin[s], 'name': m[2]})
      }
      catch {
        ;
      }

    }
    this.props.dispatch(superAdminPermissionsBeauty(list))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <List list={this.props.superAdmin}/>  }

        {this.props.superAdminPermissionsError ? <Error component={'manager superAdmin'} error={[this.props.superAdminPermissionsError]} visible={true} type={'superAdminPermissionsError'}/> : null }
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  superAdmin: state.authorizations.superAdminPermissions,
 	superAdminPermissionsError: state.authorizations.superAdminPermissionsError,
}))(PermissionsTab);
