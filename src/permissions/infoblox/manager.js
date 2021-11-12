import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from '../../_helpers/Rest'

import {
  setPermissionsLoading,
  setPermissions,
  setPermissionsFetch,
  setPermissionsError,
  setAssets,
  setAssetsError,
  setIdentityGroups,
  setIdentityGroupsError,
} from '../../_store/store.infoblox'

import List from './list'
import Add from './add'

import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.assetsError && !this.props.identityGroupsError && !this.props.permissionsError) {
      if (!this.props.permissions) {
        this.main()
        this.props.dispatch(setPermissionsFetch(false))
      }
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
  }


  main = async () => {
    this.props.dispatch(setPermissionsLoading(true))

    let assets = await this.fetchAssets()
    if (assets.status && assets.status !== 200 ) {
      this.props.dispatch(setAssetsError(assets))
      this.props.dispatch(setPermissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(setAssets( assets ))
    }

    let identityGroups = await this.fetchIdentityGroups()
    if (identityGroups.status && identityGroups.status !== 200 ) {
      this.props.dispatch(setIdentityGroupsError(identityGroups))
      this.props.dispatch(setPermissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(setIdentityGroups( identityGroups ))
    }

    let permissions = await this.fetchPermissions()
    if (permissions.status && permissions.status !== 200 ) {
      this.props.dispatch(setPermissionsError(permissions))
      this.props.dispatch(setPermissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(setPermissions(permissions))
    }

    if ((assets.status && assets.status !== 200 ) ||
        (identityGroups.status && identityGroups.status !== 200 ) ||
        (permissions.status && permissions.status !== 200 ) ) {
      this.props.dispatch(setPermissionsLoading(false))
      return
    }
    else {
      let permissionsWithAssets = await this.addAssetDetails(assets, permissions)
      this.props.dispatch(setPermissions( permissionsWithAssets ))
      this.props.dispatch(setPermissionsLoading(false))
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
        console.log('fetchAssets error')
        r = error
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
    return r
  }


  fetchIdentityGroups = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        console.log('fetchIdentityGroups error')
        r = error
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
        console.log('fetchPermissions error')
        r = error
      }
    )
    await rest.doXHR("infoblox/permissions/", this.props.token)
    return r
  }


  addAssetDetails = async (assets, permissions) => {

    //assets and permissions are immutable, so I stringyfy and parse in order to edit them
    let newPermissions = JSON.parse(JSON.stringify(permissions.data.items))
    let assetsObject = JSON.parse(JSON.stringify(assets.data.items))
    let list = []


    for (const [key, value] of Object.entries(assetsObject)) {
      list.push(value)
    }

    for (const [key, value] of Object.entries(newPermissions)) {
      const asset = list.find(a => a.id === value.network.asset_id)
      value.asset = asset
    }

    let permissionsWithAsset = Object.assign([], newPermissions)

    return permissionsWithAsset
  }



  render() {
    console.log('manager infoblox')
    console.log(this.props)
    return (
      <React.Fragment>
        <br/>
        { this.props.authorizations && (this.props.authorizations.permission_identityGroups_post || this.props.authorizations.any) ?
          <React.Fragment>
            <Add/>
            <br/>
            <br/>
          </React.Fragment>
          :
          null
        }

        <List/>

        { this.props.assetsError ? <Error error={[this.props.assetsError]} visible={true} type={'setInfobloxAssetsError'} /> : null }
        { this.props.identityGroupsError ? <Error error={[this.props.identityGroupsError]} visible={true} type={'setInfobloxIdentityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error error={[this.props.permissionsError]} visible={true} type={'setInfobloxPermissionsError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.infoblox,

  assetsError: state.infoblox.assetsError,
  identityGroupsError: state.infoblox.identityGroupsError,
  permissionsError: state.infoblox.permissionsError,

  assets: state.infoblox.assets,
  identityGroups: state.infoblox.identityGroups,
  permissions: state.infoblox.permissions,

  permissionsFetch: state.infoblox.permissionsFetch,
}))(Manager);
