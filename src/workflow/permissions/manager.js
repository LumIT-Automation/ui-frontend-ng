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

  workflows,
  workflowsError,
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
    if (!this.props.workflowsError && !this.props.identityGroupsError && !this.props.permissionsError) {
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

    let fetchedWorkflows = await this.workflowsGet()
    if (fetchedWorkflows.status && fetchedWorkflows.status !== 200 ) {
      this.props.dispatch(workflowsError(fetchedWorkflows))
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      this.props.dispatch(workflows( fetchedWorkflows ))
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

    if ((fetchedWorkflows.status && fetchedWorkflows.status !== 200 ) ||
        (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) ||
        (fetchedPermissions.status && fetchedPermissions.status !== 200 ) ) {
      this.props.dispatch(permissionsLoading(false))
      return
    }
    else {
      //this.props.dispatch(permissionsLoading(false))
      let permissionsWithWorkflows = await this.workflowAddDetails(fetchedWorkflows, fetchedPermissions)
      this.props.dispatch(permissions( permissionsWithWorkflows ))
      this.props.dispatch(permissionsLoading(false))
    }
  }


  workflowsGet = async () => {
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
    await rest.doXHR("workflow/workflows/", this.props.token)
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
    await rest.doXHR("workflow/identity-groups/", this.props.token)
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
    await rest.doXHR("workflow/permissions/", this.props.token)
    return r
  }


  workflowAddDetails = async (workflows, permissions) => {
    //workflows and permissions are immutable, so I stringyfy and parse in order to edit them
    //console.log('workflows', workflows)
    //console.log('permissions', permissions)


    let newPermissions = JSON.parse(JSON.stringify(permissions.data.items))
    let workflowsObject = JSON.parse(JSON.stringify(workflows.data))
    let list = []


    for (const [key, value] of Object.entries(workflowsObject)) {
      list.push(value)
    }

    for (const [key, value] of Object.entries(newPermissions)) {
      const workflow = list.find(a => a.id === value.workflow.id)
      value.workflow = workflow
    }

    let permissionsWithWorkflowDescription =JSON.parse(JSON.stringify(newPermissions))

    return permissionsWithWorkflowDescription
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

        { this.props.workflowsError ? <Error component={'manager workflow'} error={[this.props.workflowsError]} visible={true} type={'workflowsError'} /> : null }
        { this.props.identityGroupsError ? <Error component={'manager workflow'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error component={'manager workflow'} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.workflow,

  workflows: state.workflow.workflows,
  identityGroups: state.workflow.identityGroups,
  permissions: state.workflow.permissions,

  permissionsFetch: state.workflow.permissionsFetch,

  workflowsError: state.workflow.workflowsError,
  identityGroupsError: state.workflow.identityGroupsError,
  permissionsError: state.workflow.permissionsError,
}))(Manager);
