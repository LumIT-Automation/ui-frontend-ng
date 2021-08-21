import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest";
import { setIdentityGroups, setIgIdentifiers } from '../../_store/store.authorizations'
import { setF5Permissions, setF5PermissionsBeauty } from '../../_store/store.permissions'
import { setAssetList, cleanUp } from '../../_store/store.f5'

import { Table, Input, Button, Space, Spin, Form } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';


import List from './list'
import Add from './add'
import AddGroup from './addGroup'


const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


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
    this.fetchIdentityGroups()
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

  fetchIdentityGroups = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setIdentityGroups( resp ))
        this.props.dispatch(setIgIdentifiers(resp))
        this.fetchAssets()
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/identity-groups/", this.props.token)
  }

  fetchAssets = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setAssetList( resp ))
        this.fetchPermissions()
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchPermissions = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Permissions(resp))
        this.permissionsInRows()
        },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/permissions/`, this.props.token)
  }

  permissionsInRows = () => {

    let permissions = Object.assign([], this.props.f5Permissions)
    let superAdmins = Object.assign([], this.props.superAdmins)

    let list = []

    for ( let p in permissions) {
      let dn = permissions[p].identity_group_identifier

      if (superAdmins.find(s => s.dn === dn) ) {
        continue
      }
      let asset = this.props.assetList.find(a => a.id === permissions[p].partition.asset_id)
      let permissionId = permissions[p].id
      let name = permissions[p].identity_group_name
      let role = permissions[p].role
      let assetId = permissions[p].partition.asset_id
      let partition = permissions[p].partition.name
      let fqdn = asset.fqdn
      let address = asset.address

      list.push({
        permissionId: permissionId,
        name: name,
        dn: dn,
        role: role,
        assetId: assetId,
        partition: partition,
        fqdn: fqdn,
        address: address
      })
    }
    this.props.dispatch(setF5PermissionsBeauty(list))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

      { this.props.authorizations && (this.props.authorizations.permission_identityGroups_post || this.props.authorizations.any) ?
        <div>
          <br/>
          <Add/>
          <AddGroup />
        </div>
        : null }

        {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <List list={this.props.f5PermissionsBeauty}/> }

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  assetList: state.f5.assetList,
  authorizations: state.authorizations.f5,
  identityGroups: state.authorizations.identityGroups,
  igIdentifiers: state.authorizations.igIdentifiers,
  f5Permissions: state.permissions.f5Permissions,
  f5PermissionsBeauty: state.permissions.f5PermissionsBeauty,
  superAdmins: state.permissions.superAdminsPermissionsBeauty
}))(PermissionsTab);
