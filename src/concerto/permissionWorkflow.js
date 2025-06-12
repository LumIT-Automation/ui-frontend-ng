import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';
import '../table.css'

import Rest from '../_helpers/Rest';
import JsonHelper from '../_helpers/jsonHelper';
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error';
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin } from 'antd';
import { LoadingOutlined, ReloadOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { err } from './store';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const permLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function PermissionWorkflow(props) {
  let [forceRefresh, setForceRefresh] = useState([])
  let [loading, setLoading] = useState(false);
  let [assets, setAssets] = useState([]);

  let [newIGShow, setNewIGShow] = useState(false);
  let [newIg, setNewIg] = useState('');
  let [newIgLoading, setNewIgLoading] = useState(false)

  let [assetsInfoblox, setAssetsInfoblox] = useState([]);
  let [assetsCheckpoint, setAssetsCheckpoint] = useState([]);
  let [assetsF5, setAssetsF5] = useState([]);

  let [gotAssets, setGotAssets] = useState(false);
  let [identityGroups, setIdentityGroups] = useState([]);
  let [workflows, setWorkflows] = useState([]);

  let [gotPermissions, setGotPermissions] = useState(false);

  let [permissionsRefresh, setPermissionsRefresh] = useState(false);
  let [permissions, setPermissions] = useState([]);
  let [origPermissions, setOrigPermissions] = useState([]);
  
  let [expandedRowKeys, setExpandedRowKeys] = useState([]); // Stato per le righe espanse

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);
  let [errors, setErrors] = useState({})
  let [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (props.vendor) {
      setNewIg('');
      setNewIGShow(false);
      assetsGet()
      igsGet()
      workflowsGet()
    }
  }, [props.vendor]);

  useEffect(() => {
    if (permissionsRefresh) {
      setPermissionsRefresh(false)
      assetsGet()
      igsGet()
      workflowsGet()
    }
  }, [permissionsRefresh]);

  useEffect(() => {    
    if (gotAssets) {
      permissionsGet();
      setGotAssets(false)
    }
  }, [gotAssets]);

  useEffect(() => {    
    if (gotPermissions) {
      permsWithAsset();
      setGotPermissions(false)
    }
    
  }, [gotPermissions]);

  useEffect(() => {    
    if (forceRefresh.length > 0) {
      refreshTagsHandler(forceRefresh[0], forceRefresh[1]);
      setForceRefresh([])
    }
  }, [forceRefresh]);


  const assetsGet = async () => {
    setLoading(true);
    let vendors = ['infoblox', 'checkpoint', 'f5']
    let list = JSON.parse(JSON.stringify(assets));

    for await (const vendor of vendors) {
      try {
        let data = await dataGet(`${vendor}/assets/`);
        if (data.status && data.status !== 200) {
          let error = Object.assign(data, {
            component: 'permissionWorkflow',
            vendor: 'concerto',
            errorType: `get ${vendor} assets Error`,
          });
          props.dispatch(err(error));
        } else {
          let vendorAssets = data.data.items
          for await (const asset of vendorAssets) {
            let subAssets, saLabel
            if (vendor === 'infoblox'){
              subAssets = await networksGet(asset.id)
              saLabel = 'networks'
            }
            else if (vendor === 'checkpoint') {
              subAssets = await dataGet(`${vendor}/${asset.id}/domains/`, asset.id)
              saLabel = 'domains'
            }
            else if (vendor === 'f5') {
              subAssets = await dataGet(`${vendor}/${asset.id}/partitions/`, asset.id)
              saLabel = 'partitions'
            }
            if (subAssets.status && subAssets.status !== 200) {
              let error = Object.assign(subAssets, {
                component: 'permissionWorkflow',
                vendor: 'concerto',
                errorType: `get ${vendor} assets Error`,
              });
              props.dispatch(err(error));
            } else {
              if (subAssets.data && subAssets.data.items) {
                asset[saLabel] = subAssets.data.items
              }
              else {
                asset[saLabel] = subAssets
              }
            }

            if (vendor === 'infoblox'){
              setAssetsInfoblox(vendorAssets)
            }
            else if (vendor === 'checkpoint') {
              setAssetsCheckpoint(vendorAssets)
            }
            else if (vendor === 'f5') {
              setAssetsF5(vendorAssets)
            }

          }
          list.push({[vendor]: vendorAssets})   
        }
      }
      catch (error) {
        console.log(error)
      }
    }
    setAssets(list)
    setLoading(false);
    setGotAssets(true)
  };

  const igsGet = async () => {
    setLoading(true);
    let data = await dataGet('identity-groups/')
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'permissionWorkflow',
          vendor: 'concerto',
          errorType: 'identityGroupsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setIdentityGroups(data.data.items)
      }
  }

  const workflowsGet = async () => {
    setLoading(true);
    let data = await dataGet('workflows/')
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'permissionWorkflow',
          vendor: 'concerto',
          errorType: 'workflowsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setWorkflows(data.data.items)
      }
  }

  let networksGet = async (assetId) => {
    let nets = await dataGet(`infoblox/${assetId}/networks/`)
    if (nets.status && nets.status !== 200) {
      let error = Object.assign(nets, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'networksError'
      })
      props.dispatch(err(error))
      return
    }

    let containers = await dataGet(`infoblox/${assetId}/network-containers/`, assetId)
    if (containers.status && containers.status !== 200) {
      let error = Object.assign(containers, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'containersError'
      })
      props.dispatch(err(error))
      return
    }

    let networks = nets.data.concat(containers.data)
    return networks
  }

  const permissionsGet = async () => {
    setLoading(true);
    let data = await dataGet('workflow-permissions/');
    if (data.status && data.status !== 200) {
      let error = Object.assign(data, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'permissionWorkflowError',
      });
      props.dispatch(err(error));
    } else {
      const itemsWithIds = data.data.items.map((item, index) => ({
        ...item,
        id: index + 1, // L'id parte da 1 invece che da 0 
      }));

      let addNetworkKeyifInfoblox = itemsWithIds.map((item, index) => {
        if (item.infoblox && Array.isArray(item.infoblox) && item.infoblox.length > 0) {
          item.infoblox.map((i, index) => {
            if (i.network && i.network.name) {
              i.network.network = i.network.name
              return i
            }
          })
        }
        return item
      });
      setPermissions(addNetworkKeyifInfoblox);
    }
    setLoading(false);
    setGotPermissions(true)
  };

  const dataGet = async (endpoint) => {
    let r;

    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(endpoint, props.token);
    return r;
  };

  function findAssetById(type, id) {
    const assetGroup = assets.find(asset => asset[type]);
    if (assetGroup) {
        return assetGroup[type].find(asset => asset.id === id) || null;
    }
    return null;
  }

  let permsWithAsset = async () => {
    let copyPermissions = JSON.parse(JSON.stringify(permissions));

    copyPermissions.forEach(copyPermission => {
      ['f5', 'infoblox', 'checkpoint'].forEach(type => {
        // Controlla se esiste e se è un array
        if (Array.isArray(copyPermission[type])) {
          copyPermission[type].forEach(entry => {
            const idAsset = entry[type === 'f5' ? 'partition' : type === 'infoblox' ? 'network' : 'domain'].id_asset;
            const asset = findAssetById(type, idAsset);
            if (asset) {
              entry.asset = { ...asset }; 
              entry.assetFqdn = asset.fqdn
              entry.existent = true
              entry.isModified = {}
            }
          });
        }
      });
    });

    copyPermissions.forEach((item, i) => {
      item.existent = true
      item.isModified = {}
    });

    setPermissions([...copyPermissions]);

    setOrigPermissions(JSON.parse(JSON.stringify(copyPermissions)));
  }

  let getTags = async (entities, assetId, subAsset) => {
    let fetchedTags = await dataGet(`checkpoint/${assetId}/${subAsset}/tags/`)
    if (fetchedTags.status && fetchedTags.status !== 200 ) {
      let error = Object.assign(fetchedTags, {
        component: 'permissionWorkflow',
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



  let itemAdd = async (items, type) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(items, type);
    setPermissions([...list]);  
  };

  let itemRemove = async (item, items) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, items);
    setPermissions([...list]);  
  };

  let subItemAdd = async (record, tech) => {
    let permissionsCopy = [...permissions]
    let perm = permissionsCopy.find(p => p.id === record.id)
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(record[tech]);
    perm[tech] = list 
    perm[tech].forEach(element => {
      if (!element.existent) {
        element.workflow = perm.workflow
        element.identity_group_identifier = perm.identity_group_identifier
        let str = perm.identity_group_identifier ? perm.identity_group_identifier.split(',') : ''
        let cn = str ? str[0].split('=') : null
        element.identity_group_name = cn[1] ? cn[1] : ''
        if (tech === 'infoblox') {
          if (!element.network) {
            element.network = {}
          }
          if (element.network && !element.network.network) {
            element.network.network = ''
          }
          if (element.network && !element.network.id_asset) {
            element.network.id_asset = null
          }
        }
        if (tech === 'checkpoint') {
          if (!element.domain) {
            element.domain = {}
          }
          if (element.domain && !element.domain.name) {
            element.domain.name = ''
          }
          if (element.domain && !element.domain.id_asset) {
            element.domain.id_asset = null
          }
        }
        if (tech === 'f5') {
          if (!element.partition) {
            element.partition = {}
          }
          if (element.partition && !element.partition.name) {
            element.partition.name = ''
          }
          if (element.partition && !element.partition.id_asset) {
            element.partition.id_asset = null
          }
        }
      }
    });
    //inizializzare il bubper con workflo, ig, partition, id_asset, name
    setPermissions([...permissionsCopy]);  
  };

  let subItemRemove = async (item, father, tech) => {
    let permissionsCopy = [...permissions]
    let perm = permissionsCopy.find(p => p.id === father.id)

    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, father[tech]);

    if (list.length < 1) {
      let o = {}
      o.id = 1
      o.workflow = perm.workflow
      o.identity_group_identifier = perm.identity_group_identifier
      let str = perm.identity_group_identifier ? perm.identity_group_identifier.split(',') : ''
      let cn = str ? str[0].split('=') : null
      o.identity_group_name = cn[1] ? cn[1] : ''
      if (tech === 'infoblox') {
        o.network = {
          network: '',
          id_asset: null,
        }
      }
      if (tech === 'checkpoint') {
        o.domain = {
          name: '',
          id_asset: null,
        }
      }
      if (tech === 'f5') {
        o.partition = {
          name: '',
          id_asset: null,
        }
      }
      list.push(o)
    }
    perm[tech] = list 
    setPermissions([...permissionsCopy]);  
  };

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
    }
    else if (identityGroupIds.includes(ig)) {
      errorsCopy.newIdentityGroup = 'Identity group already exists.'
      setErrors(errorsCopy)
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
              component: 'permissionWorkflow',
              vendor: 'concerto',
              errorType: 'newIdentityGroupAddError'
            })
            props.dispatch(err(error))
          }
          else {
            setLoading(true)
            let fetchedIdentityGroups = await dataGet('identity-groups/')
            if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
              let error = Object.assign(fetchedIdentityGroups, {
                component: 'permissionWorkflow',
                vendor: 'concerto',
                errorType: 'identityGroupsError'
              })
              props.dispatch(err(error))
              
            }
            else {
              let identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
              setIdentityGroups(identityGroupsNoWorkflowLocal)
              setLoading(false)
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
    await rest.doXHR(`identity-groups/`, props.token, b )
    return r
  }


  let set = async (key, value, permission, child, tech) => { 
    
    let permissionsCopy = JSON.parse(JSON.stringify(permissions))
    let origPermissionsCopy = JSON.parse(JSON.stringify(origPermissions))
    let perm = permissionsCopy.find(p => p.id === permission.id)
    let identityGroupsCopy = [...identityGroups]
    let workflowsCopy = [... workflows]

    if (key === 'workflow') {
      if (value) {
        if (perm.infoblox) {
          delete perm.infoblox
        }
        if (perm.checkpoint) {
          delete perm.checkpoint
        }
        if (perm.f5) {
          delete perm.f5
        }
        
        let w = workflowsCopy.find(i => i.name === value)
        perm.workflow = w.name

        if (w.technologies.includes('infoblox')) {
          perm.infoblox = [
            {
              id:1,
              network: {
              }
            }
          ]
        }
        if (w.technologies.includes('checkpoint')) {
          perm.checkpoint = [
            {
              id:1,
              domain: {
              },
              tag: ""
            }
          ]
        }
        if (w.technologies.includes('f5')) {
          perm.f5 = [
            {
              id:1,
              partition: {
              }
            }
          ]
        }

        delete perm.workflowError
      }
    }

    if (key === 'identity_group_identifier') {
      if (value) {
        let ig = identityGroupsCopy.find(i => i.identity_group_identifier === value)
        perm.identity_group_identifier = ig.identity_group_identifier
        if (ig.technologies && ig.technologies.length > 0) {
          ig.technologies.forEach(item => {
            let tech = item.technology;
            if (tech && !(tech in perm)) {
                perm[tech] = []; 
            }
        });
        }
        delete perm.identity_group_identifierError
      }
    }

    if (key === 'asset') {
      let list = []
      if (tech === 'infoblox') {
        list = JSON.parse(JSON.stringify(assetsInfoblox))
      } 
      if (tech === 'checkpoint') {
        list = JSON.parse(JSON.stringify(assetsCheckpoint))
      } 
      if (tech === 'f5') {
        list = JSON.parse(JSON.stringify(assetsF5))
      } 

      let asset = list.find(a => a.id === value)
      let subPerm = perm[tech].find(sp => sp.id === child.id)
      subPerm.asset = asset
      subPerm.assetFqdn = asset.fqdn

      if (perm.existent) {
        if (perm.isModified[tech]) {
          if (perm.isModified[tech][subPerm.id]) {
            perm.isModified[tech][subPerm.id].asset = true
          } 
          else {
            perm.isModified[tech][subPerm.id] = {}
            perm.isModified[tech][subPerm.id].asset = true
          } 
        } 
        else {
          perm.isModified[tech] = {}
          perm.isModified[tech][subPerm.id] = {}
          perm.isModified[tech][subPerm.id].asset = true
        }  
      }

      if (tech === 'infoblox') {
        subPerm.network.id_asset = asset.id
        
        //orig
        if (subPerm.existent) {
          subPerm.isModified = true
        }
      } 
      if (tech === 'checkpoint') {
        subPerm.domain.id_asset = asset.id
         //orig
        if (subPerm.existent) {
          subPerm.isModified = true
        }
      } 
      if (tech === 'f5') {
        subPerm.partition.id_asset = asset.id
        if (subPerm.existent) {
           //orig
          subPerm.isModified = true
        }
        
      } 
      delete subPerm.assetError      
    }

    if (key === 'subAsset') {
      let subPerm = perm[tech].find(sp => sp.id === child.id)

      if (perm.existent) {
        if (perm.isModified[tech]) {
          if (perm.isModified[tech][subPerm.id]) {
            perm.isModified[tech][subPerm.id].subAsset = true
          } 
          else {
            perm.isModified[tech][subPerm.id] = {}
            perm.isModified[tech][subPerm.id].subAsset = true
          } 
        } 
        else {
          perm.isModified[tech] = {}
          perm.isModified[tech][subPerm.id] = {}
          perm.isModified[tech][subPerm.id].subAsset = true
        }  
      }
    
      if (tech === 'infoblox') {
        subPerm.network.network = value 
      } 
      if (tech === 'checkpoint') {
        subPerm.domain.name = value
        setPermissions([...permissionsCopy]);
        setForceRefresh([perm, subPerm])     
      } 
      if (tech === 'f5') {
        subPerm.partition.name = value
      } 
      delete subPerm.subAssetError      
    }

    if (key === 'tag') {
      let subPerm = perm[tech].find(sp => sp.id === child.id)
      
      if (perm.existent) {
        if (perm.isModified[tech]) {
          if (perm.isModified[tech][subPerm.id]) {
            perm.isModified[tech][subPerm.id].tag = true
          } 
          else {
            perm.isModified[tech][subPerm.id] = {}
            perm.isModified[tech][subPerm.id].tag = true
          } 
        } 
        else {
          perm.isModified[tech] = {}
          perm.isModified[tech][subPerm.id] = {}
          perm.isModified[tech][subPerm.id].tag = true
        }  
      }

      if (tech === 'checkpoint') {
        subPerm.tag = value
         //orig
        if (subPerm.existent) {
          subPerm.isModified = true
        }
      } 
    }

    if (key === 'refreshTags') {
      let subPerm = perm[tech].find(sp => sp.id === child.id)
      let asset = assetsCheckpoint.find(a => a.id = subPerm.asset.id)

      if (value !== 'any') {
        subPerm.tagsLoading = true
        setPermissions([...permissionsCopy]);
        let tags = await getTags('tags', subPerm.asset.id, subPerm.domain.name)
        permissionsCopy = JSON.parse(JSON.stringify(permissions))
        perm = permissionsCopy.find(p => p.id === permission.id)
        subPerm = perm[tech].find(sp => sp.id === child.id)
        subPerm.asset = asset
        subPerm.assetFqdn = asset.fqdn
        subPerm.tags = tags 
        delete subPerm.tag

        permissionsCopy.forEach(p => {
          if (p.checkpoint) {
            p.checkpoint.forEach(subP => {
              if (subP.domain && subP.domain.name === subPerm.domain.name) {
                subP.tags = tags 
              }
            })
          }
        })

        subPerm.tagsLoading = false
        setPermissions([...permissionsCopy]);
      }
    }

    if (key === 'subPermDel') {
      let subPerm = perm[tech].find(sp => sp.id === child.id)
      if (perm.existent) {
        if (value) {
          if (perm.isModified[tech]) {
            if (perm.isModified[tech][subPerm.id]) {
              perm.isModified[tech][subPerm.id].toDelete = true
            } 
            else {
              perm.isModified[tech][subPerm.id] = {}
              perm.isModified[tech][subPerm.id].toDelete = true
            } 
          } 
          else {
            perm.isModified[tech] = {}
            perm.isModified[tech][subPerm.id] = {}
            perm.isModified[tech][subPerm.id].toDelete = true
          }  
          subPerm.toDelete = true
        }
        else {
          delete perm.isModified[tech][subPerm.id].toDelete
          delete subPerm.toDelete
        }        
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

    setPermissions([...permissionsCopy]);
  }


  let refreshTagsHandler = async(permLocal, subPermLocal) => {
    let permissionsCopy = JSON.parse(JSON.stringify(permissions))
    let perm = permissionsCopy.find(p => p.id === permLocal.id)
    let subPerm = perm['checkpoint'].find(sp => sp.id === subPermLocal.id)
    let tags = []
      /*
      If there are already tags for that specific domain do not call backend
      */
      let shouldSkip = false 

      for (let p of permissionsCopy) {

        if (shouldSkip) {
          break 
        }
        if (p.checkpoint) {
          for (let subP of p.checkpoint) {
            if (subP.domain && (subP.domain.name === subPerm.domain.name)) {
              if (subP.tags && subP.tags.length > 0) {
                tags = subP.tags
                shouldSkip = true
              }
            }
          }
        }
      }

      if (tags.length === 0) {                    
        subPerm.tagsLoading = true
        setPermissions([...permissionsCopy]);
        tags = await getTags('tags', subPerm.asset.id, subPerm.domain.name)
        subPerm.tagsLoading = false
        setPermissions([...permissionsCopy]);
      }
      
      perm = permissionsCopy.find(p => p.id === permLocal.id)
      subPerm = perm['checkpoint'].find(sp => sp.id === subPermLocal.id)
      subPerm.tags = tags
      delete subPerm.tag

      /*get tags for one specific domain 
      and spread on every checkpoint subpermissions 
      with the same domain*/
      permissionsCopy.forEach(p => {
        if (p.checkpoint) {
          p.checkpoint.forEach(subP => {
            if (subP.domain && subP.domain.name === subPerm.domain.name) {
              subP.tags = tags 
            }
          })
        }
      })

      setPermissions([...permissionsCopy]);
  }

  let validationCheck = async () => {
    try {
      let permissionsCopy = [...permissions]
      let errors = 0
      let jsonHelper = new JsonHelper()
      let workflowsCopy = [... workflows]

      for (const perm of Object.values(permissionsCopy)) {
        if (!perm.identity_group_identifier) {
          ++errors
          perm.identity_group_identifierError = true
        }

        if (!perm.workflow) {
          ++errors
          perm.workflowError = true
        }
        else {
          let w = workflowsCopy.find(o => o.name === perm.workflow)
          if (w && w.technologies && w.technologies.length > 0) {
            if (w.technologies.includes('infoblox')) {
              if (!perm.infoblox || (perm.infoblox && perm.infoblox.length < 1)) {
                //missing technologiy
              }
              if (perm.infoblox && perm.infoblox.length > 0) {
                perm.infoblox.forEach(element => {
                  if (element.network && !element.network.id_asset) {
                    ++errors
                    element.assetError = true
                  }
                  if (element.network && !element.network.network) {
                    ++errors
                    element.subAssetError = true
                  }
                });
    
              }
            }
            if (w.technologies.includes('checkpoint')) {
              if (!perm.checkpoint || (perm.checkpoint && perm.checkpoint.length < 1)) {
                //missing technologiy
              }
              if (perm.checkpoint && perm.checkpoint.length > 0) {
                perm.checkpoint.forEach(element => {
                  if (element.domain && !element.domain.id_asset) {
                    ++errors
                    element.assetError  = true
                  }
                  if (element.domain && !element.domain.name) {
                    ++errors
                    element.subAssetError = true
                  }
                });
    
              }
            }
            if (w.technologies.includes('f5')) {
              if (!perm.f5 || (perm.f5 && perm.f5.length < 1)) {
                //missing technologiy
              }
              if (perm.f5 && perm.f5.length > 0) {
                perm.f5.forEach(element => {
                  if (element.partition && !element.partition.id_asset) {
                    ++errors
                    element.assetError = true
                  }
                  if (element.partition && !element.partition.name) {
                    ++errors
                    element.subAssetError = true
                  }
                });
    
              }
            }
          }
        }
        
      }
      setPermissions([...permissionsCopy]);
      return errors
    }
    catch (errors) {
      console.log(errors)
    }
    
  }

  let validation = async () => {
    let errors = await validationCheck()
    if (errors === 0) {
      cudManager()
    }
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
        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permissionDelete(`workflow-permission/${perm.workflow}/${perm.identity_group_identifier}/`)
        if (p.status && p.status !== 200 ) {
          let error = Object.assign(p, {
            component: 'permissionWorkflow',
            vendor: 'concerto',
            errorType: 'permissionDeleteError'
          })
          props.dispatch(err(error))
        }
        perm.loading = false
        setPermissions([...permissionsCopy]);
      }
    }

    if (toPost.length > 0) {
      let body = {}
      for await (const perm of toPost) {
        body.data = {
          "workflow": perm.workflow,
          "identity_group_identifier": perm.identity_group_identifier,
        }

        if (perm.infoblox && perm.infoblox.length > 0) {
          perm.infoblox.forEach(element => {
            if (element.network) {
              element.network.name = element.network.network
            }
          });
          body.data.infoblox = perm.infoblox
        }
        if (perm.checkpoint && perm.checkpoint.length > 0) {
          body.data.checkpoint = perm.checkpoint
        }
        if (perm.f5 && perm.f5.length > 0) {
          body.data.f5 = perm.f5
        }

        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permissionAdd('workflow-permissions/', body)
        if (p.status && p.status !== 201 ) {
          let error = Object.assign(p, {
            component: 'permissionWorkflow',
            vendor: 'concerto',
            errorType: 'permissionAddError'
          })
          props.dispatch(err(error))
        }
        perm.loading = false
        setPermissions([...permissionsCopy]);
      }
    }

    if (toPatch.length > 0) {
      for (let perm of toPatch) {
        let localPerm = JSON.parse(JSON.stringify(perm));
        let wf = workflows.find(w => w.name === localPerm.workflow);
        let techs = wf.technologies;
    
        for (const tech of techs) {
          if (localPerm.isModified[tech] && Object.keys(localPerm.isModified[tech]).length > 0) {
            for (const [key, value] of Object.entries(localPerm.isModified[tech])) {
              if (value.toDelete) {    
                const indexToDelete = localPerm[tech].findIndex(item => item.id === parseInt(key));
                if (indexToDelete !== -1) {
                  localPerm[tech].splice(indexToDelete, 1);
                }
              }
            }
            
            if (tech === 'infoblox') {
              if (Object.keys(localPerm.infoblox).length > 0) {
                const updatedInfoblox = localPerm.infoblox.map(item => {
                  if (item.network && !item.network.name) {
                    item.network.name = item.network.network; // Aggiunge "name" uguale a "network" se non esiste
                  }
                  return item;
                });
              }
            }
            let body = {};
            body.data = { [tech]: localPerm[tech] };
    
            perm.loading = true
            setPermissions([...permissionsCopy]);

            let p = await permissionModify(`workflow-permission/${perm.workflow}/${perm.identity_group_identifier}/`, body)
            if (p.status && p.status !== 200 ) {
              let error = Object.assign(p, {
                component: 'permissionWorkflow',
                vendor: 'concerto',
                errorType: 'permissionModifyError'
              })
              props.dispatch(err(error))
            }
            perm.loading = false
            setPermissions([...permissionsCopy]);
          }
        }
      }
    }
    
    setExpandedRowKeys([])
    setPermissionsRefresh(true)
  }

  let permissionDelete = async (endpoint) => {
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
    await rest.doXHR(endpoint, props.token )
    return r
  }

  let permissionAdd = async (endpoint, body) => {
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
    await rest.doXHR(endpoint, props.token, body )
    return r
  }

  let permissionModify = async (endpoint, body) => {
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
    await rest.doXHR(endpoint, props.token, body )
    return r
  }

  // Colonne per la tabella F5
  const f5Columns = (father) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
          { obj.assetError ?
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
          onSelect={value => set('asset', value, father, obj, 'f5' )}
        >
          { assetsF5 ? assetsF5.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            }) : null
          }
        </Select>
      ),
    },
    {
      title: 'Partition Name',
      dataIndex: ['partition', 'name'],
      key: 'partition',
      ...getColumnSearchProps(
        'partition', 
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
          value={obj.partition && obj.partition.name ? obj.partition.name : '' }
          showSearch
          style=
          { obj.subAssetError ?
            {width: '100%', border: `1px solid red`}
          :
            {width: '100%'}
          }
          disabled = {(obj && obj.asset && obj.asset.partitions) ? false : true} 
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={value => set('subAsset', value, father, obj, 'f5' )}
        >
          <Select.Option key={'any'} value={'any'}>any</Select.Option>
          { (obj && obj.asset && obj.asset.partitions) ? obj.asset.partitions.map((part, i) => {
              return (
                <Select.Option key={i} value={part.name}>{part.name}</Select.Option>
              )
            }) : null
          }
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
              onChange={e => set('subPermDel', e.target.checked, father, obj, 'f5' )}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => subItemRemove(obj, father, 'f5')}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  // Colonne per la tabella Infoblox
  const infobloxColumns = (father) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
          { obj.assetError ?
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
          onSelect={value => set('asset', value, father, obj, 'infoblox' )}
        >
          { assetsInfoblox ? assetsInfoblox.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            }) : null
          }
        </Select>
      ),
    },
    {
      title: 'Network Name',
      dataIndex: ['network', 'name'],
      key: 'network',
      ...getColumnSearchProps(
        'network', 
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
          value={obj.network && obj.network.network ? obj.network.network : '' }
          showSearch
          style=
          { obj.subAssetError ?
            {width: '100%', border: `1px solid red`}
          :
            {width: '100%'}
          }
          disabled = {(obj && obj.asset && obj.asset.networks) ? false : true} 
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={value => set('subAsset', value, father, obj, 'infoblox' )}
        >
          <Select.Option key={'any'} value={'any'}>any</Select.Option>
          { (obj && obj.asset && obj.asset.networks) ? obj.asset.networks.map((n, i) => {
              return (
                <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
              )
            }) : null
          }
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
              onChange={e => set('subPermDel', e.target.checked, father, obj, 'infoblox' )}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => subItemRemove(obj, father, 'infoblox')}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  // Colonne per la tabella Checkpoint
  const checkpointColumns = (father) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
          { obj.assetError ?
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
          onSelect={value => set('asset', value, father, obj, 'checkpoint' )}
        >
          { assetsCheckpoint ? assetsCheckpoint.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            }) : null
          }
        </Select>
      ),
    },
    {
      title: 'Domain Name',
      dataIndex: ['domain', 'name'],
      key: 'domain',
      ...getColumnSearchProps(
        'domain', 
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
          value={obj.domain && obj.domain.name ? obj.domain.name : '' }
          showSearch
          style=
          { obj.subAssetError ?
            {width: '100%', border: `1px solid red`}
          :
            {width: '100%'}
          }
          disabled = {(obj && obj.asset && obj.asset.domains) ? false : true} 
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={value => set('subAsset', value, father, obj, 'checkpoint' )}
        >
          <Select.Option key={'any'} value={'any'}>any</Select.Option>
          { (obj && obj.asset && obj.asset.domains) ? obj.asset.domains.map((d, i) => {
              return (
                <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
              )
            }) : null
          }
        </Select>
      ),
    },
    {
      title: 'Tag',
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
                      disabled={obj && obj.domain && !obj.domain.name ? true : false}
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
                      onSelect={value => set('tag', value, father, obj, 'checkpoint' )}
                    >
                      <React.Fragment>
                        { obj && obj.tags && obj.tags.length > 0 ? obj.tags.map((tag, i) => {
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
                        onClick={() => set('refreshTags', true, father, obj, 'checkpoint' )}
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
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <Space size="small">
          {obj.existent ?
            <Checkbox
              checked={obj.toDelete}
              onChange={e => set('subPermDel', e.target.checked, father, obj, 'checkpoint' )}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => subItemRemove(obj, father, 'checkpoint')}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  const expandedRowRender = (record) => {
    return (
      <>
        {record.f5 && record.f5.length > 0 && (
          <>
            <h4>F5</h4>
            <Radio.Group
              buttonStyle="solid"
            >
              <Radio.Button
                onClick={() => subItemAdd(record, 'f5')}
              >
                Add permission
              </Radio.Button>

            </Radio.Group>
            <br/>
            <br/>
            <Table 
              columns={f5Columns(record)} 
              dataSource={record.f5} 
              pagination={false} 
              rowKey="id" 
              className="f5-table"
            />
            <br/>
          </>
        )}
        {record.infoblox && record.infoblox.length > 0 && (
          <>
            <h4>Infoblox</h4>
            <Radio.Group
              buttonStyle="solid"
            >
              <Radio.Button
                onClick={() => subItemAdd(record, 'infoblox')}
              >
                Add permission
              </Radio.Button>

            </Radio.Group>
            <br/>
            <br/>
            <Table 
              columns={infobloxColumns(record)} 
              dataSource={record.infoblox} 
              pagination={false} 
              rowKey="id" 
              className="infoblox-table"
            />
            <br/>
          </>
        )}
        {record.checkpoint && record.checkpoint.length > 0 && (
          <>
            <h4>Checkpoint</h4>
            <Radio.Group
              buttonStyle="solid"
            >
              <Radio.Button
                onClick={() => subItemAdd(record, 'checkpoint')}
              >
                Add permission
              </Radio.Button>

            </Radio.Group>
            <br/>
            <br/>
            <Table 
              columns={checkpointColumns(record)} 
              dataSource={record.checkpoint} 
              pagination={false} 
              rowKey="id"
              className="checkpoint-table"
            />
            <br/>
          </>
        )}
      </>
    );
  };

  const onTableRowExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
    }
  };

  let workflowColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj) => (
        <Space size="small">
          {obj.loading ? <Spin indicator={permLoadIcon} style={{ margin: '10% 10%' }} /> : null}
        </Space>
      ),
    },
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Workflow Name',
      align: 'center',
      dataIndex: 'workflow',
      key: 'workflow',
      ...getColumnSearchProps(
        'workflow',
        searchInput,
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText),
        searchText,
        searchedColumn,
        setSearchText,
        setSearchedColumn
      ),
      render: (name, obj)  => (
        <>
          {obj.existent ?
            name
          :
            <Select
              value={obj.name}
              showSearch
              style=
              { obj.workflowError ?
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
              onSelect={value => set('workflow', value, obj )}
            >
              { workflows.map((w, i) => {
                  return (
                    <Select.Option key={i} value={w.name}>{w.name}</Select.Option>
                  )
                })
              }
            </Select>
          }
        </>
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
        <>
          {obj.existent ?
            name
          :
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
              { identityGroups.map((w, i) => {
                  return (
                    <Select.Option key={i} value={w.identity_group_identifier}>{w.identity_group_identifier}</Select.Option>
                  )
                })
              }
            </Select>
          }
        </>
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
              onClick={(e) => itemRemove(obj, permissions)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  return (
    <>
      {loading ? (
        <Spin indicator={spinIcon} style={{ margin: '10% 45%' }} />
      ) : (
        <React.Fragment>
          <Radio.Group>
            <Radio.Button
              style={{marginLeft: 16 }}
              onClick={() => setPermissionsRefresh(true)}
            >
              <ReloadOutlined/>
            </Radio.Button>
          </Radio.Group>

          <Radio.Group
            buttonStyle="solid"
          >
            <Radio.Button
              style={{marginLeft: 16 }}
              onClick={() => itemAdd(permissions)}
            >
              Add permission
            </Radio.Button>

            <Radio.Button
              style={{marginLeft: 16 }}
              buttonStyle="solid"
              onClick={() => {
                setNewIGShow(true)
              }}
            >
              New identity group
            </Radio.Button>
          </Radio.Group>

          { newIGShow ?
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
          <br/>
          <br/>
          <Table
            columns={workflowColumns}
            style={{width: '100%', padding: 5}}
            dataSource={permissions}
            bordered
            rowKey={(record) => record.id}
            scroll={{x: 'auto'}}          
            expandedRowKeys={expandedRowKeys}
            onExpand={(expanded, record) => onTableRowExpand(expanded, record)}
            expandable={{ expandedRowRender }}
            pagination={{
                pageSize: pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'], 
                onShowSizeChange: (current, size) => setPageSize(size), 
              }}
          />
          <Button
            type="primary"
            style={{float: 'right', marginRight: 15}}
            onClick={() => validation()}
          >
            Commit
          </Button>
        </React.Fragment>
      )}
      {props.error && props.error.component === 'permissionWorkflow' && <Error error={[props.error]} visible={true} />}
    </>
  );
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(PermissionWorkflow);
