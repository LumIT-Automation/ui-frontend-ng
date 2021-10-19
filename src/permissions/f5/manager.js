import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest";

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
} from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Form } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


/*

*/


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
  }

  main = async () => {
    this.props.dispatch(setPermissionsLoading(true))
    let assets = await this.fetchAssets()
    this.props.dispatch(setAssets( assets ))

    let identityGroups = await this.fetchIdentityGroups()
    this.props.dispatch(setIdentityGroups( identityGroups ))


    let permissions = await this.fetchPermissions()

    this.addAssetDetails(permissions)
    this.props.dispatch(setPermissionsLoading(false))
  }


  resetError = () => {
    this.setState({ error: null})
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
    await rest.doXHR("f5/assets/", this.props.token)
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
    await rest.doXHR("f5/identity-groups/", this.props.token)
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
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`f5/permissions/`, this.props.token)
    return r
  }



  addAssetDetails = async (perm) => {
    let permissions = Object.assign({}, perm.data.items)
    let assets = Object.assign({}, this.props.assets)

    permissions = JSON.parse(JSON.stringify(permissions))
    assets = JSON.parse(JSON.stringify(assets))
    assets = Object.assign([], assets)

    for (const [key, value] of Object.entries(permissions)) {
      const asset = assets.find(a => a.id === value.partition.asset_id)
      value.asset = asset
    }
    permissions = Object.assign([], permissions)

    this.props.dispatch(setPermissions(permissions))
    console.log('finish')
    return
  }








  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
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

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  error: state.error.error,
  authorizations: state.authorizations.f5,
  assets: state.f5.assets,
  permissions: state.f5.permissions,
  permissionsFetch: state.f5.permissionsFetch,
  permissionsLoading: state.f5.permissionsLoading,
}))(Manager);
