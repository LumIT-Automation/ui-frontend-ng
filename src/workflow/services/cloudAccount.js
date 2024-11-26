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


function CloudAccount(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);

  let [existent, setExistent] = useState(true);
  
  let [providers, setProviders] = useState(['AWS']);
  let [provider, setProvider] = useState('');
  let [regions, setRegions] = useState([]);
  
  let [cpAssets, setCpAssets] = useState([]);
  let [cpAsset, setCpAsset] = useState([]);
  
  let [cloudNetworks, setCloudNetworks] = useState([]);
  let [originCloudNetworks, setOriginCloudNetworks] = useState([]);

  let [cloudAccountsLoading, setCloudAccountsLoading] = useState(false);
  let [cloudAccounts, setCloudAccounts] = useState([]);

  let [cloudAccount, setCloudAccount] = useState({});
  let [cloudAccountLoading, setCloudAccountLoading] = useState(false);


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
    //1
    if (provider && props.asset) {
      setAccountModify(false);
      setCloudAccount({});

      dataGetHandler('configurations')
      dataGetHandler('cpAssets')
      dataGetHandler('cloudAccounts', props.asset.id)
    }    
  }, [provider]);

  useEffect(() => {
    //1
    if (cloudAccount.accountName) {
      dataGetHandler('cloudAccount')
    }    
  }, [cloudAccount.accountId, cloudAccount.accountName]);

  useEffect(() => {
    if (!existent) {
      setAccountModify(false);
      setAccountId('');
      setAccountName('');
      setITSM('');
      setModifyId('');
      setModifyName('');
      setModifyITSM('');
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
            component: 'cloudAccount',
            vendor: 'concerto',
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

    if (entities === 'cpAssets') {
      setLoading(true);
      data = await dataGet('cpAssets')
      try {
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'cpAssetsError'
          })
          props.dispatch(err(error))
          setLoading(false);
        }
        else {
          if (data.data.items.length > 0) {
            
            setLoading(false);
            setCpAssets(data.data.items)
          }
        }
      } catch (error) {
        setLoading(false);
        setCpAssets([])
        console.log(error)
      }
    }

    if (entities === 'cloudAccounts') {
      setCloudAccountsLoading(true)
      data = await dataGet(entities, assetId)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'cloudAccounts'
        })
        props.dispatch(err(error))
        setCloudAccounts([])
      }
      else {
        if (data.data.items.length > 0) {
          let list = data.data.items.map((item, i) => {
            item.accountId = item["Account ID"] ? item["Account ID"] : '';
            item.accountName = item["Account Name"] ? item["Account Name"] : '';
            item.ITSM = item.Reference ? item.Reference : '';
            return item
          });
          setCloudAccounts(list)
        }
      }
      setCloudAccountsLoading(false)
    }

    if (entities === 'cloudAccount') {
      setCloudAccountLoading(true)
      data = await dataGet(entities, cloudAccount?.accountName)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'cloudAccount'
        })
        props.dispatch(err(error))
        let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
        cloudAccountCopy.cloudNetworks = []
        setCloudAccount(cloudAccountCopy)
      }
      else {
        if (data.data.length > 0) {
          let list = data.data.map((item, i) => {
            let sm = item.network.split('/')
            item.network = item.network ? item.network : '';
            item.network_container = item.network_container ? item.network_container : '';
            item.Region = item?.extattrs?.City?.value ? item.extattrs.City.value : '';
            item.comment
            item.existent = true
            item.subnetMaskCidr = sm[1]
            item.id = ++i
            return item
          });
          let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
          cloudAccountCopy.cloudNetworks = list
          setCloudAccount(cloudAccountCopy)
        }
      }
      setCloudAccountLoading(false)
    }

  }

  let dataGet = async (entities, accountName) => {
    let endpoint
    let r

    if (entities === 'configurations') {
      endpoint = `infoblox/${entities}/`
    }

    if (entities === 'cpAssets') {
      endpoint = `checkpoint/assets/`
    }

    if (entities === 'cloudAccounts') {
      endpoint = `workflow/cloud-accounts/`
    }

    if (entities === 'cloudAccount') {
      endpoint = `workflow/cloud-account/${accountName}/`
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

  let newAccountHandler = async() => {
      setLoading(true)

      let data = await dataGet('getNetworks', props.asset.id)
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
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

  let accountDel = async() => {
    setLoading(true)
      let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
      for (const cloudNet of cloudAccountCopy?.cloudNetworks) {
        let net = cloudNet.network.split('/')
        net = net[0]
        let body = {}
        body.data = {
          "change-request-id": "ITIO-777777779",
          "provider": provider,
          "infoblox_cloud_network_delete": [
            {
              "asset": props.asset?.id ? props.asset.id : null,
              "network": net
            }
          ],
          "checkpoint_datacenter_account_delete": {
            "asset": 1
          }
        }
        
        let n = await cloudNetworkDelete(cloudAccount.accountName, body)
        if (n.status && n.status !== 200 ) {
          let error = Object.assign(n, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'CloudNetworkOrAccountDeleteError'
          })
          props.dispatch(err(error))
        }
      }

    setAccountModify(false);
    setCloudAccount({});
    setLoading(false)
   
    dataGetHandler('cloudAccounts', props.asset.id)
  }

  let cloudNetworkAdd = async () => {
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(cloudAccountCopy.cloudNetworks)
    cloudAccountCopy.cloudNetworks = list
    setCloudAccount(cloudAccountCopy)
  }

  let cloudNetworkRemove = async cn => {
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(cn, cloudAccountCopy.cloudNetworks)
    cloudAccountCopy.cloudNetworks = list
    setCloudAccount(cloudAccountCopy)
  }

  /* SET */
  let set = async (key, value, cloudNetwork) => {
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let cloudNetworksCopy = cloudAccountCopy.cloudNetworks
    let cloudNet

    if (key === 'provider') {
      setProvider(value)
    }

    if (key === 'cpAsset') {
      setCpAsset(value)
    }

    if (key === 'accountId') {
      let cloudAccountsCopy = JSON.parse(JSON.stringify(cloudAccounts))
      let accountCopy = cloudAccountsCopy.find( a => a.accountId === value )
      setCloudAccount(accountCopy)
    }

    if (key === 'accountName') {
      let cloudAccountsCopy = JSON.parse(JSON.stringify(cloudAccounts))
      let accountCopy = cloudAccountsCopy.find( a => a.accountName === value )
      setCloudAccount(accountCopy)
    }

    if (cloudNetwork) {
      cloudNet = cloudNetworksCopy.find(cn => cn.id === cloudNetwork.id)

      if (key === 'Region') {
        if (provider === 'AWS') {
          if (value) {
            cloudNet.Region = 'aws-'+value
            delete cloudNet.RegionError
          }
        }
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
          cloudNet.comment = value
          delete cloudNet.commentError
        }
        else {
          //blank value while typing.
          cloudNet.comment = ''
        }

        setCloudAccount(cloudAccountCopy)

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

    if (key === 'ITSM') {
      let cloudNet = cloudNetworksCopy.find(cn => cn.id === cloudNetwork.id)
      let start = 0
      let end = 0
      let ref = myRefs[`${cloudNet.id}_ITSM`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      if (value) {
        cloudNet.ITSM = value
        delete cloudNet.ITSMError
      }
      else {
        //blank value while typing.
        cloudNet.ITSM = ''
      }

      setCloudAccount(cloudAccountCopy)

      ref = myRefs[`${cloudNet.id}_ITSM`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
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



    if (key !== 'accountId' && key !== 'accountName' && key !== 'ITSM' && key !== 'comment') {
      setCloudAccount(cloudAccountCopy)
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
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let cloudNetworksCopy = cloudAccountCopy.cloudNetworks
    let errors = 0

    if (!cpAsset) {
      //cpAssetError
    }

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

    setCloudAccount(cloudAccountCopy)
    return errors
  }

  /* DISPOSITION */

  let cudManager = async () => {
    let cloudNetworksCopy = JSON.parse(JSON.stringify(cloudNetworks))
    let toDelete = []
    let toPut = []

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
    }

    if (toDelete.length > 0) {
      for (const cloudNet of toDelete) {
        cloudNet.loading = true
        setCloudNetworks([...cloudNetworksCopy])
        let net = cloudNet.network.split('/')
        let n = await cloudNetworkDelete(net[0])
        if (n.status && n.status !== 200 ) {
          let error = Object.assign(n, {
            component: 'cloudAccount',
            vendor: 'concerto',
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
            component: 'cloudAccount',
            vendor: 'concerto',
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

    dataGetHandler('cloudAccounts', props.asset.id)
    
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
        component: 'cloudAccount',
        vendor: 'concerto',
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

  let cloudNetworkDelete = async (accountName, body) => {
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
    await rest.doXHR(`workflow/cloud-account/${accountName}/`, props.token, body )
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
    setCloudAccountsLoading(false);
    setCloudAccounts([]);
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

        if (action === 'modifyAccount') {
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
              disabled={(cloudAccount?.accountId) ? false : true}
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
                      try{
                        let str = `${r.regionName.toString()} - ${r.regionCode.toString()}`
                      return (
                        <Select.Option key={i} value={r.regionCode}>{str}</Select.Option>
                      )
                      }
                      catch (error) {
                        console.log(error)
                      }
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
                  cloudAccount?.accountId ? 
                    cloudAccount.accountId 
                  :
                    ''
                : 
                  key === 'accountName' ?
                    cloudAccount?.accountName ? 
                      cloudAccount.accountName 
                    :
                      ''
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
                {cloudAccounts ?
                  cloudAccounts.map((n, i) => {
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
    if (props.error && props.error.component === 'cloudAccount') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {console.log(cloudAccount)}
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
                      {cloudAccountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={3}>
                          {createElement('select', 'accountId', 'cloudAccounts', '')}
                        </Col>
                      }
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                      </Col>
                      {cloudAccountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={4}>
                          {createElement('select', 'accountName', 'cloudAccounts', '')}
                        </Col>
                      }
                      <Col span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ITSM:</p>
                      </Col>
                      {cloudAccountsLoading ?
                        <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                      :
                        <Col span={2}>
                          <p style={{marginRight: 10, marginTop: 5}}>{cloudAccount.ITSM}</p>
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
              (cloudAccount?.accountId) ?
                <React.Fragment>
                  <Button
                    type="primary"
                    style={{marginLeft: 16 }}
                    onClick={() => cloudNetworkAdd()}
                  >
                    Request a Cloud Account
                  </Button>
                  {cloudAccountLoading ? 
                    <>
                      <br/>
                      <Spin indicator={cloudNetLoadIcon} style={{margin: '10% 48%'}}/>
                    </>
                  :
                    <Table
                      columns={columns}
                      style={{width: '100%', padding: 15}}
                      dataSource={cloudAccount?.cloudNetworks ? cloudAccount.cloudNetworks : []}
                      bordered
                      rowKey={randomKey}
                      scroll={{x: 'auto'}}
                      pagination={{ pageSize: 10 }}
                    />
                  }
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
}))(CloudAccount);
