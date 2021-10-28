import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest"

import { setError } from '../../_store/store.error'
import {
  setAssets,
  setAssetsLoading,
  setAssetsFetch,
  setIdentityGroups,
  setIdentityGroupsLoading,
  setIdentityGroupsFetch,
  setPermissions,
  setPermissionsLoading,
  setPermissionsFetch,
} from '../../_store/store.infoblox'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (!this.props.permissions) {
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.permissionsFetch) {
      this.main()
      this.props.dispatch(setPermissionsFetch(false))
    }
  }

  componentWillUnmount() {
    console.log('unmmount')
  }

  main = async () => {
    this.props.dispatch(setPermissionsLoading(true))
    let permissions

    try {
      let assets = await this.fetchAssets()
      this.props.dispatch(setAssets( assets ))
    }
    catch (resp){
      this.props.dispatch(setPermissionsLoading(false))
      return
    }

    try {
      let identityGroups = await this.fetchIdentityGroups()
      this.props.dispatch(setIdentityGroups( identityGroups ))
    }
    catch (resp){
      this.props.dispatch(setPermissionsLoading(false))
      this.componentWillUnmount()
    }

    try {
      permissions = await this.fetchPermissions()
      if (permissions.status === 200) {
        this.props.dispatch(setPermissions( permissions ))
        this.addAssetDetails(permissions)
        this.props.dispatch(setPermissionsLoading(false))
      }
      else {
        let error = new Error('KO');
        throw error;
      }
    }
    catch (err){
      console.log(permissions)
      this.props.dispatch(setError(permissions))
      this.props.dispatch(setPermissionsLoading(false))
      this.componentWillUnmount()
    }
  }

  fetchAssets = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
    return r
  }

  fetchIdentityGroups  = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR("infoblox/identity-groups/", this.props.token)
    return r
  }

  fetchPermissions = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/permissionss/`, this.props.token)
    return r
  }



  addAssetDetails = async (perm) => {
    let permissions = Object.assign({}, perm.data.items)
    let assets = Object.assign({}, this.props.assets)

    permissions = JSON.parse(JSON.stringify(permissions))
    assets = JSON.parse(JSON.stringify(assets))
    assets = Object.assign([], assets)

    for (const [key, value] of Object.entries(permissions)) {
      const asset = assets.find(a => a.id === value.network.asset_id)
      value.asset = asset
    }
    permissions = Object.assign([], permissions)

    this.props.dispatch(setPermissions(permissions))
    return
  }



  render() {
    return (
      <React.Fragment>
      { this.props.error ?
        <Error error={[this.props.error]} visible={true} />
        :
        <React.Fragment>
          <br/>
          {this.props.permissionsLoading ?
            <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
            :
            <React.Fragment>
              { this.props.authorizations && (this.props.authorizations.permission_identityGroups_post || this.props.authorizations.any) ?
                <Add/>
                :
                null
              }
              <List/>
            </React.Fragment>
          }
          :
          <Error visible={false} />}
        </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
  permissions: state.infoblox.permissions,
  permissionsFetch: state.infoblox.permissionsFetch,
  permissionsLoading: state.infoblox.permissionsLoading,
}))(Manager);
