import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Authorizators from '../../_helpers/authorizators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

import { Space, Modal, Row, Col, Divider, Table, Radio, Input, Select, Button, Checkbox, Spin, Alert, Result, Popover } from 'antd'
import Highlighter from 'react-highlight-words';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const cloudNetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*
Country = Provider
City = Region
Reference = ITSM (IT SERVICE MANAGER)
*/

/* 
@ todo
- permessi lettura reti e scrittura
- conferma delete
*/


function CloudNetwork(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);

  let [existent, setExistent] = useState(true);
  
  
  let [providers, setProviders] = useState(['AWS', 'AZURE', 'GCP', 'OCI']);
  let [provider, setProvider] = useState('');
  
  let [regions, setRegions] = useState([]);
  
  let [cloudNetworks, setCloudNetworks] = useState([]);
  let [originCloudNetworks, setOriginCloudNetworks] = useState([]);
  
  let [accountsLoading, setAccountsLoading] = useState(false);
  let [accounts, setAccounts] = useState([]);
  let [accountId, setAccountId] = useState('');
  let [accountName, setAccountName] = useState('');
  let [ITSM, setITSM] = useState('');
  
  let [modifyId, setModifyId] = useState('');
  let [modifyName, setModifyName] = useState('');
  let [modifyITSM, setModifyITSM] = useState('');
  let [accountModify, setAccountModify] = useState(false);
  
  let [newAccountId, setNewAccountId] = useState('');
  let [newAccountName, setNewAccountName] = useState('');
  let [newITSM, setNewITSM] = useState('');

  let [subnetMaskCidrs, setSubnetMaskCidrs] = useState(['23', '24']);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let [response, setResponse] = useState(false);

  let myRefs = {};
  let textAreaRefs = useRef({});


  useEffect(() => {
    if (provider && props.asset) {
      setAccountModify(false);
      setAccountId('');
      setAccountName('');
      setITSM('');
      setModifyId('');
      setModifyName('');
      setModifyITSM('');
      setCloudNetworks([]);
      setOriginCloudNetworks([]);

      dataGetHandler('configurations')
      dataGetHandler('accountsAndProviders', props.asset.id)
    }    
  }, [provider]);

  useEffect(() => {
    if (provider && props.asset && accountId && !accountModify && existent) {
      dataGetHandler('getNetworks', props.asset.id)
    }    
  }, [provider, accountId]);

  useEffect(() => {
    if (provider && props.asset && accountId && accountModify) {
      dataGetHandler('accountsAndProviders', props.asset.id)
      dataGetHandler('getNetworks', props.asset.id)
      setAccountModify(false)
    }    
  }, [provider, accountId]);

  useEffect(() => {
    if (!existent) {
      setAccountModify(false);
      setAccountId('');
      setAccountName('');
      setITSM('');
      setModifyId('');
      setModifyName('');
      setModifyITSM('');
      setCloudNetworks([]);
      setOriginCloudNetworks([]);
    }
    else {
      setNewAccountId('')
      setNewAccountName('')
      setNewITSM('')
      setAccountModify(false)
    }
  }, [existent]);



  let dataGetHandler = async (entities, assetId) => {
    let data

    if (entities === 'configurations') {
      setLoading(true);
      data = await dataGet('configurations')
      try {
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'assignCloudNetwork',
            vendor: 'infoblox',
            errorType: 'configurationsError'
          })
          props.dispatch(err(error))
          setLoading(false);
        }
        else {
          if (data.data.items.length > 0) {
            let list = []
            if (provider === 'AWS') {
              data.data.items.forEach((item, i) => {
                if (item.config_type === 'AWS Regions') {
                  item.value.forEach((reg, i) => {
                    list.push(reg)
                  });
                }
              });
            }
            else if (provider === 'AZURE') {
              data.data.items.forEach((item, i) => {
                if (item.config_type === 'AZURE Regions') {
                  item.value.forEach((reg, i) => {
                    list.push(reg)
                  });
                }
              });
            }
            else if (provider === 'OCI') {
              data.data.items.forEach((item, i) => {
                if (item.config_type === 'OCI Regions') {
                  item.value.forEach((reg, i) => {
                    list.push(reg)
                  });
                }
              });
            }
            setLoading(false);
            setRegions(list)
          }
        }
      } catch (error) {
        setLoading(false);
        setRegions([])
        console.log(error)
      }
    }

    if (entities === 'accountsAndProviders') {
      setAccountsLoading(true)
      data = await dataGet(entities, assetId)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'assignCloudNetwork',
          vendor: 'infoblox',
          errorType: 'accountsAndProviders'
        })
        props.dispatch(err(error))
        setAccountsLoading(false)
        setAccounts([])
      }
      else {
        let list = data.data.map(item => {
          item.ITSM = item.Reference
          item.accountId = item['Account ID']
          item.accountName = item['Account Name']
          return item
        })
        setAccountsLoading(false)
        setAccounts(list)
      }
      setLoading(false)
    }
    
    if (entities === 'getNetworks') {
      setLoading(true)
      data = await dataGet(entities, assetId)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'assignCloudNetwork',
          vendor: 'infoblox',
          errorType: 'getNetworks'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        try{
          data.data.forEach((item, i) => {
            let sm = item.network.split('/')
            item.existent = true
            item.subnetMaskCidr = sm[1]
            item.isModified = {}
            item.id = ++i
            if (item.extattrs) {
              for (let k in item.extattrs) {
                if (k === 'Country') {
                  let v
                  if (item.extattrs[k].value.includes('Cloud-')){
                    v = item.extattrs[k].value.replace('Cloud-', '')
                    item['Provider'] = v
                  }
                  else {
                    item['Provider'] = item.extattrs[k].value
                  }
                }
                else if (k === 'City') {
                  item['Region'] = item.extattrs[k].value
                }
                else if (k === 'Reference') {
                  item['ITSM'] = item.extattrs[k].value
                }
                else {
                  item[k] = item.extattrs[k].value
                }
              }
            }
          });
          setLoading(false)
          setOriginCloudNetworks(data.data)
          setCloudNetworks(data.data)
        }
        catch (error) {
          setLoading(false)
        }
        
        
      }
    }
    
  }

  let newAccountHandler = async() => {
      setLoading(true)

      let data = await dataGet('getNetworks', props.asset.id)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'assignCloudNetwork',
          vendor: 'infoblox',
          errorType: 'getNetworksError'
        })
        props.dispatch(err(error))
      }
      else {
        data.data.forEach((item, i) => {
          item.existent = true
          item.isModified = {}
          item.id = ++i
          if (item.extattrs) {
            for (let k in item.extattrs) {
              if (k === 'Country') {
                let v
                if (item.extattrs[k].value.includes('Cloud-')){
                  v = item.extattrs[k].value.replace('Cloud-', '')
                  item['Provider'] = v
                }
                else {
                  item['Provider'] = item.extattrs[k].value
                }
              }
              else if (k === 'City') {
                item['Region'] = item.extattrs[k].value
              }
              else if (k === 'Reference') {
                item['ITSM'] = item.extattrs[k].value
              }
              else {
                item[k] = item.extattrs[k].value
              }
            }
          }
        });
        setLoading(false)
        setOriginCloudNetworks(data.data)
        setCloudNetworks(data.data)
        setExistent(true)
      }
    
  }

  let dataGet = async (entities, assetId) => {
    let endpoint
    let r

    if (entities === 'configurations') {
      endpoint = `${props.vendor}/${entities}/`
    }

    if (entities === 'getNetworks') {
      if (accountId) {
        endpoint = `${props.vendor}/${assetId}/networks/?fby=*Account ID&fval=${accountId}&fby=*Environment&fval=Cloud&fby=*Country&fval=Cloud-${provider}`
      }
      else if(accountName) {
        endpoint = `${props.vendor}/${assetId}/networks/?fby=*Account Name&fval=${accountName}&fby=*Environment&fval=Cloud&fby=*Country&fval=Cloud-${provider}`
      }
    }

    if (entities === 'accountsAndProviders') {
      endpoint = `${props.vendor}/${assetId}/list-cloud-extattrs/account+provider/?fby=*Country&fval=Cloud-${provider}`
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

  let accountDel = async() => {
    setLoading(true)
      let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
      for (const cloudNet of cloudNetworksCopy) {
        cloudNet.loading = true
        let net = cloudNet.network.split('/')
        let n = await cloudNetworkDelete(net[0])
        if (n.status && n.status !== 200 ) {
          let error = Object.assign(n, {
            component: 'assignCloudNetwork',
            vendor: 'infoblox',
            errorType: 'NetworkDeleteError'
          })
          props.dispatch(err(error))
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
        else {
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
      }
    
    setLoading(false)
    setAccountId('')
    setAccountName('')
    setITSM('')
    setCloudNetworks([])
    setOriginCloudNetworks([])
    setAccountModify(false)
   
    dataGetHandler('accountsAndProviders', props.asset.id)
  }

  let cloudNetworkAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(cloudNetworks))

    cloudNetworks.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });

    n = id + 1
    p.id = n
    if (accountId) {
      p.accountId = accountId
    }
    if (accountName) {
      p.accountName = accountName
    }
    list.push(p)

    setCloudNetworks(list)
  }

  let cloudNetworkRemove = async p => {
    let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
    let newList = cloudNetworksCopy.filter(n => {
      return p.id !== n.id
    })

    setCloudNetworks(newList)
  }

  /* SET */
  let set = async (key, value, cloudNetwork) => {
    let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
    let origCloudNet
    let cloudNet

    if (key === 'provider') {
      setProvider(value)
    }

    if (key === 'accountId') {
      let accountsCopy = JSON.parse(JSON.stringify(accounts))
      let account = accountsCopy.find( a => a.accountId === value )
      
      setAccountId(account.accountId)
      setAccountName(account.accountName)
      setITSM(account.ITSM)
    }

    if (key === 'accountName') {
      let accountsCopy = JSON.parse(JSON.stringify(accounts))
      let account = accountsCopy.find( a => a.accountName === value )
      setAccountId(account.accountId)
      setAccountName(account.accountName)
      setITSM(account.ITSM)
    }

    if (key === 'accountModify') {
      setAccountModify(value)
      setModifyId(accountId)
      setModifyName(accountName)
      setModifyITSM(ITSM)
      
      if (!value) {
        setModifyId('')
        setModifyName('')
        setModifyITSM('')
      }
    }

    if (key === 'modifyId') {
      setModifyId(value)
    }

    if (key === 'modifyName') {
      setModifyName(value)
    }

    if (key === 'modifyITSM') {
      setModifyITSM(value)
    }

    if (key === 'newAccountId') {
      setAccountId(value)
      setNewAccountId(value)
    }

    if (key === 'newAccountName') {
      setNewAccountName(value)
      setAccountName(value)
    }

    if (key === 'newITSM') {
      setNewITSM(value)
      setITSM(value)
    }

    if (cloudNetwork) {
      origCloudNet = originCloudNetworks.find(cn => cn.id === cloudNetwork.id)
      cloudNet = cloudNetworksCopy.find(cn => cn.id === cloudNetwork.id)

      if (key === 'Region') {
        if (provider === 'AWS') {
          if (value) {
            if (cloudNet.existent) {
              if (origCloudNet.Region !== 'aws-'+value) {
                cloudNet.isModified.Region = true
                cloudNet.Region = 'aws-'+value
              }
              else {
                delete cloudNet.isModified.Region
                cloudNet.Region = 'aws-'+value
              }
            }
            else {
              cloudNet.Region = 'aws-'+value
            }
            delete cloudNet.RegionError
          }
        }
        else if (provider === 'AZURE') {
          if (value) {
            if (cloudNet.existent) {
              if (origCloudNet.Region !== 'azure-'+value) {
                cloudNet.isModified.Region = true
                cloudNet.Region = 'azure-'+value
              }
              else {
                delete cloudNet.isModified.Region
                cloudNet.Region = 'azure-'+value
              }
            }
            else {
              cloudNet.Region = 'azure-'+value
            }
            delete cloudNet.RegionError
          }
        }
        else if (provider === 'OCI') {
          if (value) {
            if (cloudNet.existent) {
              if (origCloudNet.Region !== 'oci-'+value) {
                cloudNet.isModified.Region = true
                cloudNet.Region = 'oci-'+value
              }
              else {
                delete cloudNet.isModified.Region
                cloudNet.Region = 'oci-'+value
              }
            }
            else {
              cloudNet.Region = 'oci-'+value
            }
            delete cloudNet.RegionError
          }
        }
      }
      

      if (key === 'ITSM') {
        let start = 0
        let end = 0
        let ref = myRefs[`${cloudNetwork.id}_ITSM`]

        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet['ITSM'] !== value) {
              cloudNet.isModified['ITSM'] = true
              cloudNet['ITSM'] = value
            }
            else {
              delete cloudNet.isModified['ITSM']
              cloudNet['ITSM'] = value
            }
          }
          else {
            cloudNet['ITSM'] = value
          }
          delete cloudNet['ITSMError']
        }
        else {
          //blank value while typing.
          cloudNet['ITSM'] = ''
        }

        setCloudNetworks([...cloudNetworksCopy])

        ref = myRefs[`${cloudNetwork.id}_ITSM`]

        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'subnetMaskCidr') {
        cloudNet.subnetMaskCidr = value
        delete cloudNet.subnetMaskCidrError
      }

      if (key === 'comment') {
        let start = 0
        let end = 0
        let ref = textAreaRefs.current[`${cloudNetwork.id}_comment`];

        if (ref?.resizableTextArea?.textArea) {
          start = ref.resizableTextArea.textArea.selectionStart;
          end = ref.resizableTextArea.textArea.selectionEnd;
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet.comment !== value) {
              cloudNet.isModified.comment = true
              cloudNet.comment = value
            }
            else {
              delete cloudNet.isModified.comment
              cloudNet.comment = value
            }
          }
          else {
            cloudNet.comment = value
          }
          delete cloudNet.commentError
        }
        else {
          //blank value while typing.
          cloudNet.comment = ''
        }

        setCloudNetworks(cloudNetworksCopy)

        setTimeout(() => {
          const updatedRef = textAreaRefs.current[`${cloudNetwork.id}_comment`];
    
          if (updatedRef?.resizableTextArea?.textArea) {
            updatedRef.resizableTextArea.textArea.selectionStart = start;
            updatedRef.resizableTextArea.textArea.selectionEnd = end;
            updatedRef.focus();
          }
        }, 0);
      }

      if (key === 'toDelete') {
        if (value) {
          cloudNet.toDelete = true
        }
        else {
          delete cloudNet.toDelete
        }
      }

    }

    if (key !== 'accountId' && key !== 'accountName' && key !== 'ITSM' && key !== 'comment') {
      setCloudNetworks([...cloudNetworksCopy])
    }

  }

  /* VALIDATION */

  let validation = async () => {
    let errors = await validationCheck()
    if (errors === 0) {
      cudManager()
    }
  }

  let validationCheck = async () => {
    let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
    let errors = 0

    for (let cloudNet of Object.values(cloudNetworksCopy)) {
      if ((provider === 'AWS' || provider === 'AZURE' || provider === 'OCI' ) && !cloudNet.Region) {
        ++errors
        cloudNet.RegionError = true
      }
      if (!cloudNet.subnetMaskCidr) {
        ++errors
        cloudNet.subnetMaskCidrError = true
      }
    }

    setCloudNetworks([...cloudNetworksCopy])
    return errors
  }

  /* DISPOSITION */

  let cudManager = async () => {
    let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const cloudNet of Object.values(cloudNetworksCopy)) {
      if (cloudNet.toDelete) {
        toDelete.push(cloudNet)
      }
      if (cloudNet.isModified && Object.keys(cloudNet.isModified).length > 0) {
        toPatch.push(cloudNet)
      }
      if (modifyId && modifyName && modifyITSM) {
        toPatch.push(cloudNet)
      }
      if (!cloudNet.existent) {
        toPost.push(cloudNet)
      }
    }

    if (toDelete.length > 0) {
      for (const cloudNet of toDelete) {
        cloudNet.loading = true
        setCloudNetworks([...cloudNetworksCopy])
        let net = cloudNet.network.split('/')
        let n = await cloudNetworkDelete(net[0])
        if (n.status && n.status !== 200 ) {
          let error = Object.assign(n, {
            component: 'assignCloudNetwork',
            vendor: 'infoblox',
            errorType: 'networkDeleteError'
          })
          props.dispatch(err(error))
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
        else {
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
      }
    }

    if (toPost.length > 0) {
      for (const cloudNet of toPost) {
        let body = {}

        body.data = {
          "provider": provider,
          "network_data": {
            "network": "next-available",
            "subnetMaskCidr": cloudNet.subnetMaskCidr,
            "comment": cloudNet.comment,
            "extattrs": {
              "Account ID": {
                "value": accountId
              },
              "Account Name": {
                "value": accountName
              },
              "Reference": {
                "value": ITSM
              }
            }
          }
        }

        if (provider === 'AWS' || provider === 'AZURE' || provider === 'OCI') {
          body.data.region = cloudNet.Region
        }

        cloudNet.loading = true
        setCloudNetworks([...cloudNetworksCopy])

        let cn = await cloudNetworkAssign(body)
        if (cn.status && cn.status !== 200 ) {
          let error = Object.assign(cn, {
            component: 'assignCloudNetwork',
            vendor: 'infoblox',
            errorType: 'networkAssignError'
          })
          props.dispatch(err(error))
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
        else {
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
      }
    }

    if (toPatch.length > 0) {
      for (const cloudNet of toPatch) {
        let body = {}

        body.data = {
          "network_data": {
            "network": "next-available",
            "comment": cloudNet.comment,
            "extattrs": {
              "Account ID": {
                "value": accountId
              },
              "Account Name": {
                "value": accountId
              },
              "Reference": {
                "value": ITSM
              }
            }
          }
        }

        if (provider === 'AWS' || provider === 'AZURE' || provider === 'OCI') {
          body.data.region = cloudNet.Region
        }

        cloudNet.loading = true
        setCloudNetworks([...cloudNetworksCopy])
        let net = cloudNet.network.split('/')
        let cn = await cloudNetworkModify(net[0], body)
        
        if (cn.status && cn.status !== 200 ) {
          let error = Object.assign(cn, {
            component: 'assignCloudNetwork',
            vendor: 'infoblox',
            errorType: 'networkModifyError'
          })
          props.dispatch(err(error))
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
        else {
          cloudNet.loading = false
          setCloudNetworks([...cloudNetworksCopy])
        }
      }
    }

    await dataGetHandler('getNetworks', props.asset.id)

    //if account is deleted
    if (cloudNetworks.length < 1) {
      setLoading(false)
      setAccountId('')
      setAccountName('')
      setITSM('')
      setModifyId('')
      setModifyName('')
      setModifyITSM('')
    }

    dataGetHandler('accountsAndProviders', props.asset.id)
    
  }

  let accountModifyManager = async () => {
    let body = {}

    body.data = {
      "Account ID": {
        "value": modifyId
      },
      "Account Name": {
          "value": modifyName
      },
      "Reference": {
          "value": modifyITSM
      }
    }

    setLoading(true)
    let data = await accountModifyHandler(accountId, body)
    
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'assignCloudNetwork',
        vendor: 'infoblox',
        errorType: 'accountModifyError'
      })
      props.dispatch(err(error))
      setLoading(false)
    }
    else {
      setLoading(false)
      setAccountId(modifyId)
      setAccountName(modifyName)
      setITSM(modifyITSM)
      setModifyId('')
      setModifyName('')
      setModifyITSM('')
      setAccountModify(false)
    }
  }

  let cloudNetworkDelete = async (net) => {
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
    await rest.doXHR(`${props.vendor}/${props.asset.id}/delete-cloud-network/${net}/`, props.token )
    return r
  }

  let cloudNetworkAssign = async (b) => {
    let r
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${props.vendor}/${props.asset.id}/assign-cloud-network/`, props.token, b )
    return r
  }

  let cloudNetworkModify = async (net, b) => {
    let r
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${props.vendor}/${props.asset.id}/modify-cloud-network/${net}/`, props.token, b )
    return r
  }

  let accountModifyHandler = async (id, b) => {
    let r
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${props.vendor}/${props.asset.id}/modify-account-cloud-network/${id}/`, props.token, b )
    return r
  }

  //Close and Error
  let closeModal = () => {
    //let \[\s*\w+\s*,\s*
    /*
    let \[ corrisponde alla stringa const [.
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
    \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
    ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
    */
    setVisible(false);
    setProviders(['AWS', 'AZURE', 'GCP', 'OCI']);
    setSubnetMaskCidrs(['23', '24']);
    setProvider('');
    setRegions([]);
    setLoading(false);
    setAccountsLoading(false);
    setAccounts([]);
    setAccountModify(false);
    setAccountId('');
    setAccountName('');
    setITSM('');
    setModifyId('');
    setModifyName('');
    setModifyITSM('');
    setCloudNetworks([]);
    setOriginCloudNetworks([]);
  }
  
  /* RENDER */
  let randomKey = () => {
    return Math.random().toString()
  }

  let createElement = (element, key, choices, obj, action) => {

    if (element === 'input') {
      if (key === 'newAccountId') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={newAccountId}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'modifyId') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={modifyId}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'newAccountName') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={newAccountName}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'modifyName') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={modifyName}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'modifyITSM') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={modifyITSM}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'newITSM') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={newITSM}
            onChange={event => set(key, event.target.value)}
          />
        )
      }
    }

    switch (element) {

      case 'button':
        if (action === 'getNetworks') {
          return (
            <Button
              type="primary"
              disabled={(accountId || accountName) ? false : true}
              onClick={() => dataGetHandler(action, props.asset.id)}
            >
              Get cloud networks
            </Button>
          )
        }

        else if (action === 'modifyAccount') {
          return (
            <Button
              type="primary"
              disabled={(modifyId && modifyId.length === 12 && modifyName && modifyITSM) ? false : true}
              onClick={() => accountModifyManager()}
            >
              Modify Account
            </Button>
          )
        }

        else if (action === 'newAccount') {
          return (
            <Button
              type="primary"
              disabled={(newAccountId && newAccountId.length === 12 && newAccountName && newITSM) ? false : true}
              onClick={() => newAccountHandler()}
            >
              Set new Account
            </Button>
          )
        }
      break;

      case 'popOver':
        if (action === 'delAccount') {
          return (
            <Popover
            content={
              <div>
                <p>By clicking on DELETE ACCOUNT, you permanently delete the account and all networks associated with it.</p>
                <a onClick={() => accountDel()}>DELETE ACCOUNT</a>
              </div>
            }
            title='Attention!'
            trigger="click"
          >
            <Button 
              type="danger"
              disabled={(accountId && accountName && ITSM) ? false : true}
            >
              Delete Account
            </Button>
          </Popover>
          )
        }
      break;

      case 'textArea':
        return (
          <Input.TextArea
            rows={7}
            value={obj[key]}
            //ref={ref => textAreaRefs[`${obj.id}_${key}`] = ref}
            ref={ref => {
              if (ref) {
                textAreaRefs.current[`${obj.id}_${key}`] = ref;
              }
            }}
            onChange={event => set(key, event.target.value, obj)}
            style={{width: 350}}
          />
        )

      case 'select':          
        if (key === 'Region') {
          return (
            <Select
              value={obj[key]}
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              disabled={(provider === 'AWS' || provider === 'AZURE' || provider === 'OCI') ? false : true}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => set(key, event, obj)}
            >
              <React.Fragment>
                { provider === 'AWS' || provider === 'AZURE' || provider === 'OCI' ?
                  regions ?
                    regions.map((r,i) => {
                      let str = `${r.regionName.toString()} - ${r.regionCode.toString()}`
                      return (
                        <Select.Option key={i} value={r.regionCode}>{str}</Select.Option>
                      )
                    })
                  :
                   []
                :
                  null 
                }
              </React.Fragment>
            </Select>
          )
        }
        else if (key === 'subnetMaskCidr') {
          return (
            <Select
              value={obj[key]}
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: '100%'}
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
              onSelect={event => set(key, event, obj)}
            >
              <React.Fragment>
                {subnetMaskCidrs ? 
                  subnetMaskCidrs.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                : 
                  []
                }
              </React.Fragment>
            </Select>
          )
        }
        else if (key === 'accountId' || key === 'accountName') {
          return (
            <Select
              value={
                key === 'accountId' ?
                  accountId
                : 
                  key === 'accountName' ?
                    accountName
                  :
                    null
              }
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: '100%'}
                :
                  {width: '100%'}
              }
              disabled={accountModify ? true : false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => set(key, event, '')}
            >
              <React.Fragment>
                {accounts ?
                  accounts.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n[key]}>{n[key]}</Select.Option>
                    )
                  })
                :
                  []
                }
              </React.Fragment>
          </Select>
          )
        }
        else if (key === 'provider') {
          return (
            <Select
              value={provider}
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: '100%'}
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
              onSelect={event => set(key, event, '')}
            >
              <React.Fragment>
                {providers ?
                  providers.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                :
                  []
                }
              </React.Fragment>
          </Select>
          )
        }        
        else {
          return (
            <Select
              value={''}
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: '100%'}
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
              onSelect={event => set(key, event, '')}
            >
              <React.Fragment>
                {[].map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
                }
              </React.Fragment>
          </Select>
          )
        }        

      default:

    }

  }

  let columns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={cloudNetLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Id',
      align: 'center',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Network',
      align: 'center',
      dataIndex: 'network',
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
    },
    {
      title: 'Network_container',
      align: 'center',
      dataIndex: 'network_container',
      key: 'network_container',
      ...getColumnSearchProps(
        'network_container', 
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
      title: 'Region',
      align: 'center',
      dataIndex: 'region',
      key: 'region',
      ...getColumnSearchProps(
        'region', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, cloudNet)  => (
        cloudNet.existent ? 
          cloudNet.Region
        :
          createElement('select', 'Region', '', cloudNet, '')
      )
    },
    {
      title: 'Subnet Mask',
      align: 'center',
      dataIndex: 'subnetMaskCidr',
      key: 'subnetMaskCidr',
      ...getColumnSearchProps(
        'subnetMaskCidr', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, cloudNet)  => (
        cloudNet.existent ? 
          cloudNet.subnetMaskCidr
        :
          createElement('select', 'subnetMaskCidr', 'subnetMaskCidrs', cloudNet, '')
      )
    },
    {
      title: 'Comment',
      align: 'center',
      dataIndex: 'comment',
      key: 'comment',
      ...getColumnSearchProps(
        'comment', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, cloudNet)  => (
        createElement('textArea', 'comment', '', cloudNet, '')
      )
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
              type='danger'
              onClick={(e) => cloudNetworkRemove(obj)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'assignCloudNetwork') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>{props.service.toUpperCase()}</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>{props.service.toUpperCase()}</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1800}
        maskClosable={false}
      >

        <AssetSelector vendor='infoblox'/>
        <Divider/>

        { ( props.asset && props.asset.id ) ?
          <React.Fragment>
            { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !loading && response &&
              <Result
                  status="success"
                  title="Cloud Network Assigned"
                />
            }
            { !loading && !response &&
            <React.Fragment>

              <Row>
                <Col offset={1} span={1}>
                  <p style={{marginLeft: 10, marginRight: 10, marginTop: 5, float: 'right'}}>Provider:</p>
                </Col>
                <Col span={3}>
                  {createElement('select', 'provider', 'providers', '', '')}
                </Col>

              </Row>
              <br/>


              {provider ?
                <React.Fragment>
                  <Row>
                    <Col offset={1} span={21}>
                      <Radio.Group
                        defaultValue="existent"
                        buttonStyle="solid"
                        value={existent ? 'existent' : 'new'}
                        //style={{ paddingLeft: 10 }} // Spazio a sinistra dei bottoni
                      >
                        <Radio.Button
                          value="existent"
                          onClick={() => setExistent(true)}
                        >
                          Existent Account
                        </Radio.Button>
                        <Radio.Button
                          value="new"
                          onClick={() => setExistent(false)}
                        >
                          New Account
                        </Radio.Button>
                      </Radio.Group>
                    </Col>
                  </Row>

                  <br />
                  <Divider/>
                  {existent ?
                  <>
                    <Row>
                      <Col span={4}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID (len 12 numbers):</p>
                      </Col>
                      {accountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={3}>
                          {createElement('select', 'accountId', 'accounts', '', 'getNetworks')}
                        </Col>
                      }
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                      </Col>
                      {accountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={4}>
                          {createElement('select', 'accountName', 'accounts', '', 'getNetworks')}
                        </Col>
                      }
                      <Col span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ITSM:</p>
                      </Col>
                      {accountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={2}>
                          <p style={{marginRight: 10, marginTop: 5}}>{ITSM}</p>
                        </Col>
                      }
                      <Col offset={1} span={1}>
                        <Checkbox
                          checked={accountModify}
                          disabled={!(accountId && accountName && ITSM) ? true : false}
                          style={{marginTop: 5}}
                          onChange={e => set('accountModify', e.target.checked)}
                        >
                          Modify
                        </Checkbox>
                      </Col>
                      <Col offset={1}  span={2}>
                        {createElement('popOver', '', '', '', 'delAccount')}
                      </Col>
                    </Row>

                    { accountModify ?
                      <Row>
                        <Col span={4}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID (len 12 numbers):</p>
                        </Col>
                        <Col span={3}>
                          {createElement('input', 'modifyId', '', '', '')}
                        </Col>
                        <Col span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                        </Col>
                        <Col span={4}>
                          {createElement('input', 'modifyName', '', '', '')}
                        </Col>
                        <Col span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ITSM:</p>
                        </Col>
                        <Col span={2}>
                          {createElement('input', 'modifyITSM', '', '', '')}
                        </Col>
                        <Col offset={3} span={2}>
                          {createElement('button', '', '', '', 'modifyAccount')}
                        </Col>
                      </Row>
                    :
                      null 
                    }

                    
                    </>
                  :

                    <Row>
                      <Col span={4}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account ID (len 12 numbers):</p>
                      </Col>
                      <Col span={3}>
                        {createElement('input', 'newAccountId', '', '', '')}
                      </Col>
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Name:</p>
                      </Col>
                      <Col span={4}>
                        {createElement('input', 'newAccountName', '', '', '')}
                      </Col>
                      <Col span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New ITSM:</p>
                      </Col>
                      <Col span={2}>
                        {createElement('input', 'newITSM', '', '', '')}
                      </Col>
                      <Col offset={3} span={2}>
                        {createElement('button', '', '', '', 'newAccount')}
                      </Col>
                    </Row>
                  }
                </React.Fragment>
              :
                null
              }
              <Divider/>

              {
              (provider && accountId && accountName && ITSM) ?
                <React.Fragment>
                  <Button
                    type="primary"
                    style={{marginLeft: 16 }}
                    onClick={() => cloudNetworkAdd()}
                  >
                    Request a Cloud Network
                  </Button>
                  <Table
                    columns={columns}
                    style={{width: '100%', padding: 15}}
                    dataSource={cloudNetworks}
                    bordered
                    rowKey={randomKey}
                    scroll={{x: 'auto'}}
                    pagination={{ pageSize: 10 }}
                  />
                  <Button
                    type="primary"
                    style={{float: 'right', marginRight: 15}}
                    onClick={() => validation()}
                  >
                    Commit
                  </Button>
                  <br/>
                </React.Fragment>
              :
                null
            }

            </React.Fragment>
            }
          </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }

      </Modal>

      {visible ?
        <>
          {errorsComponent()}
        </>
      :
        null          
      }

    </React.Fragment>

  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.infoblox.asset,
}))(CloudNetwork);
