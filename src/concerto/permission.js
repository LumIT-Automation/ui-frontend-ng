import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import JsonHelper from '../_helpers/jsonHelper'
import Error from './error'
import RolesDescription from './rolesDescription'

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';


import {
  assetsError,
  subAssetsError,
  networksError,
  containersError,
  workflowsError,

  rolesError,
  identityGroupsError,
  newIdentityGroupAddError,
  identityGroupDeleteError,

  permissionsError,
  permissionAddError,
  permissionModifyError,
  permissionDeleteError,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const permLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



//import List from './list'



class Permission extends React.Component {

  constructor(props) {
    super(props);

    this.textAreaRefs = {};

    this.state = {
      searchText: '',
      searchedColumn: '',
      assets: [],
      subAssets: '',
      subAsset: '',
      workflows: [],
      identityGroups: [],
      roles: [],
      permissions: [],
      originPermissions: [],
      newIg: '',
      delIg: '',
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.assetsError && !this.props.identityGroupsError && !this.props.permissionsError) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
    if (this.state.permissionsRefresh) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
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
          <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
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
    render: text => {
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  main = async () => {

    let fetchedAssets,
    fetchedWorkflows,
    fetchedIdentityGroups,
    fetchedRoles,
    rolesNoWorkflow,
    fetchedPermissions,
    identityGroupsNoWorkflowLocal,
    permissionsNoWorkflowLocal,
    permissionsWithWorkflows,
    permissionsWithAssets

    let subAsset, subAssets
    switch (this.props.vendor) {
      case 'superAdmin':
        subAsset = ''
        subAssets = ''
        break;

      case 'workflow':
        subAsset = ''
        subAssets = ''
        break;

      case 'infoblox':
        subAsset = 'network'
        subAssets = 'networks'
        break;
      case 'checkpoint':
        subAsset = 'domain'
        subAssets = 'domains'
        break;
      case 'f5':
        subAsset = 'partition'
        subAssets = 'partitions'
        break;
      case 'vmware':
        subAsset = 'object'
        subAssets = 'objects'
        break;

      case 'fortinetdb':
        subAsset = ''
        subAssets = ''
        break;
      default:

    }

    await this.setState({loading: true, subAssets: subAssets, subAsset: subAsset, newIg: '', delIg: '', newIGShow: false, delIGShow: false})

    if (this.props.vendor !== 'superAdmin') {

      if (this.props.vendor === 'infoblox' ||
          this.props.vendor === 'checkpoint' ||
          this.props.vendor === 'f5' ||
          this.props.vendor === 'vmware') {

        fetchedAssets = await this.dataGet('assets')
        if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
          this.props.dispatch(assetsError(fetchedAssets))
          await this.setState({loading: false})
          return
        }
        else {
          let assets = []
          fetchedAssets.data.items.forEach((item, i) => {
            item[subAssets] = []
            assets.push(item)
          });
          await this.setState({assets: assets})
        }
        await this.assetWithSubAssets()
      }
      else if (this.props.vendor === 'workflow' ){
        fetchedWorkflows = await this.dataGet('workflows')
        if (fetchedWorkflows.status && fetchedWorkflows.status !== 200 ) {
          this.props.dispatch(workflowsError(fetchedWorkflows))
          await this.setState({loading: false})
          return
        }
        else {
          await this.setState({workflows: fetchedWorkflows.data.items})
        }
      }
      else {

      }

      fetchedRoles = await this.dataGet('roles')
      if (fetchedRoles.status && fetchedRoles.status !== 200 ) {
        this.props.dispatch(rolesError(fetchedRoles))
        await this.setState({loading: false})
        return
      }
      else {
        rolesNoWorkflow = fetchedRoles.data.items.filter(r => r.role !== 'workflow');
        await this.setState({roles: rolesNoWorkflow})
      }

      fetchedIdentityGroups = await this.dataGet('identity-groups')
      if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
        this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
        await this.setState({loading: false})
        return
      }
      else {
        identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
        await this.setState({identityGroups: identityGroupsNoWorkflowLocal})
      }

    }

    fetchedPermissions = await this.dataGet('permissions')
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      this.props.dispatch(permissionsError(fetchedPermissions))
      await this.setState({loading: false})
      return
    }
    else {
      permissionsNoWorkflowLocal = fetchedPermissions.data.items.filter(r => r.identity_group_name !== 'workflow.local');

      if (this.props.vendor === 'superAdmin') {
        let list = []
        for ( let s in permissionsNoWorkflowLocal) {
          const regex = /(cn=)([\w\d]+)/gm
          let m = regex.exec(permissionsNoWorkflowLocal[s]);
          try {
            list.push({'dn': permissionsNoWorkflowLocal[s], 'name': m[2]})
          }
          catch {
            ;
          }

        }
        await this.setState({permissions: list, originPermissions: list})
      }

      else if (this.props.vendor === 'workflow') {
        let jsonHelper = new JsonHelper()

        permissionsWithWorkflows = await this.workflowAddDescription(fetchedWorkflows, {data: {items: permissionsNoWorkflowLocal}})
        permissionsWithWorkflows.forEach((item, i) => {
          item.existent = true
          item.isModified = {}
          item.details = jsonHelper.jsonPretty(item.details)
          //item.details
          //this[`inputTextAreaRef${item.id}`] = React.createRef(null);
        });
        await this.setState({permissions: permissionsWithWorkflows, originPermissions: permissionsWithWorkflows})
      }
      else if (this.props.vendor === 'fortinetdb') {
        let list = []
        fetchedPermissions.data.items.forEach((item, i) => {
          item.existent = true
          item.isModified = {}
          list.push(item)
        });
        await this.setState({permissions: list, originPermissions: list})
      }

      else {
        permissionsWithAssets = await this.permsWithAsset(permissionsNoWorkflowLocal)
        permissionsWithAssets.forEach((item, i) => {
          item.existent = true
          item.isModified = {}
        });
        await this.setState({permissions: permissionsWithAssets, originPermissions: permissionsWithAssets})
      }

    }

    await this.setState({loading: false})
  }

  dataGet = async (entities, assetId) => {
    let endpoint = `${this.props.vendor}/${entities}/`
    let r
    if (this.props.vendor === 'superAdmin') {
      endpoint = 'superadmins'
    }
    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, this.props.token)
    return r
  }

  assetWithSubAssets = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let subAssetsFetched

    try {
      for (const asset of Object.values(assets)) {
        await this.setState({assets: assets})

        switch (this.state.subAssets) {
          case 'networks':
            subAssetsFetched = await this.networksGet(asset.id)
            break;
          case 'domains':
            subAssetsFetched = await this.dataGet('domains', asset.id)
            break;
          case 'partitions':
            subAssetsFetched = await this.dataGet('partitions', asset.id)
            break;
          case 'objects':
            subAssetsFetched = []
            break;
          default:
        }

        if (subAssetsFetched.status && subAssetsFetched.status !== 200 ) {
          this.props.dispatch(subAssetsError(subAssetsFetched))
          await this.setState({assets: assets})
          return
        }
        else {
          if (subAssetsFetched.data && subAssetsFetched.data.items) {
            asset[this.state.subAssets] = subAssetsFetched.data.items
          }
          else {
            asset[this.state.subAssets] = subAssetsFetched
          }

          await this.setState({assets: assets})
        }
      };
      return assets
    } catch(error) {
      console.log(error)
      return assets
    }
  }

  networksGet = async (assetId) => {
    let nets = await this.dataGet('networks', assetId)
    if (nets.status && nets.status !== 200) {
      this.props.dispatch(networksError( nets ))
      return
    }

    let containers = await this.dataGet('network-containers', assetId)
    if (containers.status && containers.status !== 200) {
      this.props.dispatch(containersError( containers ))
      return
    }

    let networks = nets.data.concat(containers.data)
    return networks
  }


  permsWithAsset = async (permissions) => {
    try {
      Object.values(permissions).forEach((perm, i) => {
        let asset = this.state.assets.find(a => a.id === perm[this.state.subAsset].id_asset)
        perm.asset = asset
        perm.assetFqdn = asset.fqdn
      });
      return permissions
    } catch(error) {
      console.log(error)
      return permissions
    }
  }

  workflowAddDescription = async (workflows, permissions) => {
    let newPermissions = JSON.parse(JSON.stringify(permissions.data.items))
    let workflowsObject = JSON.parse(JSON.stringify(workflows.data.items))
    let list = []

    /*To use object.values not object.entries
    for (const [key, value] of Object.entries(workflowsObject)) {
      list.push(value)
    }*/

    Object.values(workflowsObject).forEach((value, i) => {
      list.push(value)
    })

    /*
    for (const [key, value] of Object.entries(newPermissions)) {
      const workflow = list.find(a => a.id === value.workflow.id)
      value.workflow = workflow
    }*/

    Object.values(newPermissions).forEach((value, i) => {
      const workflow = list.find(a => a.id === value.workflow.id)
      value.workflow = workflow
    })

    let permissionsWithWorkflowDescription = JSON.parse(JSON.stringify(newPermissions))

    return permissionsWithWorkflowDescription
  }

  permissionsRefresh = async () => {
    await this.setState({permissionsRefresh: true})
  }


  permissionAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(this.state.permissions))

    this.state.permissions.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });

    n = id + 1
    p.id = n
    p.asset = {}
    p.assetFqdn = ''
    p.identity_group_identifier = ''
    p.identity_group_name = ''
    p[this.state.subAsset] = {}
    p.role = ''
    //list.push(p)
    list = [p].concat(list)
    //this[`inputTextAreaRef${p.id}`] = React.createRef(null);

    await this.setState({permissions: list})
  }

  permissionRemove = async p => {
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let newList = permissions.filter(n => {
      return p.id !== n.id
    })

    //delete this[`inputTextAreaRef${p.id}`]
    await this.setState({permissions: newList})
  }

  set = async (key, value, permission) => {
    //console.log('key', key)
    //console.log('value', value)
    //console.log('permission', permission)

    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let workflows = JSON.parse(JSON.stringify(this.state.workflows))
    let identityGroups = JSON.parse(JSON.stringify(this.state.identityGroups))
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let origPerm = this.state.originPermissions.find(p => p.id === permission.id)
    let perm = permissions.find(p => p.id === permission.id)

    if (key === 'workflowName') {
      if (value) {
        let wf = workflows.find(w => w.name === value)
        if (perm.existent) {
          if (wf.name !== origPerm.workflow.name) {
            perm.isModified.workflowName = true
            perm.workflow.id = wf.id
            perm.workflow.name = wf.name
            perm.workflow.description = wf.description
          }
          else {
            delete perm.isModified.workflowName
            perm.workflow.id = wf.id
            perm.workflow.name = wf.name
            perm.workflow.description = wf.description
          }
        }
        else {
          perm.workflow = {}
          perm.workflow.id = wf.id
          perm.workflow.name = wf.name
          perm.workflow.description = wf.description
        }
        delete perm.workflowNameError
      }
    }

    if (key === 'details') {
      let start = 0
      let end = 0
      let ref = this.textAreaRefs[permission.id]

      if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
        start = ref.resizableTextArea.textArea.selectionStart
        end = ref.resizableTextArea.textArea.selectionEnd
      }

      if (value) {
        if (perm.existent) {
          if (origPerm.details !== value) {
            perm.isModified.details = true
            perm.details = value
          }
          else {
            delete perm.isModified.details
            perm.details = value
          }
        }
        else {
          perm.details = value
        }
        delete perm.detailsError
        delete perm.jsonError
      }
      else {
        perm.details = ''
      }

      await this.setState({permissions: permissions})

      ref = this.textAreaRefs[permission.id]
      if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
        ref.resizableTextArea.textArea.selectionStart = start
        ref.resizableTextArea.textArea.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'identity_group_identifier') {
      if (value) {
        let ig = identityGroups.find(i => i.identity_group_identifier === value)
        if (perm.existent) {
          if (ig.identity_group_identifier !== origPerm.identity_group_identifier) {
            perm.isModified.identity_group_identifier = true
            perm.identity_group_identifier = ig.identity_group_identifier
            perm.identity_group_name = ig.name
          }
          else {
            delete perm.isModified.identity_group_identifier
            perm.identity_group_identifier = ig.identity_group_identifier
            perm.identity_group_name = ig.name
          }
        }
        else {
          perm.identity_group_identifier = ig.identity_group_identifier
          perm.identity_group_name = ig.name
        }
        delete perm.identity_group_identifierError
      }
    }

    if (key === 'role') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm.role) {
            perm.isModified.role = true
            perm.role = value
          }
          else {
            delete perm.isModified.role
            perm.role = value
          }
        }
        else {
          perm.role = value
        }
        delete perm.roleError
      }
    }

    if (key === 'assetId') {
      if (value) {
        let asset = assets.find(a => a.id === value)
        if (perm.existent) {
          if (asset.id !== origPerm.asset.id) {
            perm.isModified.subAsset_assetId = true
            perm.isModified.subAsset_name = true
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            perm[this.state.subAsset] = {id_asset: value}
          }
          else {
            delete perm.isModified.subAsset_assetId
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            perm[this.state.subAsset] = {id_asset: value}
            perm.isModified.subAsset_name = true
          }
        }
        else {
          perm.asset = asset
          perm.assetFqdn = asset.fqdn
          perm[this.state.subAsset] = {id_asset: value}
        }
        delete perm.assetIdError
      }
    }

    if (key === 'subAsset') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm[this.state.subAsset].name) {
            perm.isModified.subAsset_name = true
            perm[this.state.subAsset].name = value
          }
          else {
            delete perm.isModified.subAsset_name
            perm[this.state.subAsset].name = value
          }
        }
        else {
          perm[this.state.subAsset].name = value
        }
        delete perm[`${this.state.subAsset}Error`]
      }
    }

    if (key === 'toDelete') {
      if (value) {
        perm.toDelete = true
      }
      else {
        delete perm.toDelete
      }
    }

    if (key !== 'details') {
      await this.setState({permissions: permissions})
    }

  }

  newIdentityGroupHandler = async () => {
    let ig = JSON.parse(JSON.stringify(this.state.newIg))
    let identityGroups = JSON.parse(JSON.stringify(this.state.identityGroups))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let identityGroupIds = []
    let body = {}

    identityGroups.forEach((item, i) => {
      identityGroupIds.push(item.identity_group_identifier)
    });

    if (ig === '') {
      errors.newIdentityGroup = 'Empty identity group.'
      await this.setState({errors: errors})
      return
    }
    else if (identityGroupIds.includes(ig)) {
      errors.newIdentityGroup = 'Identity group already exists.'
      await this.setState({errors: errors})
      return
    }
    else {
      try{
        let list = ig.split(',')
        let cns = []

        let found = list.filter(i => {
          let iLow = i.toLowerCase()
          if (iLow.startsWith('cn=')) {
            let cn = iLow.split('=')
            cns.push(cn[1])
          }
        })
        if (cns.length < 1) {
          errors.newIdentityGroup = 'Malformed DN.'
          await this.setState({errors: errors})
        }
        else {
          body.name = cns[0]
          body.identity_group_identifier = ig
          delete errors.newIdentityGroup
          await this.setState({errors: errors})

          await this.setState({newIgLoading: true})
          let newIg = await this.newIdentityGroupAdd(body)
          await this.setState({newIgLoading: false})

          if (newIg.status && newIg.status !== 201) {
            this.props.dispatch(newIdentityGroupAddError(newIg))
            return
          }
          else {
            let fetchedIdentityGroups = await this.dataGet('identity-groups')
            if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
              this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
              await this.setState({loading: false})
              return
            }
            else {
              let identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
              await this.setState({identityGroups: identityGroupsNoWorkflowLocal})
            }
          }
        }
      } catch(error) {
        console.log(error)
      }
    }
  }

  newIdentityGroupAdd = async (data) => {
    let r
    let b = {}
    b.data = data

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/identity-groups/`, this.props.token, b )
    return r
  }

  delIdentityGroupHandler = async () => {

    await this.setState({delIgLoading: true})
    let delIg = await this.identityGroupDelete(this.state.delIg)


    if (delIg.status && delIg.status !== 200 ) {
      this.props.dispatch(identityGroupDeleteError(delIg))
      return
    }
    else {
      let fetchedIdentityGroups = await this.dataGet('identity-groups')
      if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
        this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
        return
      }
      else {
        await this.setState({delIg: ''})
      }
    }
    await this.setState({delIgLoading: false})
    this.main()
  }

  identityGroupDelete = async (data) => {
    let r

    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/identity-group/${data}/`, this.props.token)
    return r
  }

  validation = async () => {
    let errors = await this.validationCheck()
    if (errors === 0) {
      this.cudManager()
    }
  }

  validationCheck = async () => {
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let errors = 0
    let jsonHelper = new JsonHelper()

    for (const perm of Object.values(permissions)) {
      if (!perm.identity_group_identifier) {
        ++errors
        perm.identity_group_identifierError = true
      }
      if (!perm.role) {
        perm.roleError = true
        ++errors
      }
      if (this.props.vendor === 'workflow') {
        if (!perm.workflow || (perm.workflow && !perm.workflow.id) ) {
          perm.workflowNameError = true
          ++errors
        }
        if (!perm.details) {
          perm.detailsError = true
          perm.jsonError = 'Missing JSON'
          ++errors
        }
        let jsonError = jsonHelper.isJsonString(perm.details)
        if (jsonError.status === 'error') {
          perm.detailsError = true
          perm.jsonError = 'Malformed JSON'
          if (jsonError.message) {
            perm.jsonError = jsonError.message
          }
          ++errors
        }
      }
      else {
        if (this.props.vendor === 'fortinetdb') {
          continue
        }
        if (!perm[this.state.subAsset].id_asset) {
          perm.assetIdError = true
          ++errors
        }
        if (!perm[this.state.subAsset].name) {
          perm[`${this.state.subAsset}Error`] = true
          ++errors
        }

      }

    }
    await this.setState({permissions: permissions})
    return errors
  }

  cudManager = async () => {
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const perm of Object.values(permissions)) {
      if (perm.toDelete) {
        toDelete.push(perm)
      }
      if (perm.isModified && Object.keys(perm.isModified).length > 0) {
        toPatch.push(perm)
      }
      if (!perm.existent) {
        toPost.push(perm)
      }
    }
    //console.log('toDelete', toDelete)
    //console.log('toPatch', toPatch)
    //console.log('toPost', toPost)

    if (toDelete.length > 0) {
      for (const perm of toDelete) {
        //let per = permissions.find(p => p.id === perm.id)
        perm.loading = true
        await this.setState({permissions: permissions})

        let p = await this.permissionDelete(perm.id)
        if (p.status && p.status !== 200 ) {
          this.props.dispatch(permissionDeleteError(p))
          perm.loading = false
          await this.setState({permissions: permissions})
        }
        else {
          perm.loading = false
          await this.setState({permissions: permissions})
        }

      }
    }

    if (toPatch.length > 0) {
      for (const perm of toPatch) {
        let body = {}

        if (this.props.vendor === 'workflow') {
          let details = JSON.parse(perm.details);
          body.data = {
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role,
             "workflow" : {
               "id": perm.workflow.id
             },
             "details" : details
          }
        }
        else if (this.props.vendor === 'fortinetdb') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role
          }
        }
        else {
          body.data = {
             "identity_group_name": perm.identity_group_name,
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role,
             [this.state.subAsset]: {
                 "name": perm[this.state.subAsset].name,
                 "id_asset": perm[this.state.subAsset].id_asset
             }
          }
          if (this.props.vendor === 'vmware') {
            body.data[this.state.subAsset].moId = "any"
          }
        }

        perm.loading = true
        await this.setState({permissions: permissions})

        let p = await this.permModify(perm.id, body)
        if (p.status && p.status !== 200 ) {
          this.props.dispatch(permissionModifyError(p))
          perm.loading = false
          await this.setState({permissions: permissions})
        }
        else {
          perm.loading = false
          await this.setState({permissions: permissions})
        }

      }
    }

    if (toPost.length > 0) {
      for (const perm of toPost) {
        let body = {}

        if (this.props.vendor === 'workflow') {
          let details = JSON.parse(perm.details);
          body.data = {
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role,
             "workflow" : {
               "id": perm.workflow.id
             },
             "details" : details
          }
        }
        else if (this.props.vendor === 'fortinetdb') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role
          }
        }
        else {
          body.data = {
             "identity_group_name": perm.identity_group_name,
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role,
             [this.state.subAsset]: {
                 "name": perm[this.state.subAsset].name,
                 "id_asset": perm[this.state.subAsset].id_asset
             }
          }
          if (this.props.vendor === 'vmware') {
            body.data[this.state.subAsset].moId = "any"
          }
        }

        perm.loading = true
        await this.setState({permissions: permissions})

        let p = await this.permAdd(body)
        if (p.status && p.status !== 201 ) {
          this.props.dispatch(permissionAddError(p))
          perm.loading = false
          await this.setState({permissions: permissions})
        }
        else {
          perm.loading = false
          await this.setState({permissions: permissions})
        }

      }
    }

    this.permissionsRefresh()
  }

  permissionDelete = async (permissionId) => {
    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/permission/${permissionId}/`, this.props.token )
    return r
  }

  permModify = async (permId, body) => {
    let r
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/permission/${permId}/`, this.props.token, body )
    return r
  }

  permAdd = async (body) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/permissions/`, this.props.token, body )
    return r
  }


  render() {
    //console.log('document.activeElement', document.activeElement)
    //console.log('document.activeElement.id', document.activeElement.id)
    //console.log('this', this)
    console.log('identityGroups', this.state.identityGroups)
    console.log('roles', this.state.roles)
    console.log('permissions', this.state.permissions)

    let returnCol = () => {
      if (this.props.vendor === 'superAdmin') {
        return superAdminColumns
      }
      else if (this.props.vendor === 'workflow') {
        return workflowColumns
      }
      else if (this.props.vendor === 'fortinetdb') {
        return fortinetdbColumns
      }
      else {
        return vendorColumns
      }
    }

    const superAdminColumns = [
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'dn',
        key: 'dn',
        ...this.getColumnSearchProps('dn'),
      },
    ];

    const workflowColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={permLoadIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
        ...this.getColumnSearchProps('identity_group_name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
        ...this.getColumnSearchProps('identity_group_identifier'),
        render: (name, obj)  => (
          <Select
            value={obj.identity_group_identifier}
            showSearch
            style=
            { obj.identity_group_identifierError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('identity_group_identifier', value, obj )}
          >
            { this.state.identityGroups.map((ig, i) => {
                return (
                  <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      {
        title: 'Workflow name',
        align: 'center',
        dataIndex: ['workflow', 'name' ],
        key: 'name',
        ...this.getColumnSearchProps(['workflow', 'name' ]),
        render: (name, obj)  => (
          <Select
            value={obj && obj.workflow && obj.workflow.name ? obj.workflow.name : null}
            showSearch
            style=
            { obj.workflowNameError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('workflowName', value, obj )}
          >
            { this.state.workflows.map((wf, i) => {
                return (
                  <Select.Option key={i} value={wf.name}>{wf.name}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      {
        title: 'Description',
        align: 'center',
        width: '100%',
        dataIndex: ['workflow', 'description' ],
        key: 'description',
        ...this.getColumnSearchProps(['workflow', 'description' ]),
      },
      {
        title: 'Assets',
        align: 'center',
        dataIndex: 'details',
        key: 'details',
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input.TextArea
              value={obj.details}
              autoSize={{minRows: 7}}
              //ref={ref => this.setRef(ref, obj.id)}
              ref={ref => this.textAreaRefs[obj.id] = ref}
              style={
                obj.detailsError ?
                  {borderColor: 'red', textAlign: 'left', width: 250}
                :
                  {textAlign: 'left', width: 250}
              }
              onChange={e => {
                this.set('details', e.target.value, obj)}
              }
            />
            {obj.jsonError ?
              <p style={{color: 'red'}}>{obj.jsonError}</p>
            :
              null
            }
            </React.Fragment>
          )
        },
      },
      {
        title: <RolesDescription vendor={this.props.vendor} title={`roles' description`}/>,
        align: 'center',
        dataIndex: 'role',
        key: 'role',
        ...this.getColumnSearchProps('role'),
        render: (name, obj)  => (
          <Select
            value={obj && obj.role ? obj.role : null}
            showSearch
            style=
            { obj.roleError ?
              {width: 75, border: `1px solid red`}
            :
              {width: 75}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('role', value, obj )}
          >
            { (this.state.roles ? this.state.roles.map((role, i) => {
                return (
                  <Select.Option key={i} value={role.role ? role.role : ''}>{role.role ? role.role : ''}</Select.Option>
                )
              })
            :
              null
            )}
          </Select>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.permissionRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    const fortinetdbColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={permLoadIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
        ...this.getColumnSearchProps('identity_group_name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
        ...this.getColumnSearchProps('identity_group_identifier'),
        render: (name, obj)  => (
          <Select
            value={obj.identity_group_identifier}
            showSearch
            style=
            { obj.identity_group_identifierError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('identity_group_identifier', value, obj )}
          >
            { this.state.identityGroups.map((ig, i) => {
                return (
                  <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      {
        title: <RolesDescription vendor={this.props.vendor} title={`roles' description`}/>,
        align: 'center',
        dataIndex: 'role',
        key: 'role',
        ...this.getColumnSearchProps('role'),
        render: (name, obj)  => (
          <Select
            value={obj && obj.role ? obj.role : null}
            showSearch
            style=
            { obj.roleError ?
              {width: 200, border: `1px solid red`}
            :
              {width: 200}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('role', value, obj )}
          >
            { (this.state.roles ? this.state.roles.map((role, i) => {
                return (
                  <Select.Option key={i} value={role.role ? role.role : ''}>{role.role ? role.role : ''}</Select.Option>
                )
              })
            :
              null
            )}
          </Select>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.permissionRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    const vendorColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={permLoadIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
        ...this.getColumnSearchProps('identity_group_name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
        ...this.getColumnSearchProps('identity_group_identifier'),
        render: (name, obj)  => (
          <Select
            value={obj.identity_group_identifier}
            showSearch
            style=
            { obj.identity_group_identifierError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('identity_group_identifier', value, obj )}
          >
            { this.state.identityGroups.map((ig, i) => {
                return (
                  <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      {
        title: 'Asset',
        align: 'center',
        dataIndex: 'assetFqdn',
        key: 'assetFqdn',
        ...this.getColumnSearchProps('assetFqdn'),
        render: (name, obj)  => (
          <Select
            value={obj.assetFqdn}
            showSearch
            style=
            { obj.assetIdError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('assetId', value, obj )}
          >
            { this.state.assets.map((ass, i) => {
                return (
                  <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      ...(
        this.props.vendor === 'infoblox' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={obj && obj[this.state.subAsset] && !obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj[`${this.state.subAsset}Error`] ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.network ? sub.network : ''}>{sub.network ? sub.network : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
        :
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={obj && obj[this.state.subAsset] && !obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj[`${this.state.subAsset}Error`] ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.name ? sub.name : ''}>{sub.name ? sub.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
      ),
      {
        title: <RolesDescription vendor={this.props.vendor} title={`roles' description`}/>,
        align: 'center',
        dataIndex: 'role',
        key: 'role',
        ...this.getColumnSearchProps('role'),
        render: (name, obj)  => (
          <Select
            value={obj && obj.role ? obj.role : null}
            showSearch
            style=
            { obj.roleError ?
              {width: 150, border: `1px solid red`}
            :
              {width: 150}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('role', value, obj )}
          >
            { (this.state.roles ? this.state.roles.map((role, i) => {
                return (
                  <Select.Option key={i} value={role.role ? role.role : ''}>{role.role ? role.role : ''}</Select.Option>
                )
              })
            :
              null
            )}
          </Select>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.permissionRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          //<Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>
          <React.Fragment>

            <Radio.Group>
              <Radio.Button
                style={{marginLeft: 16 }}
                onClick={() => this.permissionsRefresh()}
              >
                <ReloadOutlined/>
              </Radio.Button>
            </Radio.Group>

            {(this.props.vendor !== 'superAdmin') ?
              <Radio.Group
                buttonStyle="solid"
              >
                <Radio.Button
                  style={{marginLeft: 16 }}
                  onClick={() => this.permissionAdd()}
                >
                  Add permission
                </Radio.Button>

                <Radio.Button
                  style={{marginLeft: 16 }}
                  buttonStyle="solid"
                  onClick={() => this.setState({newIGShow: true, delIGShow: false})}
                >
                  New identity group
                </Radio.Button>

                <Radio.Button
                  style={{ backgroundColor: 'red', borderColor: 'red'}}
                  onClick={() => this.setState({newIGShow: false, delIGShow: true})}
                >
                  Delete identity group
                </Radio.Button>
              </Radio.Group>
            :
              null
            }

            { (this.state.newIGShow && this.props.vendor !== 'superAdmin') ?
              <React.Fragment>
              <br/>
              <br/>
              { this.state.newIgLoading ?
                  <Spin indicator={permLoadIcon} style={{marginLeft: '16px', marginRight: '8px'}}/>
                :
                  <Input
                    style={{width: 350, marginLeft: 16}}
                    value={this.state.newIg}
                    placeholder="cn= ,cn= ,dc= ,dc= "
                    suffix={
                      <CloseCircleOutlined onClick={() => {
                        let errors = JSON.parse(JSON.stringify(this.state.errors))
                        delete errors.newIdentityGroup
                        this.setState({newIg: '', errors: errors})
                      }
                      }
                      />
                    }
                    onChange={e => this.setState({newIg: e.target.value})}
                  />
              }
                <Button
                  type='primary'
                  style={{marginLeft: 8}}
                  onClick={() => this.newIdentityGroupHandler()}
                >
                  Add
                </Button>
                <Button
                  style={{marginLeft: 8}}
                  onClick={() => {
                    let errors = JSON.parse(JSON.stringify(this.state.errors))
                    delete errors.newIdentityGroup
                    this.setState({newIGShow: false, newIg: '', errors: errors})
                  }
                  }
                >
                  Hide
                </Button>
                <p style={{marginLeft: '16px', color: 'red'}}>{this.state.errors.newIdentityGroup}</p>
              </React.Fragment>
              :
              null
            }
            { (this.state.delIGShow && this.props.vendor !== 'superAdmin') ?
              <React.Fragment>
              <br/>
              <br/>
              { this.state.delIgLoading ?
                  <Spin indicator={permLoadIcon} style={{marginLeft: '16px', marginRight: '8px'}}/>
                :
                  <Select
                    value={this.state.delIg}
                    showSearch
                    style={{width: 350, marginLeft: 16}}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={e => this.setState({delIg: e})}
                  >
                    { this.state.identityGroups.map((ig, i) => {
                        return (
                          <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                        )
                      })
                    }
                  </Select>

              }
                <Button
                  type='danger'
                  style={{marginLeft: 8}}
                  onClick={() => this.delIdentityGroupHandler()}
                >
                  Delete
                </Button>
                <Button
                  style={{marginLeft: 8}}
                  onClick={() => {
                    let errors = JSON.parse(JSON.stringify(this.state.errors))
                    delete errors.delIdentityGroup
                    this.setState({delIGShow: false, delIg: '', errors: errors})
                  }
                  }
                >
                  Hide
                </Button>
                <p style={{marginLeft: '16px', color: 'red'}}>{this.state.errors.delIdentityGroup}</p>
              </React.Fragment>
              :
              null
            }


            <br/>
            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 15}}
              dataSource={this.state.permissions}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
            {(this.props.vendor !== 'superAdmin') ?
              <Button
                type="primary"
                style={{float: 'right', marginRight: 15}}
                onClick={() => this.validation()}
              >
                Commit
              </Button>
            :
              null
            }

          </React.Fragment>
          //</Space>
        }
        { this.props.assetsError ? <Error vendor={this.props.vendor} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.subAssetsError ? <Error vendor={this.props.vendor} error={[this.props.subAssetsError]} visible={true} type={'subAssetsError'} /> : null }
        { this.props.networksError ? <Error vendor={this.props.vendor} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
        { this.props.containersError ? <Error vendor={this.props.vendor} error={[this.props.containersError]} visible={true} type={'containersError'} /> : null }
        { this.props.workflowsError ? <Error vendor={this.props.vendor} error={[this.props.workflowsError]} visible={true} type={'workflowsError'} /> : null }

        { this.props.rolesError ? <Error vendor={this.props.vendor} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
        { this.props.identityGroupsError ? <Error vendor={this.props.vendor} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.newIdentityGroupAddError ? <Error vendor={this.props.vendor} error={[this.props.newIdentityGroupAddError]} visible={true} type={'newIdentityGroupAddError'} /> : null }
        { this.props.identityGroupDeleteError ? <Error vendor={this.props.vendor} error={[this.props.identityGroupDeleteError]} visible={true} type={'identityGroupDeleteError'} /> : null }

        { this.props.permissionsError ? <Error vendor={this.props.vendor} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }
        { this.props.permissionAddError ? <Error vendor={this.props.vendor} error={[this.props.permissionAddError]} visible={true} type={'permissionAddError'} /> : null }
        { this.props.permissionModifyError ? <Error vendor={this.props.vendor} error={[this.props.permissionModifyError]} visible={true} type={'permissionModifyError'} /> : null }
        { this.props.permissionDeleteError ? <Error vendor={this.props.vendor} error={[this.props.permissionDeleteError]} visible={true} type={'permissionDeleteError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  assetsError: state.concerto.assetsError,
  subAssetsError: state.concerto.subAssetsError,
  networksError: state.concerto.networksError,
  containersError: state.concerto.containersError,
  workflowsError: state.concerto.workflowsError,

  rolesError: state.concerto.rolesError,

  identityGroupsError: state.concerto.identityGroupsError,
  newIdentityGroupAddError: state.concerto.newIdentityGroupAddError,
  identityGroupDeleteError: state.concerto.identityGroupDeleteError,

  permissionsError: state.concerto.permissionsError,
  permissionAddError: state.concerto.permissionAddError,
  permissionModifyError: state.concerto.permissionModifyError,
  permissionDeleteError: state.concerto.permissionDeleteError,
}))(Permission);
