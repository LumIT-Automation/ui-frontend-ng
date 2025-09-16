import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../../_helpers/Rest'
import Authorizators from '../../_helpers/authorizators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'
import Card from '../../_components/card'

import {
  err
} from '../../concerto/store'

import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

import { Space, Modal, Row, Col, Divider, Table, Radio, Input, Select, Button, Checkbox, Spin, Alert, Result, Popover } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const cloudNetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*
Country = Provider
City = Region
Reference = AccountOwner (IT SERVICE MANAGER)
*/

/* 
@ todo
- permessi lettura reti e scrittura
- conferma delete
*/


function CloudAccount(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);

  let [infobloxConfigurations, setInfobloxConfigurations] = useState([]);

  let [awsRegions, setAwsRegions] = useState([])
  let [azureRegions, setAzureRegions] = useState([])
  let [ociRegions, setOciRegions] = useState([])

  let [existent, setExistent] = useState(true);
  
  let [providers, setProviders] = useState(['AWS', 'AZURE']);
  let [provider, setProvider] = useState('');
  let [regions, setRegions] = useState([]);

  let [azureScopes, setAzureScopes] = useState([]);
  let [azureScope, setAzureScope] = useState('');

  let [azureEnvs, setAzureEnvs] = useState([]);
  let [azureEnv, setAzureEnv] = useState('');

  let [ibAssets, setIbAssets] = useState([]);
  let [ibAsset, setIbAsset] = useState(0);  
  let [cpAssets, setCpAssets] = useState([]);
  let [cpAsset, setCpAsset] = useState(0);

  let [cloudAccountsLoading, setCloudAccountsLoading] = useState(false);
  let [cloudAccounts, setCloudAccounts] = useState([]);
  let [awsAccounts, setAwsAccounts] = useState([]);
  let [azureAccounts, setAzureAccounts] = useState([]);

  let [cloudAccountLoading, setCloudAccountLoading] = useState(false);
  let [cloudAccount, setCloudAccount] = useState({});

  let [origOperationTeams, setOrigOperationTeams] = useState([])
  let [availableOperationTeams, setAvailableOperationTeams] = useState([]);

  let [changeRequestId, setChangeRequestId] = useState('');

  let [subnetMaskCidrs, setSubnetMaskCidrs] = useState(['23', '24']);

  let [errors, setErrors] = useState({});

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let [response, setResponse] = useState('');

  let myRefs = useRef({});
  let textAreaRefs = useRef({});

  let [pageSize, setPageSize] = useState(10);

  let [checkedOperationTeams, setCheckedOperationTeams] = useState([]);
  let indeterminate = checkedOperationTeams.length > 0 && checkedOperationTeams.length < availableOperationTeams.length;
  let checkAll = availableOperationTeams.length === checkedOperationTeams.length;  


  //Chiedo configurations e assets
  useEffect(() => {
    if(visible){
      dataGetHandler('ibConfigurations')
      dataGetHandler('cpConfigurations')
      dataGetHandler('ibAssets')
      dataGetHandler('cpAssets')  
    }  
  }, [visible]);


  //Quando cambia infobloxConfigurations, setto le differenti regions per ogni providers
  useEffect(() => {
  if (Array.isArray(infobloxConfigurations) && infobloxConfigurations.length > 0) {
    let tmp = infobloxConfigurations.find(o => o.config_type === 'AWS Regions');
    setAwsRegions(tmp ? tmp.value : []); 

    tmp = infobloxConfigurations.find(o => o.config_type === 'AZURE Regions');
    setAzureRegions(tmp ? tmp.value : []); 

    tmp = infobloxConfigurations.find(o => o.config_type === 'OCI Regions');
    setOciRegions(tmp ? tmp.value : []); 
  } else {
    setAwsRegions([]);
    setAzureRegions([]);
    setOciRegions([]);
  }
}, [infobloxConfigurations]);


  //Setto le regions e i cloudAccounts correnti
  useEffect(() => {
  if (provider) {
    setCloudAccount({});
    //setAzureScope('');
    setAzureEnv('');
    if (provider === 'AWS') {
      setRegions(awsRegions);
      setCloudAccounts(awsAccounts); 
    } else if (provider === 'AZURE') {
      setRegions(azureRegions);
      setCloudAccounts(azureAccounts); 
    } 
  } else {
    setRegions([]);
    setCloudAccounts([]);
  }
}, [provider, awsAccounts, azureAccounts, awsRegions, azureRegions]); 


  //chiedo i cloud accounts
  useEffect(() => {
    if (ibAsset) {
      //setAzureScope('');
      setAzureEnv('');
      dataGetHandler('cloudAccounts', ibAsset)
    }    
  }, [ibAsset]);


  //chiedo uno specifico cloudAccount
  useEffect(() => {
    //setAzureScope('');
    
    if (cloudAccount.accountName && existent) {   
      setAzureEnv('');
      dataGetHandler('cloudAccount')
    }    
  }, [cloudAccount.accountId, cloudAccount.accountName]);


  //Se è un nuovo cloudAccount setto il primo item network
  useEffect(() => {
    if (!existent) {
      //setAzureScope('');
      setAzureEnv('');
      setCloudAccount({
        cloudNetworks: [{id:1}]
      })
    }
    else {
      setCloudAccount({})
      //setAzureScope('');
      setAzureEnv('');
    } 
  }, [existent]);

  //setto il nuovo nome composto solo se c'è l'env
  useEffect(() => {
    if (azureEnv) {
      try {
        let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
        let errorsCopy = JSON.parse(JSON.stringify(errors))
        if (provider === 'AZURE' && !existent && cloudAccountCopy?.newInputName) {
          delete errorsCopy.cloudAccountNameError
          cloudAccountCopy.accountName = `crif-${cloudAccountCopy.newInputName}-${azureEnv.toLowerCase()}`
          setCloudAccount(cloudAccountCopy)
          setErrors(errorsCopy);
        }
      }
      catch (err) {
        console.log('error')
      }        
    }
  }, [azureEnv]);

  //Rimuovo il messaggio di risposta dopo due secondi
  useEffect(() => {
    if (response) {
      setTimeout( () => setResponse(''), 2030)
    }
  }, [response]);


  let dataGetHandler = async (entities, assetId) => {
    let data

    if (entities === 'ibConfigurations') {
      setLoading(true);
      data = await dataGet('ibConfigurations')
      try {
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'ibConfigurationsError'
          })
          props.dispatch(err(error))
          setLoading(false);
        }
        else {
          if (data.data.items.length > 0) {
            setInfobloxConfigurations(data.data.items)
            setLoading(false);
          }
        }
      } catch (error) {
        setLoading(false);
        setInfobloxConfigurations([])
        console.log(error)
      }
    }

    if (entities === 'cpConfigurations') {
      setLoading(true);
      data = await dataGet('cpConfigurations')
      try {
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'cpConfigurationsError'
          })
          props.dispatch(err(error))
          setLoading(false);
        }
        else {
          let operationTeamMappingObject = data?.data?.items.find(o => o.config_type === 'tag-mapping');

          if (operationTeamMappingObject && operationTeamMappingObject.value && operationTeamMappingObject.value.options && operationTeamMappingObject.value.options.length > 0) {
            const operationTeams = operationTeamMappingObject.value.options.map(t => Object.values(t)[0]);
            setAvailableOperationTeams(operationTeams);
          }

          let datacenterAccountAZURE = data?.data?.items.find(o => o.config_type === 'datacenter-account-AZURE')

          let tmp = datacenterAccountAZURE?.value?.['datacenter-query']?.['query-rules']

          let scope = tmp.find(o => o.key === "crif:scope")
          let env = tmp.find(o => o.key === "crif:env")

          setAzureScopes(scope?.values)
          setAzureEnvs(env?.values)
          
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        setAvailableOperationTeams([])
        console.log(error)
      }
    }

    if (entities === 'ibAssets') {
      setLoading(true);
      data = await dataGet('ibAssets')
      try {
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'ibAssetsError'
          })
          props.dispatch(err(error))
          setLoading(false);
        }
        else {
          if (data.data.items.length > 0) {
            
            setLoading(false);
            setIbAssets(data.data.items)
          }
        }
      } catch (error) {
        setLoading(false);
        setIbAssets([])
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
    setCloudAccountsLoading(true);

    try {
        const data = await dataGet(entities, assetId);

        if (data.status && data.status !== 200) {
            const error = Object.assign(data, {
                component: 'cloudAccount',
                vendor: 'concerto',
                errorType: 'cloudAccounts'
            });
            props.dispatch(err(error));
            setAwsAccounts([]);
            setAzureAccounts([]);
        } else {
            if (data?.data?.items && data.data.items.length > 0) {
                const processedAwsAccounts = [];
                const processedAzureAccounts = [];

                data.data.items.forEach(item => {
                    const account = {
                        accountId: item["Account ID"] || '',
                        accountName: item["Account Name"] || '',
                        AccountOwner: item.Reference || ''
                    };

                    if (item.Country === 'Cloud-AWS') {
                        processedAwsAccounts.push(account);
                    } else if (item.Country === 'Cloud-AZURE') {
                        processedAzureAccounts.push(account);
                    }
                });

                setAwsAccounts(processedAwsAccounts);
                setAzureAccounts(processedAzureAccounts);
            } else {
                setAwsAccounts([]);
                setAzureAccounts([]);
            }
        }
    } catch (apiError) {
        const error = {
            message: apiError.message || 'Errore sconosciuto durante il recupero degli account cloud.',
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'cloudAccounts'
        };
        props.dispatch(err(error));
        setAwsAccounts([]);
        setAzureAccounts([]);
    } finally {
        setCloudAccountsLoading(false);
    }
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
        if (data?.data?.networks.length > 0) {
          let list = data.data.networks.map((item, i) => {
            let sm = item.network.split('/')
            item.network = item.network ? item.network : '';
            item.network_container = item.network_container ? item.network_container : '';
            item.Region = item?.extattrs?.City?.value ? item.extattrs.City.value : '';
            if (provider === 'AZURE') {
              item.azureScope = item?.extattrs?.Scope?.value ? item.extattrs.Scope.value : '';
            }
            item.existent = true
            item.subnetMaskCidr = sm[1]
            item.id = ++i
            return item
          });
          let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
          cloudAccountCopy.cloudNetworks = list
          cloudAccountCopy.operationTeams = data?.data?.tags ? data.data.tags : [] 
          setOrigOperationTeams(data?.data?.tags ? data.data.tags : [] )
          let cloudAccountOperationTeams = cloudAccountCopy.operationTeams.filter(elemento => availableOperationTeams.includes(elemento));
          
          setCheckedOperationTeams(cloudAccountOperationTeams)

          if (provider === 'AZURE') {
            try {
              const parts = cloudAccountCopy.accountName.split('-');

              if (parts.length >= 3) {
                const env = parts[2].toUpperCase();
                //const scope = parts[3].toUpperCase();

                //setAzureScope(azureScopes.includes(scope) ? scope : '');
                setAzureEnv(azureEnvs.includes(env) ? env : '');
              } else {
                console.warn("'accountName' wrong format:", cloudAccountCopy.accountName);
                //setAzureScope('');
                setAzureEnv('');
              }
            } catch (err) {
              console.error("Error during 'accountName' elaboration:", err);
              //setAzureScope('');
              setAzureEnv('');
            }
          }  

          setCloudAccount(cloudAccountCopy)      

        }
      }
      setCloudAccountLoading(false)
    }

  }

  let dataGet = async (entities, accountName) => {
    let endpoint
    let r

    if (entities === 'ibConfigurations') {
      endpoint = `infoblox/configurations/`
    }

    if (entities === 'cpConfigurations') {
      endpoint = `checkpoint/configurations/`
    }

    if (entities === 'ibAssets') {
      endpoint = `infoblox/assets/`
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
    let errorsCopy = JSON.parse(JSON.stringify(errors))

    if (key === 'provider') {
      setProvider(value)
    }

    if (key === 'azureEnv') {
      delete errorsCopy.azureEnvError
      setAzureEnv(value)
      setErrors(errorsCopy);
    }

    if (key === 'ibAsset') {
      delete errorsCopy.ibAssetError
      setErrors(errorsCopy);
      setIbAsset(value)
    }

    if (key === 'cpAsset') {
      delete errorsCopy.cpAssetError
      setErrors(errorsCopy);
      setCpAsset(value)
    }
    
    if (key === 'changeRequestId') {
      delete errorsCopy.changeRequestIdError
      setChangeRequestId(value);
      setErrors(errorsCopy);
      let ref = myRefs.current['changeRequestId'];
      if (ref && ref.input) {
        ref.input.focus();
      }
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
        if (value) {
          cloudNet.Region = value
          delete cloudNet.RegionError
          setCloudAccount(cloudAccountCopy)
          setErrors(errorsCopy);
        }
      }
      
      if (key === 'subnetMaskCidr') {
        cloudNet.subnetMaskCidr = value
        delete cloudNet.subnetMaskCidrError
        setCloudAccount(cloudAccountCopy)
        setErrors(errorsCopy);
      }

      if (key === 'azureScope') {
        cloudNet.azureScope = value
        delete cloudNet.azureScopeError
        setCloudAccount(cloudAccountCopy)
        setErrors(errorsCopy);
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
        setCloudAccount(cloudAccountCopy)
      }

    }

    if (key === 'cloudAccountId') {
      delete errorsCopy.cloudAccountIdError
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.accountId = value
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current['cloudAccountId'];
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'cloudAccountName') {
      delete errorsCopy.cloudAccountNameError
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.accountName = value
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current.cloudAccountName;
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'newInputName') {
      setAzureEnv('')
      delete errorsCopy.cloudAccountNameError
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.newInputName = value
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current.newInputName;
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'cloudAccountAccountOwner') {
      delete errorsCopy.cloudAccountAccountOwnerError
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.AccountOwner = value
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current.cloudAccountAccountOwner;
      if (ref && ref.input) {
        ref.input.focus();
      }
    }
    
  }

  /* VALIDATION */

  let validation = async () => {
    let localErrors = await validationCheck()
    if (localErrors === 0) {
      cudManager()
    }
  }

  let validationCheck = async () => {
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let cloudNetworksCopy = cloudAccountCopy.cloudNetworks
    let localErrors = 0
    let errorsCopy = JSON.parse(JSON.stringify(errors))

    if (!cpAsset) {
      errorsCopy.cpAssetError = true
      ++localErrors
      setErrors(errorsCopy);
    }

    if (!changeRequestId) {
      errorsCopy.changeRequestIdError = true
      ++localErrors
      setErrors(errorsCopy);
    } 

    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      errorsCopy.changeRequestIdError = true
      ++localErrors
      setErrors(errorsCopy);
    } 

    for (let cloudNet of Object.values(cloudNetworksCopy)) {
      if (!cloudNet.Region) {
        ++localErrors
        cloudNet.RegionError = true
      }
      if (!cloudNet.subnetMaskCidr) {
        ++localErrors
        cloudNet.subnetMaskCidrError = true
      }
      if (provider === 'AZURE') {
        if (!cloudNet.azureScope) {
          ++localErrors
          cloudNet.azureScopeError = true
        }
      }

    }

    if (provider === 'AZURE') {
      if (!azureEnv) {
        errorsCopy.azureEnvError = true
        ++localErrors
        setErrors(errorsCopy);
      }

    }
    else {
      delete errorsCopy.azureEnvError
      setErrors(errorsCopy);
    }

    setCloudAccount(cloudAccountCopy)
    return localErrors
  }

  /* DISPOSITION */
  let accountDel = async() => {
    let localErrors = await validationCheck()
    if (localErrors === 0) {
      setLoading(true)
      let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
      for (const cloudNet of cloudAccountCopy?.cloudNetworks) {
        let net = cloudNet.network.split('/')
        net = net[0]
        let body = {}
        body.data = {
          "change-request-id": changeRequestId,
          "provider": provider,
          "infoblox_cloud_network_delete": [
            {
              "asset": ibAsset? ibAsset : null,
              "network": net
            }
          ],
          "checkpoint_datacenter_account_delete": {
            "asset": cpAsset
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
      setResponse('account deleted')

      setCloudAccount({});
      setExistent(true)
      setLoading(false)
      setChangeRequestId('');
      setCpAsset(null)
      setCheckedOperationTeams([])
    
      dataGetHandler('cloudAccounts', ibAsset)
    }
  }

  let cudManager = async () => {
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let toDelete = []
    let toPut = []

    for (const cloudNet of cloudAccountCopy?.cloudNetworks) {
      if (cloudNet.toDelete) {
        toDelete.push(cloudNet)
      }
      else if (!cloudNet.existent){
        toPut.push(cloudNet)
      }
    }

    setLoading(true)

    if (toDelete.length > 0) {
      for (const cloudNet of toDelete) {
        let net = cloudNet.network.split('/')
        net = net[0]
        let body = {}
        body.data = {
          "change-request-id": changeRequestId,
          "provider": provider,
          "infoblox_cloud_network_delete": [
            {
              "asset": ibAsset ? ibAsset : null,
              "network": net
            }
          ],
          "checkpoint_datacenter_account_delete": {
            "asset": cpAsset
          }
        }
        
        let n = await cloudNetworkDelete(cloudAccountCopy.accountName, body)
        if (n.status && n.status !== 200 ) {
          let error = Object.assign(n, {
            component: 'cloudAccount',
            vendor: 'concerto',
            errorType: 'CloudNetworkOrAccountDeleteError'
          })
          props.dispatch(err(error))
        }
      }
    }
    
    if (toPut.length > 0) {
      let body = {}
        body.data = {
          "change-request-id": changeRequestId,
          "Account ID": cloudAccountCopy.accountId,
          "Reference": cloudAccountCopy.AccountOwner,
          "provider": provider,
          "checkpoint_datacenter_account_put": {
            "asset": cpAsset,
            "tags": checkedOperationTeams
          }
        }

      let list = toPut.map((n,i) => { 
        let o = {}
        o.asset = ibAsset
        o.subnetMaskCidr = n.subnetMaskCidr
        o.region = n.Region
        if (provider === 'AZURE') {
          o.scope = n.azureScope.toLowerCase()
        }
        return o
      })

      body.data.infoblox_cloud_network_assign = list 

      if (provider === 'AZURE') {
        body.data.azure_data = {
            "env": azureEnv,
        }
      }
      
      let n = await cloudAccountPut(cloudAccountCopy.accountName, body)
      if (n.status && n.status !== 200 ) {
        let error = Object.assign(n, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'CloudAccountPutError'
        })
        props.dispatch(err(error))
      }
    }
    else {
      //per modificare le tags senza aggiungere reti
      let body = {}
        body.data = {
          "change-request-id": changeRequestId,
          "Account ID": cloudAccountCopy.accountId,
          "Reference": cloudAccountCopy.AccountOwner,
          "provider": provider,
          "checkpoint_datacenter_account_put": {
            "asset": cpAsset,
            "tags": checkedOperationTeams
          }
        }

      body.data.infoblox_cloud_network_assign = [] 

      if (provider === 'AZURE') {
        body.data.azure_data = {
            "env": azureEnv,
        }
      }
      
      let n = await cloudAccountPut(cloudAccountCopy.accountName, body)
      if (n.status && n.status !== 200 ) {
        let error = Object.assign(n, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'CloudAccountPutError'
        })
        props.dispatch(err(error))
      }
    }

    setResponse('commit succesful')
    //setCloudAccount({});
    //setExistent(true)
    setLoading(false)
    //setChangeRequestId('');
    //setCpAsset(null)
    //setCheckedOperationTeams([])
    
  
    await dataGetHandler('cloudAccounts', ibAsset)

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

  let cloudAccountPut = async (accountName, body) => {
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
    await rest.doXHR(`workflow/cloud-account/${accountName}/`, props.token, body )
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
    setLoading(false);

    setInfobloxConfigurations([])

    setExistent(true);
    
    setProviders(['AWS']);
    setProvider('');
    setRegions([]);
    setAzureScopes([]);
    setAzureEnvs([]);

    //setAzureScope('');
    setAzureEnv('');

    setIbAssets([]);
    setIbAsset(0);  
    setCpAssets([]);
    setCpAsset(0);

    setCloudAccountsLoading(false);
    setCloudAccounts([]);

    setCloudAccountLoading(false);
    setCloudAccount({});

    setOrigOperationTeams([])
    setAvailableOperationTeams([]);

    setChangeRequestId('');

    setSubnetMaskCidrs(['23', '24']);

    setErrors({});

    setResponse('');

    setCheckedOperationTeams([]);
    let indeterminate = checkedOperationTeams.length > 0 && checkedOperationTeams.length < availableOperationTeams.length;
    let checkAll = availableOperationTeams.length === checkedOperationTeams.length; 

  }

  let onChangeCustom = (list) => {
    setCheckedOperationTeams(list)
    //setIndeterminate(!!list.length && list.length < availableOperationTeams.length)
    //setCheckAll(list.length === availableOperationTeams.length)
  };

  let onCheckAllChange = (e) => {
    setCheckedOperationTeams((e.target.checked ? availableOperationTeams : []))
  };
  
  /* RENDER */

  let createElement = (element, key, choices, obj, action) => {

    if (element === 'input') {
      if (key === 'changeRequestId' ) {
        return (
          <Input
            value={changeRequestId}
            ref={ref => (myRefs.current['changeRequestId'] = ref)}
            placeholder={
              key === 'changeRequestId' ?
                "Format: ITIO-<number> (min 6 max 18 digits)"
              :
                null
              }
            style=
            {errors[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'cloudAccountId') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={cloudAccount?.accountId}
            ref={ref => (myRefs.current.cloudAccountId = ref)}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'cloudAccountName') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={cloudAccount?.accountName}
            ref={ref => (myRefs.current.cloudAccountName = ref)}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

      else if (key === 'newInputName') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={cloudAccount?.newInputName}
            ref={ref => (myRefs.current.newInputName = ref)}
            onChange={event => set(key, event.target.value)}
          />
        )
      }



      else if (key === 'cloudAccountAccountOwner') {
        return (
          <Input
            style=
            {obj[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            value={cloudAccount?.AccountOwner}
            ref={ref => (myRefs.current.cloudAccountAccountOwner = ref)}
            onChange={event => set(key, event.target.value)}
          />
        )
      }

    }
    switch (element) {
      
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
              type="primary" 
              danger 
              disabled={(cloudAccount?.accountId) ? false : true}
            >
              Delete Account
            </Button>
          </Popover>
          )
        }

      case 'textArea':
        return (
          <Input.TextArea
            rows={7}
            value={obj[key]}
            //ref={ref => textAreaRefs[`${obj.id}_${key}`] = ref}
            disabled={true}
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
                { 
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
        else if (key === 'azureScope') {
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
                {azureScopes ? 
                  azureScopes.map((n, i) => {
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
        else if (key === 'azureEnv') {
          return (
            <Select
              value={azureEnv}
              showSearch
              style={
                errors.azureEnvError ?
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
                {azureEnvs ?
                  azureEnvs.map((n, i) => {
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
        /*else if (key === 'azureScope') {
          return (
            <Select
              value={azureScope}
              showSearch
              style={
                errors.azureScopeError ?
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
                {azureScopes ?
                  azureScopes.map((n, i) => {
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
        }*/                                
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
         
      case 'checkboxGroup':
        return (
          <React.Fragment>
            <Checkbox 
              indeterminate={indeterminate} 
              onChange={onCheckAllChange} 
              checked={checkAll}
            >
              Check all
            </Checkbox>

            <Divider />

            <Checkbox.Group 
              options={availableOperationTeams} 
              value={checkedOperationTeams} 
              onChange={onChangeCustom}
            />
          </React.Fragment>
        )
      

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
      width: 300,
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
      width: 20,
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
    (provider === 'AZURE' && {
      title: 'Scope',
      align: 'center',
      dataIndex: 'azureScope',
      width: 200,
      key: 'azureScope',
      ...getColumnSearchProps(
        'azureScope', 
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
          cloudNet.azureScope
        :
          createElement('select', 'azureScope', '', cloudNet, '')
      )
    }),
    
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
              type="primary"
              danger
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
        {console.log('cloudAccount', cloudAccount)}
        {console.log('azureEnv', azureEnv)}
      <Card 
        props={{
          width: 200, 
          title: 'Cloud Account Management', 
          details: 'Cloud Account Management.',
          color: '#e8b21e',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{textAlign: 'center'}}>{props.service.toUpperCase()}</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1800}
        maskClosable={false}
      >
        
        <React.Fragment>
          { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !loading && response &&
            <Result
                status="success"
                title={response}
              />
          }
          { !loading && !response && (Array.isArray(infobloxConfigurations) && (infobloxConfigurations.length > 0) ?
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
                    <Col span={2}>
                      <p style={{marginLeft: 10, marginRight: 10, float: 'right'}}>Infoblox asset:</p>
                    </Col>
                    <Col span={6}>
                      <Radio.Group 
                        style={
                          errors?.ibAssetError ? 
                            {backgroundColor: 'red'}
                          :
                            {}
                        }
                        onChange={event => set('ibAsset', event.target.value)} 
                        value={ibAsset}
                      >
                        <Space direction="vertical">
                          {ibAssets ?
                            ibAssets.map((r,i) => {
                              try{
                                return (
                                  <Radio value={r.id}>{r.fqdn}</Radio>
                                )
                              }
                              catch (error) {
                                console.log(error)
                              }
                            })
                          :
                            null
                          }
                          
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Row>
                  <br/>

                </React.Fragment>
              :
                null
              }

              {ibAsset > 0 ?
                <React.Fragment>

                  <Row>
                    <Col span={2}>
                      <p style={{marginLeft: 10, marginRight: 10, float: 'right'}}>Check Point asset:</p>
                    </Col>
                    <Col span={6}>
                      <Radio.Group 
                        style={
                          errors?.cpAssetError ? 
                            {backgroundColor: 'red'}
                          :
                            {}
                        }
                        onChange={event => set('cpAsset', event.target.value)} 
                        value={cpAsset}
                      >
                        <Space direction="vertical">
                          {cpAssets ?
                            cpAssets.map((r,i) => {
                              try{
                                return (
                                  <Radio value={r.id}>{r.fqdn}</Radio>
                                )
                              }
                              catch (error) {
                                console.log(error)
                              }
                            })
                          :
                            null
                          }
                          
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Row>
                  <br />

                  <Row>
                    <Col span={2}>
                      <p style={{marginLeft: 10, marginRight: 10, marginTop: 5, float: 'right'}}>Change request id:</p>
                    </Col>
                    <Col span={6}>
                      {createElement('input', 'changeRequestId')}
                    </Col>
                  </Row>
                  <br />
                  <br />

                  <Row>
                    <Col span={21}>
                      <Radio.Group
                        defaultValue="existent"
                        buttonStyle="solid"
                        value={existent ? 'existent' : 'new'}
                        style={{ marginLeft: 25 }} // Spazio a sinistra dei bottoni
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
                        <Col span={3}>
                          <p style={{marginLeft: 20, marginTop: 5}}>Account ID (len 12 numbers):</p>
                        </Col>
                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={3}>
                            {createElement('select', 'accountId', 'cloudAccounts', '')}
                          </Col>
                        }
                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                        </Col>
                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={5}>
                            {createElement('select', 'accountName', 'cloudAccounts', '')}
                          </Col>
                        }
                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Owner:</p>
                        </Col>
                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={2}>
                            <p style={{marginRight: 10, marginTop: 5}}>{cloudAccount.AccountOwner}</p>
                          </Col>
                        }
                      </Row>

                      <br/>
                      <br/>

                      <Row>
                        <Col span={2}>
                          <p style={{marginRight: 10, float: 'right'}}>Operation Teams</p>
                        </Col>
                      <Col offset={1} span={3}>
                          {cloudAccountLoading ? 
                            <Spin indicator={cloudNetLoadIcon} style={{margin: 'auto 48%'}}/>
                          :
                            createElement('checkboxGroup', 'operationTeams', 'cloudAccounts', '')
                          }
                        </Col>
                      </Row>

                      
                      <br/>

                      {/*
                        provider === 'AZURE' ?
                        <>
                          <br/>
                          
                          <Row>
                            
                            <Col offset={1} span={1}>
                              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>azureScope:</p>
                            </Col>
                            
                            <Col span={2}>
                              {createElement('select', 'azureScope', 'azureScopes', '')}
                            </Col>
                            

                            <Col offset={1} span={1}>
                              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>azureEnv:</p>
                            </Col>
                            
                            <Col span={2}>
                              {createElement('select', 'azureEnv', 'azureEnvs', '')}
                            </Col>
                          </Row>
                          <br/>
                          </>
                        :
                          null
                      */}

                      <Row>
                        <Col span={1} style={{marginLeft: 20}}>
                          {createElement('popOver', '', '', '', 'delAccount')}
                        </Col>
                      </Row>
                    </>
                  :
                    <>
                      <Row>

                        <Col span={4}>
                          <p style={{marginLeft: 20, marginTop: 5}}>New Account ID (len 12 numbers):</p>
                        </Col>
                        <Col span={3}>
                          {createElement('input', 'cloudAccountId', '', '', '')}
                        </Col>

                        <Col offset={1} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Name:</p>
                        </Col>
                        <Col offset={0.5} span={5} style={{ marginBottom: 8}}>
                          <div style={{ display: 'flex', alignItems: 'center'}}>
                            <span>crif-</span>
                            {createElement('input', 'newInputName', '', '', '')}
                            <span>-</span>
                            {createElement('select', 'azureEnv', 'azureEnvs', '')}
                          </div>
                          <p style={{marginTop: 5, float: 'right'}}>{cloudAccount?.accountName || ''}</p>
                        </Col>

                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Owner:</p>
                        </Col>
                        <Col span={2}>
                          {createElement('input', 'cloudAccountAccountOwner', '', '', '')}
                        </Col>

                      </Row>

                      <br/>
                      <br/>
                        
                      <Row>
                        <Col span={2}>
                          <p style={{marginRight: 10, float: 'right'}}>Operation Teams</p>
                        </Col>
                        <Col offset={1} span={3}>
                          {cloudAccountLoading ? 
                            <Spin indicator={cloudNetLoadIcon} style={{margin: 'auto 48%'}}/>
                          :
                            createElement('checkboxGroup', 'operationTeams', 'cloudAccounts', '')
                          }
                        </Col>
                        </Row>

                      <br/>
                      <br/>

                      {/*
                        provider === 'AZURE' ?
                        <>
                          <br/>
                          
                          <Row>
                            <Col offset={1} span={1}>
                              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>azureScope:</p>
                            </Col>
                            
                            <Col span={2}>
                              {createElement('select', 'azureScope', 'azureScopes', '')}
                            </Col>
                            
                            <Col offset={1} span={1}>
                              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>azureEnv:</p>
                            </Col>
                            
                            <Col span={2}>
                              {createElement('select', 'azureEnv', 'azureEnvs', '')}
                            </Col>
                          </Row>
                          <br/>
                          </>
                        :
                          null
                      */}

                      <Row>
                        <Col span={1} style={{marginLeft: 20}}>
                          {createElement('popOver', '', '', '', 'delAccount')}
                        </Col>
                      </Row>
                    </>
                  }
                </React.Fragment>
              :
                null
              }

              
              
              <Divider/>

              {(cloudAccount?.accountId) ?
                <React.Fragment>
                  <Button
                    type="primary"
                    style={{marginLeft: 16 }}
                    disabled={cloudAccountLoading ? true : false}
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
                    <>
                      <Table
                        columns={columns}
                        style={{width: '100%', padding: 15}}
                        dataSource={cloudAccount?.cloudNetworks ? cloudAccount.cloudNetworks : []}
                        bordered
                        rowKey={record => record.id}
                        scroll={{x: 'auto'}}
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
                        disabled={cloudAccountLoading ? true : false}
                        onClick={() => validation()}
                      >
                        Commit
                      </Button>
                      <br/>
                    </>
                    
                  }
                  
                </React.Fragment>
              :
                null
            }

            </React.Fragment>
          :
            <Alert message="No valid Infoblox Configration" type="error" />)
          }
        </React.Fragment>

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
