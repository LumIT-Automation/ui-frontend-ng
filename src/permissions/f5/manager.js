import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest";

import { setError } from '../../_store/store.error'
import { setIdentityGroups, setIgIdentifiers } from '../../_store/store.authorizations'
import { setF5Permissions, setF5PermissionsBeauty } from '../../_store/store.permissions'
import { setAssets, cleanUp } from '../../_store/store.f5'

import List from './list'
import Add from './add'
import AddGroup from './addGroup'

import { Table, Input, Button, Space, Spin, Form } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';


const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


/*

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
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
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
        this.props.dispatch(setAssets( resp ))
        this.fetchPermissions()
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  fetchPermissions = async () => {
    console.log('permissions')
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.setState({loading: false})
        this.props.dispatch(setF5Permissions(resp))
        this.permissionsInRows()
        },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
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
      let asset = this.props.assets.find(a => a.id === permissions[p].partition.asset_id)
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

        {this.state.loading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> : <List list={this.props.f5PermissionsBeauty}/> }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  assets: state.f5.assets,
  authorizations: state.authorizations.f5,
  identityGroups: state.authorizations.identityGroups,
  igIdentifiers: state.authorizations.igIdentifiers,
  f5Permissions: state.permissions.f5Permissions,
  f5PermissionsBeauty: state.permissions.f5PermissionsBeauty,
  superAdmins: state.permissions.superAdminsPermissionsBeauty
}))(PermissionsTab);
