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

  let [composeName, setComposeName] = useState(false)

  let [infobloxAssets, setInfobloxAssets] = useState([]);
  let [infobloxAsset, setInfobloxAsset] = useState(0);  
  let [checkPointAssets, setCheckPointAssets] = useState([]);
  let [checkPointAsset, setCheckPointAsset] = useState(0);

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
      getInfobloxConfigurations()
      getCheckpointConfigurations()
      getInfobloxAssets()
      getCheckpointAssets()
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


  //Chiedo i cloud accounts
  useEffect(() => {
    if (infobloxAsset) {
      setAzureEnv('');
      getCloudAccounts(infobloxAsset)
    }    
  }, [infobloxAsset]);

  //Se è un nuovo cloudAccount setto il primo item network
  useEffect(() => {
    if (!existent) {
      setAzureEnv('');
      setCloudAccount({
        cloudNetworks: [{id:1}],
        newInputName: ''
      })
    }
    else {
      setCloudAccount({})
      setAzureEnv('');
    } 
  }, [existent]);


  //chiedo uno specifico cloudAccount
  useEffect(() => {
    
    if (cloudAccount.accountName && existent) {   
      setAzureEnv('');
      getCloudAccount(cloudAccount.accountName)
    }    
  }, [cloudAccount.accountId, cloudAccount.accountName]);


  //setto il nuovo nome composto solo se c'è l'env
  useEffect(() => {

    if (composeName && provider === 'AZURE') {

      try {
        let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
        let errorsCopy = JSON.parse(JSON.stringify(errors))
        if (!existent && cloudAccountCopy?.newInputName && azureEnv) {
          delete errorsCopy.accountName
          cloudAccountCopy.accountName = `crif-${cloudAccountCopy.newInputName}-${azureEnv}`
          setCloudAccount(cloudAccountCopy)
          setErrors(errorsCopy);
        }
      }
      catch (err) {
        console.error('error')
      }        
    }
    else if (composeName && provider === 'AWS') {
      try {
        let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
        let errorsCopy = JSON.parse(JSON.stringify(errors))
        if (!existent && cloudAccountCopy?.newInputName) {
          delete errorsCopy.accountName
          cloudAccountCopy.accountName = `CRIF-${cloudAccountCopy.newInputName}`
          setCloudAccount(cloudAccountCopy)
          setErrors(errorsCopy);
        }
      }
      catch (err) {
        console.error('error')
      }    
    }
    else {
      setComposeName(false)
    }
  }, [composeName, azureEnv]);


  //Rimuovo il messaggio di risposta dopo due secondi
  useEffect(() => {
    if (response) {
      setTimeout( () => setResponse(''), 2030)
    }
  }, [response]);

  let getInfobloxConfigurations = async () => {
    setLoading(true);
    let data = await dataGet('ibConfigurations')
    try {
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'ibConfigurationsError'
        })
        props.dispatch(err(error))
        setInfobloxConfigurations([])
      }
      else {
        if (data.data.items.length > 0) {
          setInfobloxConfigurations(data.data.items)
        } else {
          setInfobloxConfigurations([]) 
        }
      }
    } catch (error) {
      setInfobloxConfigurations([])
      console.error(error) 
    } finally {
      setLoading(false); 
    }
  }

  let getCheckpointConfigurations = async () => {
    setLoading(true);
    let data = await dataGet('cpConfigurations')
    try {
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'cpConfigurationsError'
        })
        props.dispatch(err(error))
        setAvailableOperationTeams([])
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

      }
    } catch (error) {
      setAvailableOperationTeams([])
      console.error(error)
    } finally {
      setLoading(false); 
    }
  }

  let getInfobloxAssets = async () => {
    setLoading(true);
    let data = await dataGet('infobloxAssets')
    try {
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'infobloxAssetsError'
        })
        props.dispatch(err(error))
        setInfobloxAssets([])
      }
      else {
        if (data.data.items.length > 0) {
          setInfobloxAssets(data.data.items)
        } else {
          setInfobloxAssets([]) 
        }
      }
    } catch (error) {
      setInfobloxAssets([])
      console.error(error)
    } finally {
      setLoading(false); 
    }
  }

  let getCheckpointAssets = async () => {
    setLoading(true);
    let data = await dataGet('checkPointAssets')
    try {
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'cloudAccount',
          vendor: 'concerto',
          errorType: 'checkPointAssetsError'
        })
        props.dispatch(err(error))
        setCheckPointAssets([])
      }
      else {
        if (data.data.items.length > 0) {
          setCheckPointAssets(data.data.items)
        } else {
          setCheckPointAssets([]) 
        }
      }
    } catch (error) {
      setCheckPointAssets([])
      console.error(error)
    } finally {
      setLoading(false); 
    }
  }

  let getCloudAccounts = async (assetId, cloudAccountToCall) => {
    setCloudAccountsLoading(true);
    try {
      let data = await dataGet('cloudAccounts', assetId);

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
                accountOwner: item.Reference || ''
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

        if (cloudAccountToCall) {
          await getCloudAccount(cloudAccountToCall)
        }
    }
  }

  let getCloudAccount = async (name) => {
    setCloudAccountLoading(true)
    let data = await dataGet('cloudAccount', name)
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
      let list = []
      if (data?.data?.networks.length > 0) {
        list = data.data.networks.map((item, i) => {
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
      }

      let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))

      cloudAccountCopy.cloudNetworks = list
      cloudAccountCopy.operationTeams = data?.data?.tags ? data.data.tags : [] 
      setOrigOperationTeams(data?.data?.tags ? data.data.tags : [] )
      let cloudAccountOperationTeams = cloudAccountCopy.operationTeams.filter(elemento => availableOperationTeams.includes(elemento));
      
      setCheckedOperationTeams(cloudAccountOperationTeams)

      if (provider === 'AZURE') {
        try {
          const parts = cloudAccountCopy.accountName.split('-');

          if (Array.isArray(parts)) {
            let env = parts[parts.length - 1];
            if (env && azureEnvs.includes(env)) {
              setAzureEnv(env)
              let errorsCopy = JSON.parse(JSON.stringify(errors))
              delete errorsCopy.azureEnv
              setErrors(errorsCopy);
            }
            else {
              console.warn(`account ${env} not included in azure envs: `, cloudAccountCopy.accountName);
              setAzureEnv('');
            }
          }
          else {
            console.warn("accountName wrong format:", cloudAccountCopy.accountName);
            setAzureEnv('');
          }
          
        } catch (err) {
          console.error("Error during 'accountName' elaboration:", err);
          setAzureEnv('');
        }
      }  

      setCloudAccount(cloudAccountCopy)      

    }
    
    setCloudAccountLoading(false)
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

    if (entities === 'infobloxAssets') {
      endpoint = `infoblox/assets/`
    }

    if (entities === 'checkPointAssets') {
      endpoint = `checkpoint/assets/`
    }

    if (entities === 'cloudAccounts') {
      endpoint = `workflow/crif/cloud-accounts/`
    }

    if (entities === 'cloudAccount') {
      endpoint = `workflow/crif/cloud-account/${accountName}/`
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

    if (key === 'infobloxAsset') {
      setInfobloxAsset(value)
    }

    if (key === 'checkPointAsset') {
      delete errorsCopy.checkPointAsset
      setErrors(errorsCopy);
      setCheckPointAsset(value)
    }
    
    if (key === 'changeRequestId') {
      delete errorsCopy.changeRequestId
      setChangeRequestId(value);
      setErrors(errorsCopy);
      let ref = myRefs.current['changeRequestId'];
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'accountId') {
      if (existent) {
        let cloudAccountsCopy = JSON.parse(JSON.stringify(cloudAccounts))
        let accountCopy = cloudAccountsCopy.find( a => a.accountId === value )
        setCloudAccount(accountCopy)
      }
      else {
        delete errorsCopy.accountId
        let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
        accountCopy.accountId = value
        setErrors(errorsCopy);
        setCloudAccount(accountCopy)
        let ref = myRefs.current['accountId'];
        if (ref && ref.input) {
          ref.input.focus();
        }
      }
    }

    if (key === 'accountName') {
      if (existent) {
        let cloudAccountsCopy = JSON.parse(JSON.stringify(cloudAccounts))
        let accountCopy = cloudAccountsCopy.find( a => a.accountName === value )
        setCloudAccount(accountCopy)  
      }
      else {
        delete errorsCopy.accountName
        let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
        accountCopy.accountName = value
        setErrors(errorsCopy);
        setCloudAccount(accountCopy)
        let ref = myRefs.current.accountName;
        if (ref && ref.input) {
          ref.input.focus();
        }
      }
    }

    if (key === 'newInputName') {
      setComposeName(false)
      setAzureEnv('')
      delete errorsCopy.newInputName
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.newInputName = value
      delete accountCopy.accountName
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current.newInputName;
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'accountOwner') {
      delete errorsCopy.accountOwner
      let accountCopy = JSON.parse(JSON.stringify(cloudAccount))
      accountCopy.accountOwner = value
      setErrors(errorsCopy);
      setCloudAccount(accountCopy)
      let ref = myRefs.current.accountOwner;
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'azureEnv') {
      delete errorsCopy.azureEnv
      setAzureEnv(value)
      setComposeName(true)
      setErrors(errorsCopy);
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

  }

  /* VALIDATION */
  //'^[0-9]{12}$|^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$'
  //const validRegex = /^[0-9]{12}$|^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$'/

  let validation = async () => {
    let localErrors = await validationCheck()
    if (localErrors === 0) {
      writeHandler()
    }
  }

  let validationCheck = async () => {

    //console.log(azureEnv)
    let cloudAccountCopy = JSON.parse(JSON.stringify(cloudAccount))
    let cloudNetworksCopy = cloudAccountCopy.cloudNetworks
    let localErrors = 0
    let errorsCopy = JSON.parse(JSON.stringify(errors))

    if (!checkPointAsset) {
      errorsCopy.checkPointAsset = true
      ++localErrors
      setErrors(errorsCopy);
    }

    if (!changeRequestId) {
      errorsCopy.changeRequestId = true
      ++localErrors
      setErrors(errorsCopy);
    } 

    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      errorsCopy.changeRequestId = true
      ++localErrors
      setErrors(errorsCopy);
    } 

    if (!cloudAccountCopy.accountOwner) {
      errorsCopy.accountOwner = true
      ++localErrors
      setErrors(errorsCopy);
    }

    if (!checkedOperationTeams || checkedOperationTeams.length < 1) {
      errorsCopy.operationTeams = true
      ++localErrors
      setErrors(errorsCopy);
    }

    try {
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
          errorsCopy.azureEnv = true
          ++localErrors
          setErrors(errorsCopy);
        }
        if (!existent && !cloudAccountCopy?.newInputName) {
          errorsCopy.newInputName = true
          ++localErrors
          setErrors(errorsCopy);
        }

      }
      else {
        delete errorsCopy.azureEnv
        setErrors(errorsCopy);
      }
    }
    catch (err) {
      console.error(err)
    }

    console.log('Errors recap: ', errorsCopy)
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
              "asset": infobloxAsset? infobloxAsset : null,
              "network": net
            }
          ],
          "checkpoint_datacenter_account_delete": {
            "asset": checkPointAsset
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
      setCheckedOperationTeams([])
    
      getCloudAccounts(infobloxAsset)
    }
  }

  let writeHandler = async () => {

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
              "asset": infobloxAsset ? infobloxAsset : null,
              "network": net
            }
          ],
          "checkpoint_datacenter_account_delete": {
            "asset": checkPointAsset
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
          "Reference": cloudAccountCopy.accountOwner,
          "provider": provider,
          "checkpoint_datacenter_account_put": {
            "asset": checkPointAsset,
            "tags": checkedOperationTeams
          }
        }

      let list = toPut.map((n,i) => { 
        let o = {}
        o.asset = infobloxAsset
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
          "Reference": cloudAccountCopy.accountOwner,
          "provider": provider,
          "checkpoint_datacenter_account_put": {
            "asset": checkPointAsset,
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

    setCloudAccount({});
    setCheckedOperationTeams([])
    setExistent(true)
    setLoading(false)  
  
    await getCloudAccounts(infobloxAsset, cloudAccountCopy.accountName)
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
    await rest.doXHR(`workflow/crif/cloud-account/${accountName}/`, props.token, body )
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
    await rest.doXHR(`workflow/crif/cloud-account/${accountName}/`, props.token, body )
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
    
    setProviders(['AWS', 'AZURE']);
    setProvider('');
    setRegions([]);
    setAzureScopes([]);
    setAzureEnvs([]);

    //setAzureScope('');
    setAzureEnv('');

    setInfobloxAssets([]);
    setInfobloxAsset(0);  
    setCheckPointAssets([]);
    setCheckPointAsset(0);

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
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    delete errorsCopy.operationTeams
    setErrors(errorsCopy);
    setCheckedOperationTeams(list)
    //setIndeterminate(!!list.length && list.length < availableOperationTeams.length)
    //setCheckAll(list.length === availableOperationTeams.length)
  };

  let onCheckAllChange = (e) => {
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    delete errorsCopy.operationTeams
    setErrors(errorsCopy);
    setCheckedOperationTeams((e.target.checked ? availableOperationTeams : []))
  };
  

  /* RENDER */

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
          <Select
            value={cloudNet.Region}
            showSearch
            style={
              cloudNet.RegionError ?
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
            onSelect={event => set('Region', event, cloudNet)}
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
                      console.error(error)
                    }
                  })
                :
                  []
              }
            </React.Fragment>
          </Select>
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
          <Select
            value={cloudNet.subnetMaskCidr}
            showSearch
            style={
              cloudNet.subnetMaskCidrError ?
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
            onSelect={event => set('subnetMaskCidr', event, cloudNet)}
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
        <Input.TextArea
          rows={7}
          value={cloudNet.comment}
          disabled={true}
          ref={ref => {
            if (ref) {
              textAreaRefs.current[`${cloudNet.id}_comment`] = ref;
            }
          }}
          onChange={event => set('comment', event.target.value, cloudNet)}
          style={{width: 350}}
        />
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

  let insertIndex = 6

  if (provider === 'AZURE') {
    let azureScopeColumn = {
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
          <Select
            value={cloudNet.azureScope}
            showSearch
            style={
              cloudNet.azureScopeError ?
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
            onSelect={event => set('azureScope', event, cloudNet)}
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
    columns.splice(insertIndex, 0, azureScopeColumn);
  } 

  let errorsComponent = () => {
    if (props.error && props.error.component === 'cloudAccount') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
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
                <Col span={2}>
                  <Select
                    disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                    value={provider}
                    showSearch
                    style={{width: '100%'}}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={event => set('provider', event)}
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
                        onChange={event => set('infobloxAsset', event.target.value)} 
                        value={infobloxAsset}
                      >
                        <Space direction="vertical">
                          {infobloxAssets ?
                            infobloxAssets.map((r,i) => {
                              try{
                                return (
                                  <Radio value={r.id}>{r.fqdn}</Radio>
                                )
                              }
                              catch (error) {
                                console.error(error)
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

              {infobloxAsset ?
                <React.Fragment>

                  <Row>
                    <Col span={2}>
                      <p style={{marginLeft: 10, marginRight: 10, float: 'right'}}>Check Point asset:</p>
                    </Col>
                    <Col span={6}>
                      <Radio.Group 
                        style={
                          errors?.checkPointAsset ? 
                            {backgroundColor: 'red'}
                          :
                            {}
                        }
                        onChange={event => set('checkPointAsset', event.target.value)} 
                        value={checkPointAsset}
                      >
                        <Space direction="vertical">
                          {checkPointAssets ?
                            checkPointAssets.map((r,i) => {
                              try{
                                return (
                                  <Radio value={r.id}>{r.fqdn}</Radio>
                                )
                              }
                              catch (error) {
                                console.error(error)
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
                      <Input
                        disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                        style=
                        {errors.changeRequestId ?
                          {borderColor: 'red'}
                        :
                          {}
                        }
                        value={changeRequestId}
                        ref={ref => (myRefs.current['changeRequestId'] = ref)}
                        placeholder={"Format: ITIO-<number> (min 6 max 18 digits)"}
                        onChange={event => set('changeRequestId', event.target.value)}
                      />
                    </Col>
                  </Row>

                  <Divider/>

                  <Row>
                    <Col span={21}>
                      <Radio.Group
                        disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
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
                  <br />

                  {existent ?
                    <>
                      <Row>

                        <Col span={2}>
                          <p style={{marginLeft: 20, marginTop: 5}}>Account ID:</p>
                        </Col>

                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={5}>
                            <Select
                              disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                              style={errors.accountId ?
                                {border: `1px solid red`, width: '100%'}
                              :
                                {width: '100%'}
                              }
                              value={cloudAccount.accountId }
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={event => set('accountId', event)}
                            >
                              <React.Fragment>
                                {cloudAccounts ?
                                  cloudAccounts.map((account, i) => {
                                    return (
                                      <Select.Option key={i} value={account.accountId}>{account.accountId}</Select.Option>
                                    )
                                  })
                                :
                                  []
                                }
                              </React.Fragment>
                            </Select>
                          </Col>
                        }


                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                        </Col>

                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={5}>
                            <Select
                              disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                              style={errors.accountName ?
                                {border: `1px solid red`, width: '100%'}
                              :
                                {width: '100%'}
                              }
                              value={cloudAccount?.accountName}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={event => set('accountName', event)}
                            >
                              <React.Fragment>
                                {cloudAccounts ?
                                  cloudAccounts.map((account, i) => {
                                    return (
                                      <Select.Option key={i} value={account.accountName}>{account.accountName}</Select.Option>
                                    )
                                  })
                                :
                                  []
                                }
                              </React.Fragment>
                            </Select>
                          </Col>
                        }


                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Owner:</p>
                        </Col>

                        {cloudAccountsLoading ?
                          <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                        :
                          <Col span={2}>
                            <Input
                            disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                            style=
                            {errors['accountOwner'] ?
                              {borderColor: 'red'}
                            :
                              {}
                            }
                            value={cloudAccount?.accountOwner}
                            ref={ref => (myRefs.current.accountOwner = ref)}
                            onChange={event => set('accountOwner', event.target.value)}
                          />
                          </Col>
                        }
                      </Row>

                      <br/>
                      <br/>

                      <Row>
                        <Col span={2}>
                          <p style={{marginLeft: 20}}>Operation Teams:</p>
                        </Col>
                      <Col offset={1} span={3}>
                          {cloudAccountLoading ? 
                            <Spin indicator={cloudNetLoadIcon} style={{margin: 'auto 48%'}}/>
                          :
                            <React.Fragment>
                              <Checkbox 
                                disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                                indeterminate={indeterminate} 
                                onChange={onCheckAllChange} 
                                checked={checkAll}
                              >
                                Check all
                              </Checkbox>

                              <Divider />

                              <Checkbox.Group 
                                disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                                style={errors.operationTeams ?
                                  {
                                    backgroundColor: 'red',
                                  }
                                :
                                  {}
                                }
                                options={availableOperationTeams} 
                                value={checkedOperationTeams} 
                                onChange={onChangeCustom}
                              />
                            </React.Fragment>
                          }
                        </Col>
                      </Row>
                      
                      <br/>

                      <Row>
                        <Col span={1} style={{marginLeft: 20}}>
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
                              disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                              type="primary" 
                              danger 
                            >
                              Delete Account
                            </Button>
                          </Popover>
                        </Col>
                      </Row>
                    </>
                  :
                    <>
                    {/* New Account */}
                      <Row>

                        <Col span={2}>
                          <p style={{marginLeft: 20, marginTop: 5}}>New Account ID:</p>
                        </Col>
                        <Col span={5}>
                          <Input
                            disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                            placeholder={provider === 'AWS' ? "only numbers, len 12" :  "alphanumeric, five groups 8-4-4-4-12"}
                            style=
                            {errors.accountId ?
                              {borderColor: 'red'}
                            :
                              {}
                            }
                            value={cloudAccount?.accountId}
                            ref={ref => (myRefs.current.accountId = ref)}
                            onChange={event => set('accountId', event.target.value)}
                          />
                        </Col>

                        <Col offset={1} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Name:</p>
                        </Col>
                        <Col offset={0.5} span={5} style={{ marginBottom: 8}}>
                          <div style={{ display: 'flex', alignItems: 'center'}}>
                            {provider === 'AWS' ?
                              <span>CRIF-</span>
                            : 
                              <span>crif-</span>                            
                            }

                            <Input
                              disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                              style=
                              {errors.newInputName ?
                                {borderColor: 'red'}
                              :
                                {}
                              }
                              value={cloudAccount?.newInputName}
                              ref={ref => (myRefs.current.newInputName = ref)}
                              onChange={event => set('newInputName', event.target.value)}
                              onBlur={() => setComposeName(true)}
                            />

                            { provider === 'AZURE' ?
                              <>
                              <span>-</span>
                              <Select
                                disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                                value={azureEnv}
                                showSearch
                                style={
                                  errors.azureEnv ?
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
                                onSelect={event => set('azureEnv', event, '')}
                              >
                                <React.Fragment>
                                  {azureEnvs ?
                                    azureEnvs.map((env, i) => {
                                      return (
                                        <Select.Option key={i} value={env}>{env}</Select.Option>
                                      )
                                    })
                                  :
                                    []
                                  }
                                </React.Fragment>
                              </Select>

                              </>
                            :
                              null
                            }
                            
                          </div>
                          <p style={{marginTop: 5, float: 'right'}}>{cloudAccount?.accountName || ''}</p>
                        </Col>

                        <Col offset={1} span={2}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Owner:</p>
                        </Col>
                        <Col span={2}>
                          <Input
                            disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                            style=
                            {errors['accountOwner'] ?
                              {borderColor: 'red'}
                            :
                              {}
                            }
                            value={cloudAccount?.accountOwner}
                            ref={ref => (myRefs.current.accountOwner = ref)}
                            onChange={event => set('accountOwner', event.target.value)}
                          />
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
                            <React.Fragment>
                              <Checkbox 
                                disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                                indeterminate={indeterminate} 
                                onChange={onCheckAllChange} 
                                checked={checkAll}
                              >
                                Check all
                              </Checkbox>

                              <Divider />

                              <Checkbox.Group 
                                disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                                style={errors.operationTeams ?
                                  {
                                    backgroundColor: 'red',
                                  }
                                :
                                  {}
                                }
                                options={availableOperationTeams} 
                                value={checkedOperationTeams} 
                                onChange={onChangeCustom}
                              />
                            </React.Fragment>
                          }
                        </Col>
                        </Row>

                      <br/>
                      <br/>

                      <Row>
                        <Col span={1} style={{marginLeft: 20}}>
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
                              disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                              type="primary" 
                              danger 
                            >
                              Delete Account
                            </Button>
                          </Popover>
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
                    disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                    type="primary"
                    style={{marginLeft: 16 }}
                    onClick={() => cloudNetworkAdd()}
                  >
                    Add a cloud network
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
                          disabled={loading || cloudAccountsLoading || cloudAccountLoading || false}
                          type="primary"
                          style={{float: 'right', marginRight: 15}}
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
