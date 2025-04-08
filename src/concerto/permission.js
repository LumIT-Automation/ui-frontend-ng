import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../_helpers/Rest'
import JsonHelper from '../_helpers/jsonHelper'
import Error from '../concerto/error'
import RolesDescription from './rolesDescription'
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin } from 'antd';

import { LoadingOutlined, ReloadOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { err } from './store'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const permLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

function Permission(props) {
  let [loading, setLoading] = useState(false);
  let [permissionsRefresh, setPermissionsRefresh] = useState(false);

  let [subAssets, setSubAssets] = useState([]);
  let [subAsset, setSubAsset] = useState(null);
  let [newIg, setNewIg] = useState('');
  let [newIgLoading, setNewIgLoading] = useState(false)
  let [delIg, setDelIg] = useState('');
  let [delIgLoading, setDelIgLoading] = useState(false)
  let [newIGShow, setNewIGShow] = useState(false);
  let [delIGShow, setDelIGShow] = useState(false);

  let [assets, setAssets] = useState([]);
  let [gotAssets, setGotAssets] = useState(false);
  let [asswSubAss, setAsswSubAss] = useState(false);
  
  let [roles, setRoles] = useState([]);
  let [identityGroups, setIdentityGroups] = useState([]);
  let [permissions, setPermissions] = useState([]);
  let [originPermissions, setOriginPermissions] = useState([]);

  let [errors, setErrors] = useState({});

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  const prevVendor = useRef(props.vendor);

  useEffect(() => {
    let sa, sas
    switch (props.vendor) {
      case 'infoblox':
        sa = 'network'
        sas = 'networks'
        break;
      case 'checkpoint':
        sa = 'domain'
        sas = 'domains'
        break;
      case 'f5':
        sa = 'partition'
        sas = 'partitions'
        break;
      case 'vmware':
        sa = 'object'
        sas = 'objects'
        break;

      default:
        sa = ''
        sas = ''
    }
    setSubAssets(sas);
    setSubAsset(sa);

  }, [props.vendor]);

  useEffect(() => {
    if (props.vendor !== 'workflow') {
      assetsGet()
    }
  }, [subAssets, subAsset]);

  useEffect(async () => {
    if (gotAssets) {
      setGotAssets(false)
      await assetWithSubAssets()
    }
  }, [gotAssets]);

  useEffect(() => {
    if (asswSubAss) {
      setAsswSubAss(false)
      main()
    }
  }, [asswSubAss]);

  useEffect(() => {
    if (permissionsRefresh) {
      setPermissionsRefresh(false)
      assetsGet()
    }
  }, [permissionsRefresh]);



  let assetsGet = async () => {
    let fetchedAssets

    setLoading(true)

    if (props.vendor !== 'superAdmin') {

      if (props.vendor === 'infoblox' ||
          props.vendor === 'checkpoint' ||
          props.vendor === 'f5' ||
          props.vendor === 'proofpoint' ||
          props.vendor === 'vmware') {

        fetchedAssets = await dataGet('assets')
        if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
          let error = Object.assign(fetchedAssets, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'assetsError'
          })
          props.dispatch(err(error))
          setLoading(false)
          return
        }
        else {
          let list = []
          fetchedAssets.data.items.forEach((item, i) => {
            item[subAssets] = []
            list.push(item)
          });
          setAssets(list)
        }
      }
      else {

      }
    }

    setGotAssets(true)
  }

  let main = async () => {
    let fetchedIdentityGroups,
    fetchedRoles,
    rolesNoWorkflow,
    fetchedPermissions,
    identityGroupsNoWorkflowLocal,
    permissionsNoWorkflowLocal,
    permissionsWithAssets    
    
    setNewIg('');
    setDelIg('');
    setNewIGShow(false);
    setDelIGShow(false);

    if (props.vendor !== 'superAdmin') {
      fetchedRoles = await dataGet('roles')
      if (fetchedRoles.status && fetchedRoles.status !== 200 ) {
        let error = Object.assign(fetchedRoles, {
          component: 'permission',
          vendor: 'concerto',
          errorType: 'rolesError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        rolesNoWorkflow = fetchedRoles.data.items.filter(r => r.role !== 'workflow');
        setRoles(rolesNoWorkflow)
      }

      fetchedIdentityGroups = await dataGet('identity-groups')
      if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
        let error = Object.assign(fetchedIdentityGroups, {
          component: 'permission',
          vendor: 'concerto',
          errorType: 'identityGroupsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
        setIdentityGroups(identityGroupsNoWorkflowLocal)
      }

    }

    fetchedPermissions = await dataGet('permissions')
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      let error = Object.assign(fetchedPermissions, {
        component: 'permission',
        vendor: 'concerto',
        errorType: 'permissionsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      permissionsNoWorkflowLocal = fetchedPermissions.data.items.filter(r => r.identity_group_name !== 'workflow.local');

      if (props.vendor === 'superAdmin') {
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
        setPermissions(list) 
        setOriginPermissions(list)
      }
      else {
        permissionsWithAssets = await permsWithAsset(permissionsNoWorkflowLocal)
        permissionsWithAssets.forEach((item, i) => {
          item.existent = true
          item.isModified = {}
        });
        setPermissions(permissionsWithAssets) 
        setOriginPermissions(permissionsWithAssets)
      }

    }

    setLoading(false)
  }

  let dataGet = async (entities, assetId, subAsset) => {
    let endpoint = `${props.vendor}/${entities}/`
    let r
    if (props.vendor === 'superAdmin') {
      endpoint = 'superadmins'
    }
    if (assetId) {
      endpoint = `${props.vendor}/${assetId}/${entities}/`
    }
    if (entities === 'tags') {
      endpoint = `${props.vendor}/${assetId}/${subAsset}/${entities}/?virtual`
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
    await rest.doXHR(endpoint, props.token)
    return r
  }

  let getTags = async (entities, assetId, subAsset) => {
    let fetchedTags = await dataGet(entities, assetId, subAsset)
    if (fetchedTags.status && fetchedTags.status !== 200 ) {
      let error = Object.assign(fetchedTags, {
        component: 'permission',
        vendor: 'concerto',
        errorType: 'tagsError'
      })
      props.dispatch(err(error))
      return
    }
    else {
      return fetchedTags.data.items
    }
  }

  let assetWithSubAssets = async () => {
    let assetsCopy = [...assets]
    let subAssetsFetched

    try {
      for (const asset of Object.values(assetsCopy)) {
        setAssets(assetsCopy)
        

        switch (subAssets) {
          case 'networks':
            subAssetsFetched = await networksGet(asset.id)
            break;
          case 'domains':
            subAssetsFetched = await dataGet('domains', asset.id)
            break;
          case 'partitions':
            subAssetsFetched = await dataGet('partitions', asset.id)
            break;
          case 'objects':
            subAssetsFetched = []
            break;
          default:
            subAssetsFetched = []
            break;
        }

        if (subAssetsFetched.status && subAssetsFetched.status !== 200 ) {
          let error = Object.assign(subAssetsFetched, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'subAssetsError'
          })
          props.dispatch(err(error))
          setAssets(assetsCopy)
          return
        }
        else {
          if (subAssetsFetched.data && subAssetsFetched.data.items) {
            asset[subAssets] = subAssetsFetched.data.items
          }
          else {
            asset[subAssets] = subAssetsFetched
          }

          setAssets(assetsCopy)
        }
      };
      setAsswSubAss(true)
    } catch(error) {
      console.log(error)
      setAsswSubAss(true)
    }
  }
  
  let networksGet = async (assetId) => {
    let nets = await dataGet('networks', assetId)
    if (nets.status && nets.status !== 200) {
      let error = Object.assign(nets, {
        component: 'permission',
        vendor: 'concerto',
        errorType: 'networksError'
      })
      props.dispatch(err(error))
      return
    }

    let containers = await dataGet('network-containers', assetId)
    if (containers.status && containers.status !== 200) {
      let error = Object.assign(containers, {
        component: 'permission',
        vendor: 'concerto',
        errorType: 'containersError'
      })
      props.dispatch(err(error))
      return
    }

    let networks = nets.data.concat(containers.data)
    return networks
  }

  let permsWithAsset = async (permissions) => {
    if (props.vendor === 'proofpoint') {
      try {
        Object.values(permissions).forEach((perm, i) => {
          let asset = assets.find(a => a.id === perm.id_asset)
          perm.asset = asset
          perm.assetFqdn = asset.fqdn
        });
        return permissions
      } catch(error) {
        console.log(error)
        return permissions
      }
    }
    try {
      Object.values(permissions).forEach((perm, i) => {
        let asset = assets.find(a => a.id === perm[subAsset].id_asset)
        perm.asset = asset
        perm.assetFqdn = asset.fqdn
      });
      return permissions
    } catch(error) {
      console.log(error)
      return permissions
    }
  }

  let permissionAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = [...permissions]

    permissions.forEach(p => {
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

    if (props.vendor === 'infoblox' ||
        props.vendor === 'checkpoint' ||
        props.vendor === 'f5' ||
        props.vendor === 'vmware') {
          p[subAsset] = {}
        }

    p.role = ''

    list = [p].concat(list)

    setPermissions(list)
  }

  let permissionRemove = async p => {
    let list = [...permissions]
    let newList = list.filter(n => {
      return p.id !== n.id
    })

    setPermissions(newList)
  }

  let set = async (key, value, permission) => {

    let assetsCopy = [...assets]
    let identityGroupsCopy = [...identityGroups]
    let permissionsCopy = [...permissions]
    let origPerm = originPermissions.find(p => p.id === permission.id)
    let perm = permissionsCopy.find(p => p.id === permission.id)

    if (key === 'details') {
      //onBlur
      /*let start = 0
      let end = 0
      let ref = textAreaRefs[permission.id]

      if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
        start = ref.resizableTextArea.textArea.selectionStart
        end = ref.resizableTextArea.textArea.selectionEnd
      }*/

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

      setPermissions([...permissionsCopy]);

      /*ref = textAreaRefs[permission.id]
      if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
        ref.resizableTextArea.textArea.selectionStart = start
        ref.resizableTextArea.textArea.selectionEnd = end
      }

      ref.focus()
      */
    }

    if (key === 'identity_group_identifier') {
      if (value) {
        let ig = identityGroupsCopy.find(i => i.identity_group_identifier === value)
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
        let asset = assetsCopy.find(a => a.id === value)
        if (perm.existent) {
          if (asset.id !== origPerm.asset.id) {
            perm.isModified.subAsset_assetId = true
            perm.isModified.subAsset_name = true
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            if (props.vendor !== 'proofpoint') {
              perm[subAsset] = {id_asset: value}
            }
            else {}
          }
          else {
            delete perm.isModified.subAsset_assetId
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            if (props.vendor !== 'proofpoint') {
              perm[subAsset] = {id_asset: value}
            }
            perm.isModified.subAsset_name = true
          }
        }
        else {
          perm.asset = asset
          perm.assetFqdn = asset.fqdn
          if (props.vendor !== 'proofpoint') {
            perm[subAsset] = {id_asset: value}
          }
        }
        delete perm.assetIdError
      }
    }

    if (key === 'subAsset') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm[subAsset].name) {
            perm.isModified.subAsset_name = true
            perm[subAsset].name = value
          }
          else {
            delete perm.isModified.subAsset_name
            perm[subAsset].name = value
          }
        }
        else {
          perm[subAsset].name = value
        }
        delete perm[`${subAsset}Error`]
        setPermissions([...permissionsCopy]);

        if (props.vendor === 'checkpoint' && value !== 'any') {
          perm.tagsLoading = true
          setPermissions([...permissionsCopy]);
          let tags = await getTags('tags', perm.asset.id, perm.domain.name)
          perm.domain.tags = tags 
          delete perm.tag
          perm.tagsLoading = false
          setPermissions([...permissionsCopy]);
        }
      }
    }

    if (key === 'refreshTags') {
      if (props.vendor === 'checkpoint' && value !== 'any') {
        perm.tagsLoading = true
        setPermissions([...permissionsCopy]);
        let tags = await getTags('tags', perm.asset.id, perm.domain.name)
        perm.domain.tags = tags 
        delete perm.tag

        permissions.forEach(p => {
          if(p.domain && p.domain.name === perm.domain.name) {
            p.domain.tags = tags 
          }
        });

        perm.tagsLoading = false
        setPermissions([...permissionsCopy]);
      }
    }

    if (key === 'tag') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm.tag) {
            perm.isModified.tag = true
            perm.tag = value
          }
          else {
            delete perm.isModified.tag
            perm.tag = value
          }
        }
        else {
          perm.tag = value
        }
        delete perm.tagError
      }
      setPermissions([...permissionsCopy]);
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
      setPermissions([...permissionsCopy]);
    }
    console.log(perm)

  }

  let newIdentityGroupHandler = async () => {
    let ig = JSON.parse(JSON.stringify(newIg))
    let identityGroupsCopy = [...identityGroups]
    let errorsCopy = {...errors}
    let identityGroupIds = []
    let body = {}

    identityGroupsCopy.forEach((item, i) => {
      identityGroupIds.push(item.identity_group_identifier)
    });

    if (ig === '') {
      errorsCopy.newIdentityGroup = 'Empty identity group.'
      setErrors(errorsCopy)
      return
    }
    else if (identityGroupIds.includes(ig)) {
      errorsCopy.newIdentityGroup = 'Identity group already exists.'
      setErrors(errorsCopy)
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
          errorsCopy.newIdentityGroup = 'Malformed DN.'
          setErrors(errorsCopy)
        }
        else {
          body.name = cns[0]
          body.identity_group_identifier = ig
          delete errorsCopy.newIdentityGroup
          setErrors(errorsCopy)

          setNewIgLoading(true)
          let newIg = await newIdentityGroupAdd(body)
          setNewIgLoading(false)

          if (newIg.status && newIg.status !== 201) {
            let error = Object.assign(newIg, {
              component: 'permission',
              vendor: 'concerto',
              errorType: 'newIdentityGroupAddError'
            })
            props.dispatch(err(error))
            return
          }
          else {
            let fetchedIdentityGroups = await dataGet('identity-groups')
            if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
              let error = Object.assign(fetchedIdentityGroups, {
                component: 'permission',
                vendor: 'concerto',
                errorType: 'identityGroupsError'
              })
              props.dispatch(err(error))
              setLoading(false)
              return
            }
            else {
              let identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
              setIdentityGroups(identityGroupsNoWorkflowLocal)
            }
          }
        }
      } catch(error) {
        console.log(error)
      }
    }
  }

  let newIdentityGroupAdd = async (data) => {
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
    await rest.doXHR(`${props.vendor}/identity-groups/`, props.token, b )
    return r
  }

  let delIdentityGroupHandler = async () => {
    setDelIgLoading(true)
    let response = await identityGroupDelete(delIg)


    if (response.status && response.status !== 200 ) {
      let error = Object.assign(response, {
        component: 'permission',
        vendor: 'concerto',
        errorType: 'identityGroupDeleteError'
      })
      props.dispatch(err(error))
      return
    }
    else {
      let fetchedIdentityGroups = await dataGet('identity-groups')
      if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
        let error = Object.assign(fetchedIdentityGroups, {
          component: 'permission',
          vendor: 'concerto',
          errorType: 'identityGroupsError'
        })
        props.dispatch(err(error))
        return
      }
      else {
        setDelIg('')
      }
    }
    setDelIgLoading(false)
    main()
  }

  let identityGroupDelete = async (data) => {
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
    await rest.doXHR(`${props.vendor}/identity-group/${data}/`, props.token)
    return r
  }

  let validation = async () => {
    let errors = await validationCheck()
    if (errors === 0) {
      cudManager()
    }
  }

  let validationCheck = async () => {
    let permissionsCopy = [...permissions]
    let errors = 0
    let jsonHelper = new JsonHelper()

    for (const perm of Object.values(permissionsCopy)) {
      if (!perm.identity_group_identifier) {
        ++errors
        perm.identity_group_identifierError = true
      }
      if (!perm.role) {
        perm.roleError = true
        ++errors
      }
      if (props.vendor === 'workflow') {
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
        if (props.vendor === 'proofpoint') {
          if (!perm.asset.id) {
            perm.assetIdError = true
            ++errors
          }
        }
        else if (!perm[subAsset].id_asset) {
          perm.assetIdError = true
          ++errors
        }
        else if (!perm[subAsset].name) {
          perm[`${subAsset}Error`] = true
          ++errors
        }
        else if (props.vendor === 'checkpoint' && !perm.tag) {
          perm.tagError = true
          ++errors
        }
        else {
          continue
        }

      }

    }
    setPermissions([...permissionsCopy]);
    return errors
  }

  let cudManager = async () => {
    let permissionsCopy = [...permissions]
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const perm of Object.values(permissionsCopy)) {
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

    if (toDelete.length > 0) {
      for await (const perm of toDelete) {
        //let per = permissions.find(p => p.id === perm.id)
        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permissionDelete(perm.id)
        if (p.status && p.status !== 200 ) {
          let error = Object.assign(p, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'permissionDeleteError'
          })
          props.dispatch(err(error))
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }
        else {
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }

      }
    }

    if (toPatch.length > 0) {
      for (const perm of toPatch) {
        let body = {}

        if (props.vendor === 'proofpoint') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
            "identity_group_identifier": perm.identity_group_identifier,
            "role": perm.role,
            "id_asset": perm.asset.id
          }
        }
        else if (props.vendor === 'checkpoint') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
            "identity_group_identifier": perm.identity_group_identifier,
            "role": perm.role,
            [subAsset]: {
              "name": perm[subAsset].name,
              "id_asset": perm[subAsset].id_asset
            },
            "tag": perm.tag
          }
        }
        else {
          body.data = {
            "identity_group_name": perm.identity_group_name,
            "identity_group_identifier": perm.identity_group_identifier,
            "role": perm.role,
            [subAsset]: {
              "name": perm[subAsset].name,
              "id_asset": perm[subAsset].id_asset
            }
          }
          if (props.vendor === 'vmware') {
            body.data[subAsset].moId = "any"
          }
        }

        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permModify(perm.id, body)
        if (p.status && p.status !== 200 ) {
          let error = Object.assign(p, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'permissionModifyError'
          })
          props.dispatch(err(error))
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }
        else {
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }

      }
    }

    if (toPost.length > 0) {
      for (const perm of toPost) {
        let body = {}

        if (props.vendor === 'proofpoint') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
            "identity_group_identifier": perm.identity_group_identifier,
            "role": perm.role,
            "id_asset": perm.asset.id
          }
        }
        else if (props.vendor === 'checkpoint') {
          body.data = {
            "identity_group_name": perm.identity_group_name,
            "identity_group_identifier": perm.identity_group_identifier,
            "role": perm.role,
            [subAsset]: {
              "name": perm[subAsset].name,
              "id_asset": perm[subAsset].id_asset
            },
            "tag": perm.tag
          }
        }
        else {
          body.data = {
             "identity_group_name": perm.identity_group_name,
             "identity_group_identifier": perm.identity_group_identifier,
             "role": perm.role,
             [subAsset]: {
                 "name": perm[subAsset].name,
                 "id_asset": perm[subAsset].id_asset
             }
          }
          if (props.vendor === 'vmware') {
            body.data[subAsset].moId = "any"
          }
        }

        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permAdd(body)
        if (p.status && p.status !== 201 ) {
          let error = Object.assign(p, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'permissionAddError'
          })
          props.dispatch(err(error))
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }
        else {
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }

      }
    }

    setPermissionsRefresh(true)
  }

  let permissionDelete = async (permissionId) => {
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
    await rest.doXHR(`${props.vendor}/permission/${permissionId}/`, props.token )
    return r
  }

  let permModify = async (permId, body) => {
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
    await rest.doXHR(`${props.vendor}/permission/${permId}/`, props.token, body )
    return r
  }

  let permAdd = async (body) => {
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
    await rest.doXHR(`${props.vendor}/permissions/`, props.token, body )
    return r
  }

  let returnCol = () => {
    let newArray = []
    if (props.vendor === 'superAdmin') {
      newArray = superAdminColumns.filter(value => Object.keys(value).length !== 0);
      return newArray
    }
    else if (props.vendor === 'checkpoint') {
      newArray = checkpointColumns.filter(value => Object.keys(value).length !== 0);
      return newArray 
    }
    else if (props.vendor === 'proofpoint') {
      newArray = proofpointColumns.filter(value => Object.keys(value).length !== 0);
      return newArray 
    }
    else {
      newArray = vendorColumns.filter(value => Object.keys(value).length !== 0);
      return newArray 
    }
  }

  let superAdminColumns = [
    {
      title: 'AD group name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps(
        'name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Distinguished name',
      align: 'center',
      dataIndex: 'dn',
      key: 'dn',
      ...getColumnSearchProps(
        'dn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
  ];

  let proofpointColumns = [
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
      ...getColumnSearchProps(
        'identity_group_name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Distinguished name',
      align: 'center',
      dataIndex: 'identity_group_identifier',
      key: 'identity_group_identifier',
      ...getColumnSearchProps(
        'identity_group_identifier', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('identity_group_identifier', value, obj )}
        >
          { identityGroups.map((ig, i) => {
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
      ...getColumnSearchProps(
        'assetFqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('assetId', value, obj )}
        >
          { assets.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            })
          }
        </Select>
      ),
    },
    {
      title: <RolesDescription vendor={props.vendor} title={`roles' description`}/>,
      align: 'center',
      dataIndex: 'role',
      key: 'role',
      ...getColumnSearchProps(
        'role', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('role', value, obj )}
        >
          { (roles ? roles.map((role, i) => {
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
              onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => permissionRemove(obj)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  let checkpointColumns = [
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
      ...getColumnSearchProps(
        'identity_group_name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Distinguished name',
      align: 'center',
      dataIndex: 'identity_group_identifier',
      key: 'identity_group_identifier',
      ...getColumnSearchProps(
        'identity_group_identifier', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('identity_group_identifier', value, obj )}
        >
          { identityGroups.map((ig, i) => {
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
      ...getColumnSearchProps(
        'assetFqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('assetId', value, obj )}
        >
          { assets.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            })
          }
        </Select>
      ),
    },
    {
      title: subAsset,
      align: 'center',
      dataIndex: [subAsset, 'name' ],
      key: subAsset,
      ...getColumnSearchProps(
        [subAsset, 'name' ], 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => (
          <Select
            value={obj && obj[subAsset] ? obj[subAsset].name : null}
            disabled={obj && obj[subAsset] && !obj[subAsset].id_asset ? true : false}
            showSearch
            style=
            { obj[`${subAsset}Error`] ?
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
            onSelect={value => set('subAsset', value, obj )}
          >
            {obj && obj.role && obj.role === 'admin' ?
              <Select.Option key={'any'} value={'any'}>any</Select.Option>
            :
              <React.Fragment>
                <Select.Option key={'any'} value={'any'}>any</Select.Option>
                { (obj && obj.asset && obj.asset[subAssets]) ? obj.asset[subAssets].map((sub, i) => {
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
    {
      title: 'Tags',
      align: 'center',
      key: 'tag',
      render: (name, obj)  => {
        return (
          <React.Fragment>
            {obj && obj.domain && obj.domain.name === 'any' ?
              <Input
                defaultValue={obj && obj.tag ? obj.tag : null}
                style={
                  obj.tagError ?
                    {borderColor: 'red', textAlign: 'center', width: 150}
                  :
                    {textAlign: 'center', width: 150}
                }
                onBlur={e => {
                  set('tag', e.target.value, obj)
                }
                }
              />
            :
              <React.Fragment>
                {obj.tagsLoading ? 
                  <Spin indicator={permLoadIcon} style={{margin: '10% 10%'}}/>
                :
                  <div
                    style={{display: 'flex', alignItems: 'center'}}
                  >
                    <Select
                      value={obj && obj.tag ? obj.tag : null}
                      disabled={obj && obj[subAsset] && !obj[subAsset].name ? true : false}
                      showSearch
                      style=
                      { obj[`tagError`] ?
                        {width: '65%', border: `1px solid red`}
                      :
                        {width: '65%'}
                      }
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                      }
                      onSelect={value => set('tag', value, obj )}
                    >
                      <React.Fragment>
                        { obj && obj.domain && obj.domain.tags && obj.domain.tags.length > 0 ? obj.domain.tags.map((tag, i) => {
                            return (
                              <Select.Option key={i} value={tag.name ? tag.name : ''}>{tag.name ? tag.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    </Select>

                    <Radio.Group
                      style={{marginLeft: 20}}
                    >
                      <Radio.Button
                        disabled={obj && obj.domain && !obj.domain.name ? true : false}
                        onClick={() => set('refreshTags', true, obj )}
                      >
                        <ReloadOutlined/>
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                
                }

              </React.Fragment>
            }

          </React.Fragment>
         )
      },
    },
    {
      title: <RolesDescription vendor={props.vendor} title={`roles' description`}/>,
      align: 'center',
      dataIndex: 'role',
      key: 'role',
      ...getColumnSearchProps(
        'role', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('role', value, obj )}
        >
          { (roles ? roles.map((role, i) => {
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
              onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => permissionRemove(obj)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  let vendorColumns = [
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
      ...getColumnSearchProps(
        'identity_group_name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Distinguished name',
      align: 'center',
      dataIndex: 'identity_group_identifier',
      key: 'identity_group_identifier',
      ...getColumnSearchProps(
        'identity_group_identifier', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('identity_group_identifier', value, obj )}
        >
          { identityGroups.map((ig, i) => {
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
      ...getColumnSearchProps(
        'assetFqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('assetId', value, obj )}
        >
          { assets.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            })
          }
        </Select>
      ),
    },
    ...(
      props.vendor === 'infoblox' ?
        [
          {
            title: subAsset,
            align: 'center',
            dataIndex: [subAsset, 'name' ],
            key: subAsset,
            ...getColumnSearchProps(
              [subAsset, 'name' ], 
              searchInput, 
              (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
              (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
              searchText, 
              searchedColumn, 
              setSearchText, 
              setSearchedColumn
            ),
            render: (name, obj)  => (
                <Select
                  value={obj && obj[subAsset] ? obj[subAsset].name : null}
                  disabled={obj && obj[subAsset] && !obj[subAsset].id_asset ? true : false}
                  showSearch
                  style=
                  { obj[`${subAsset}Error`] ?
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
                  onSelect={value => set('subAsset', value, obj )}
                >
                  {obj && obj.role && obj.role === 'admin' ?
                    <Select.Option key={'any'} value={'any'}>any</Select.Option>
                  :
                    <React.Fragment>
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                      { (obj && obj.asset && obj.asset[subAssets]) ? obj.asset[subAssets].map((sub, i) => {
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
            title: subAsset,
            align: 'center',
            dataIndex: [subAsset, 'name' ],
            key: subAsset,
            ...getColumnSearchProps(
              [subAsset, 'name' ], 
              searchInput, 
              (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
              (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
              searchText, 
              searchedColumn, 
              setSearchText, 
              setSearchedColumn
            ),
            render: (name, obj)  => (
                <Select
                  value={obj && obj[subAsset] ? obj[subAsset].name : null}
                  disabled={obj && obj[subAsset] && !obj[subAsset].id_asset ? true : false}
                  showSearch
                  style=
                  { obj[`${subAsset}Error`] ?
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
                  onSelect={value => set('subAsset', value, obj )}
                >
                  {obj && obj.role && obj.role === 'admin' ?
                    <Select.Option key={'any'} value={'any'}>any</Select.Option>
                  :
                    <React.Fragment>
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                      { (obj && obj.asset && obj.asset[subAssets]) ? obj.asset[subAssets].map((sub, i) => {
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
      title: <RolesDescription vendor={props.vendor} title={`roles' description`}/>,
      align: 'center',
      dataIndex: 'role',
      key: 'role',
      ...getColumnSearchProps(
        'role', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
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
          onSelect={value => set('role', value, obj )}
        >
          { (roles ? roles.map((role, i) => {
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
              onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => permissionRemove(obj)}
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

  let errorsComponent = () => {
    if (props.error && props.error.component === 'permission') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <>
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
      <React.Fragment>

      <Radio.Group>
        <Radio.Button
          style={{marginLeft: 16 }}
          onClick={() => setPermissionsRefresh(true)}
        >
          <ReloadOutlined/>
        </Radio.Button>
      </Radio.Group>

      {(props.vendor !== 'superAdmin') ?
        <Radio.Group
          buttonStyle="solid"
        >
          <Radio.Button
            style={{marginLeft: 16 }}
            onClick={() => permissionAdd()}
          >
            Add permission
          </Radio.Button>

          <Radio.Button
            style={{marginLeft: 16 }}
            buttonStyle="solid"
            onClick={() => {
              setNewIGShow(true)
              setDelIGShow(false)
            }
            }
          >
            New identity group
          </Radio.Button>

          <Radio.Button
            style={{ backgroundColor: 'red', borderColor: 'red'}}
            onClick={() => {
              setNewIGShow(false)
              setDelIGShow(true)
            }
            }
          >
            Delete identity group
          </Radio.Button>
        </Radio.Group>
      :
        null
      }

      { (newIGShow && props.vendor !== 'superAdmin') ?
        <React.Fragment>
        <br/>
        <br/>
        { newIgLoading ?
            <Spin indicator={permLoadIcon} style={{marginLeft: '16px', marginRight: '8px'}}/>
          :
            <Input
              style={{width: 350, marginLeft: 16}}
              value={newIg}
              placeholder="cn= ,cn= ,dc= ,dc= "
              suffix={
                <CloseCircleOutlined onClick={() => {
                  let errorsCopy = {...errors}
                  delete errorsCopy.newIdentityGroup
                  setNewIg('')
                  setErrors(errorsCopy)
                }
                }
                />
              }
              onChange={e => setNewIg(e.target.value)}
            />
        }
          <Button
            type='primary'
            style={{marginLeft: 8}}
            onClick={() => newIdentityGroupHandler()}
          >
            Add
          </Button>
          <Button
            style={{marginLeft: 8}}
            onClick={() => {
              let errorsCopy = {...errors}
              delete errorsCopy.newIdentityGroup
              setNewIg('')
              setErrors(errorsCopy)
              setNewIGShow(false)
            }
            }
          >
            Hide
          </Button>
          <p style={{marginLeft: '16px', color: 'red'}}>{errors.newIdentityGroup}</p>
        </React.Fragment>
        :
        null
      }
      { (delIGShow && props.vendor !== 'superAdmin') ?
        <React.Fragment>
        <br/>
        <br/>
        { delIgLoading ?
            <Spin indicator={permLoadIcon} style={{marginLeft: '16px', marginRight: '8px'}}/>
          :
            <Select
              value={delIg}
              showSearch
              style={{width: 350, marginLeft: 16}}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={e => setDelIg(e)}
            >
              { identityGroups.map((ig, i) => {
                  return (
                    <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                  )
                })
              }
            </Select>

        }
          <Button
            type="primary"
            danger
            style={{marginLeft: 8}}
            onClick={() => delIdentityGroupHandler()}
          >
            Delete
          </Button>
          <Button
            style={{marginLeft: 8}}
            onClick={() => {
              let errorsCopy = {...errors}
              delete errorsCopy.delIdentityGroup
              setDelIg('')
              setErrors(errorsCopy)
              setDelIGShow(false)
            }
            }
          >
            Hide
          </Button>
          <p style={{marginLeft: '16px', color: 'red'}}>{errors.delIdentityGroup}</p>
        </React.Fragment>
        :
        null
      }


      <br/>
      <Table
        columns={returnCol()}
        style={{width: '100%', padding: 15}}
        dataSource={permissions}
        bordered
        rowKey={randomKey}
        scroll={{x: 'auto'}}
        pagination={{ pageSize: 10 }}
      />
      {(props.vendor !== 'superAdmin') ?
        <Button
          type="primary"
          style={{float: 'right', marginRight: 15}}
          onClick={() => validation()}
        >
          Commit
        </Button>
      :
        null
      }

    </React.Fragment>
      }
      {errorsComponent()}
    </>
    
  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

}))(Permission);