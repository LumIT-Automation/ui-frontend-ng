import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Error from '../error'
import Rest from '../../_helpers/Rest'

import {
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  assets,
  assetsError,
  identityGroups,
  identityGroupsError,
} from '../store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.assetsError && !this.props.identityGroupsError && !this.props.permissionsError) {
      this.props.dispatch(permissionsFetch(false))
      if (!this.props.permissions) {
        this.main()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.permissionsFetch) {
      this.main()
      this.props.dispatch(permissionsFetch(false))
    }
  }

  componentWillUnmount() {
  }


  main = async () => {
    this.props.dispatch(permissionsLoading(true))

    let fetchedAssets = await this.assetsGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(assets( fetchedAssets ))
    }

    let fetchedIdentityGroups = await this.identityGroupsGet()
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(identityGroups( fetchedIdentityGroups ))
    }

    let fetchedPermissions = await this.permissionsGet()
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      this.props.dispatch(permissionsError(fetchedPermissions))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(permissions(fetchedPermissions))
    }

    if ((fetchedAssets.status && fetchedAssets.status !== 200 ) ||
        (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) ||
        (fetchedPermissions.status && fetchedPermissions.status !== 200 ) ) {
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      let permissionsWithAssets = await this.assetAddDetails(fetchedAssets, fetchedPermissions)
      this.props.dispatch(permissions( permissionsWithAssets ))
      this.props.dispatch(permissionsLoading(false))
    }
  }


  assetsGet = async () => {
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
    await rest.doXHR("infoblox/assets/", this.props.token)
    return r
  }


  identityGroupsGet = async () => {
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
    await rest.doXHR("infoblox/identity-groups/", this.props.token)
    return r
  }

  permissionsGet = async () => {
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
    await rest.doXHR("infoblox/permissions/", this.props.token)
    return r
  }


  assetAddDetails = async (assets, permissions) => {

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

    let permissionsWithAsset =JSON.parse(JSON.stringify(newPermissions))

    return permissionsWithAsset
  }



  render() {


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

        { this.props.assetsError ? <Error component={'manager infoblox'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.identityGroupsError ? <Error component={'manager infoblox'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error component={'manager infoblox'} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,

  assetsError: state.infoblox.assetsError,
  identityGroupsError: state.infoblox.identityGroupsError,
  permissionsError: state.infoblox.permissionsError,

  assets: state.infoblox.assets,
  identityGroups: state.infoblox.identityGroups,
  permissions: state.infoblox.permissions,

  permissionsFetch: state.infoblox.permissionsFetch,
}))(Manager);
