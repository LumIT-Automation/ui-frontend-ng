import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Error from '../error'
import Rest from '../../_helpers/Rest'

import { Row, Col } from 'antd'

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
import IdentityGroupDelete from './identityGroupDelete'



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
    let fetchedAssets,
    fetchedIdentityGroups,
    fetchedPermissions,
    identityGroupsNoWorkflowLocal,
    permissionsNoWorkflowLocal,
    permissionsWithAssets

    this.props.dispatch(permissionsLoading(true))

    fetchedAssets = await this.assetsGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(assets( fetchedAssets ))
    }

    fetchedIdentityGroups = await this.identityGroupsGet()
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
      this.props.dispatch(identityGroups({data: {items: identityGroupsNoWorkflowLocal}}))
    }

    fetchedPermissions = await this.permissionsGet()
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      this.props.dispatch(permissionsError(fetchedPermissions))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      permissionsNoWorkflowLocal = fetchedPermissions.data.items.filter(r => r.identity_group_name !== 'workflow.local');
      this.props.dispatch(permissions({data: {items: permissionsNoWorkflowLocal}}))
    }

    if ((fetchedAssets.status && fetchedAssets.status !== 200 ) ||
        (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) ||
        (fetchedPermissions.status && fetchedPermissions.status !== 200 ) ) {
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      permissionsWithAssets = await this.assetWithDetails(fetchedAssets, {data: {items: permissionsNoWorkflowLocal}})
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
    await rest.doXHR("vmware/assets/", this.props.token)
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
    await rest.doXHR("vmware/identity-groups/", this.props.token)
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
    await rest.doXHR("vmware/permissions/", this.props.token)
    return r
  }

  assetWithDetails = async (assets, permissions) => {
    let newPermissions = JSON.parse(JSON.stringify(permissions.data.items))
    let assetsObject = JSON.parse(JSON.stringify(assets.data.items))

    try {
      Object.values(newPermissions).forEach((perm, i) => {
        const asset = assetsObject.find(a => a.id === perm.object.id_asset)
        perm.asset = asset
      });

      let permissionsWithAsset = JSON.parse(JSON.stringify(newPermissions))

      return permissionsWithAsset
    } catch(error) {
      console.log(error)
      return newPermissions
    }
  }


  render() {
    return (
      <React.Fragment>
        <br/>
        <Row>
          { this.props.authorizations && (this.props.authorizations.permission_identityGroups_post || this.props.authorizations.any) ?
            <Col span={1}>
              <Add/>
            </Col>
            :
            null
          }
          { this.props.authorizations && (this.props.authorizations.permission_identityGroup_delete || this.props.authorizations.any) ?
            <Col span={2}>
                <IdentityGroupDelete/>
            </Col>
            :
            null
          }
        </Row>
        <br/>
        <Row>
          <Col span={24}>
            <List/>
          </Col>
        </Row>

        { this.props.assetsError ? <Error component={'manager vmware'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.identityGroupsError ? <Error component={'manager vmware'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error component={'manager vmware'} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.vmware,

  assets: state.vmware.assets,
  identityGroups: state.vmware.identityGroups,
  permissions: state.vmware.permissions,

  permissionsFetch: state.vmware.permissionsFetch,

  assetsError: state.vmware.assetsError,
  identityGroupsError: state.vmware.identityGroupsError,
  permissionsError: state.vmware.permissionsError,
}))(Manager);
