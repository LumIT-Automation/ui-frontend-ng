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
  setPermissions,
  setPermissionsLoading,
  setPermissionsFetch,
} from '../../_store/store.infoblox'

import List from './list'
import Add from './add'
import AddGroup from './addGroup'

import { Table, Input, Button, Space, Spin, Divider } from 'antd';
import Highlighter from 'react-highlight-words';


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
    let assets = await this.fetchAssets()
    this.props.dispatch(setAssetsLoading(false))

    let permissions = await this.fetchPermissions()
    this.props.dispatch(setPermissionsLoading(false))

    this.props.dispatch(setAssets( assets ))
    this.props.dispatch(setPermissions(permissions))
  }

  fetchPermissions = async () => {
    console.log('fetchPermissions')
    let r
    this.props.dispatch(setPermissionsLoading(true))
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
    await rest.doXHR(`infoblox/permissions/`, this.props.token)
    return r
  }

  fetchAssets = async () => {
    console.log('fetchAssets')
    let r
    this.props.dispatch(setAssetsLoading(true))
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

  resetError = () => {
    this.setState({ error: null})
  }



  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>

      { this.props.authorizations && (this.props.authorizations.permission_identityGroups_post || this.props.authorizations.any) ?
        <React.Fragment>
          <Add/>
          <AddGroup />
        </React.Fragment>
        :
        null
      }

        <div>
          <List/>
        </div>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,

  permissions: state.infoblox.permissions,
  permissionsFetch: state.infoblox.permissionsFetch,

}))(Manager);
