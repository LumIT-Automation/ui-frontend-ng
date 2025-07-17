import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import { Modal, Alert, Row, Col, Input, Result, Space, Radio, Button, Select, Spin, Divider, Checkbox, Table } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Error from '../../concerto/error'
import Card from '../../_components/card'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function CreateF5Service(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [nodesLoading, setNodesLoading] = useState(false);
  let [routeDomainsLoading, setRouteDomainsLoading] = useState(false);
  let [dataGroupsLoading, setDataGroupsLoading] = useState(false);
  let [dr, setDr] = useState(false);

  let [routeDomains, setRouteDomains] = useState([]);
  let [routeDomain, setRouteDomain] = useState('');

  let [existentNodes, setExistentNodes] = useState([]);
  let [nodes, setNodes] = useState([{id:1}]); 
  let [selectedNode, setSelectedNode] = useState('')
  
  let [snats, setSnats] = useState(['automap', 'none', 'snat']);
  let [snat, setSnat] = useState('');
  let [dataGroupsTypeIp, setDataGroupsTypeIp] = useState([]);
  let [dgChoices, setDgChoices] = useState([]);
  let [dgName, setDgName] = useState('');
  let [code, setCode] = useState('');
  let [snatPoolAddress, setSnatPoolAddress] = useState('');

  let [monitorTypes, setMonitorTypes] = useState(['tcp-half-open', 'http', 'https']);
  let [monitorType, setMonitorType] = useState('');
  let [monitorSendString, setMonitorSendString] = useState('');
  let [monitorReceiveString, setMonitorReceiveString] = useState('');

  let [lbMethods, setLbMethods] = useState(['round-robin', 'least-connections-member', 'observed-member', 'predictive-member']);
  let [lbMethod, setLbMethod] = useState('');

  let [certificate, setCertificate] = useState('');
  let [certKey, setCertKey] = useState('');

  let [source, setSource] = useState('0.0.0.0/0');
  
  let [serviceName, setServiceName] = useState('');

  let [destination, setDestination] = useState('');
  let [destinationPort, setDestinationPort] = useState('');
  
  let [errors, setErrors] = useState({});
  let [response, setResponse] = useState(false);

  let [pageSize, setPageSize] = useState(10);

  let [changeRequestId, setChangeRequestId] = useState('');


  useEffect(() => {
    if (visible && props.asset && props.partition) {
      main();
    }
  }, [visible, props.asset, props.partition]);

  useEffect(() => {
    if ( !nodes || nodes.length <= 0) {
      let list = [{id: 1}]
      setNodes(list)
    }
  }, [nodes]);

  useEffect(() => {
    const validators = new Validators();

    // La condizione principale:
    // - snat deve essere 'snat'
    // - Ci devono essere Data Groups di tipo IP caricati
    // - Deve esserci un destination IP valido
    // - Almeno uno dei nodi deve avere un indirizzo IP definito (nodes.some(n => n.address))
    if (snat === 'snat' && dataGroupsTypeIp.length > 0 && destination && nodes.some(n => n.address)) {
        let list = []; 

        dataGroupsTypeIp.forEach((dg) => {
          if (dg.records && Array.isArray(dg.records) && dg.records.length > 0) {
            // PRIMA CONDIZIONE: L'IP di destinazione è incluso in almeno una delle subnet di questo Data Group?
            const destinationInSubnet = dg.records.some(record =>
              record.name && validators.ipInSubnet(record.name, [destination])
            );

            // Se l'IP di destinazione è nella subnet di questo DG, procediamo a controllare i nodi
            if (destinationInSubnet) {
              // SECONDA CONDIZIONE: Almeno uno degli IP dei nodi è incluso in almeno una delle subnet di questo stesso Data Group?
              const nodeInSubnet = nodes.some(n =>
              // Controlla che il nodo abbia un indirizzo e che questo indirizzo sia in una delle subnet del DG
                n.address && dg.records.some(record =>
                  record.name && validators.ipInSubnet(record.name, [n.address])
                )
              );

              // Se entrambe le condizioni sono vere, aggiungi il nome del Data Group alla lista
              if (nodeInSubnet) {
                list.push(dg.name);
              }
            }
          }
        });
        setDgChoices(list); // Aggiorna lo stato con la lista filtrata

        // Aggiunta utile per la UX: se il Data Group precedentemente selezionato non è più nella nuova lista, resettalo
        if (dgName && !list.includes(dgName)) {
            setDgName('');
            setCode('');
        }

    } else {
        // Se la condizione principale non è soddisfatta, resetta tutte le scelte e i campi correlati
        setDgChoices([]);
        setDgName('');
        setCode('');
    }
  }, [snat, destination, nodes, dataGroupsTypeIp, dgName]); 

  let main = async () => {
    try {

      setNodesLoading(true)
      let nodesFetched = await dataGet('nodes', props.partition)
      setNodesLoading(false)
      if (nodesFetched.status && nodesFetched.status !== 200 ) {
        let error = Object.assign(nodesFetched, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'nodesError'
        })
        props.dispatch(err(error))
        return
      }
      else {
        setExistentNodes(nodesFetched.data.items)
      }

      setRouteDomainsLoading(true)
      let routeDomainsFetched = await dataGet('routedomains', props.partition)
      setRouteDomainsLoading(false)
      if (routeDomainsFetched.status && routeDomainsFetched.status !== 200 ) {
        let error = Object.assign(routeDomainsFetched, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'routeDomainsError'
        })
        props.dispatch(err(error))
        return
      }
      else {
        setRouteDomains(routeDomainsFetched.data.items)
      }

      setDataGroupsLoading(true)
      let dataGroupsCommon = await dataGet('datagroups', 'Common')
      setDataGroupsLoading(false)
      if (dataGroupsCommon.status && dataGroupsCommon.status !== 200 ) {
        let error = Object.assign(dataGroupsCommon, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'dataGroupsError'
        })
        props.dispatch(err(error))
        return
      }
      else {
        let list = dataGroupsCommon.data.items.filter(d => d.type === 'ip')
        setDataGroupsTypeIp(list)
      }

      if (props.partition !== 'Common') {
        setDataGroupsLoading(true)
        let dataGroupsPartition = await dataGet('datagroups', props.partition)
        setDataGroupsLoading(false)
        if (dataGroupsPartition.status && dataGroupsPartition.status !== 200 ) {
          let error = Object.assign(dataGroupsPartition, {
            component: 'createVs',
            vendor: 'f5',
            errorType: 'dataGroupsError'
          })
          props.dispatch(err(error))
          return
        }
        else {
          let list = dataGroupsPartition.data.items.filter(d => d.type === 'ip')
          let dgCommon = JSON.parse(JSON.stringify(dataGroupsTypeIp))
          list.forEach((item, i) => {
            dgCommon.push(item)
          });
          setDataGroupsTypeIp(dgCommon)
        }
      }

    }
    catch (error) {
      console.log(error)
    }
  }


  //FETCH
  let dataGet = async (entity, partition) => {
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
    if (entity === 'datagroups') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/datagroups/internal/`, props.token)
    }
    else if (entity === 'nodes') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/${entity}/`, props.token)
    }
    else {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${entity}/`, props.token)
    }
    return r
  }


  //SETTERS

  let set = async (value, key, obj) => {
    let errorsCopy = JSON.parse(JSON.stringify(errors))

    if (key === 'changeRequestId') {
      delete errorsCopy.changeRequestIdError
      setChangeRequestId(value);
      setErrors(errorsCopy);
      let ref = myRefs.current['changeRequestId'];
      if (ref && ref.input) {
        ref.input.focus();
      }
    }

    if (key === 'address') {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      let nodeCopy = nodesCopy.find(n => n.id === obj.id)

      nodeCopy.address = value
      delete nodeCopy.selectedNode
      delete nodeCopy.addressError

      setNodes(nodesCopy)
    }

    else if (key === 'name') {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      let nodeCopy = nodesCopy.find(n => n.id === obj.id)

      nodeCopy.name = value
      delete nodeCopy.selectedNode
      delete nodeCopy.nameError

      setNodes(nodesCopy)
    }

    else if (key === 'port') {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      let nodeCopy = nodesCopy.find(n => n.id === obj.id)

      nodeCopy.port = value
      delete nodeCopy.portError

      setNodes(nodesCopy)
    }

    else if (key === 'selectedNode') {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      let nodeCopy = nodesCopy.find(n => n.id === obj.id)
      let existentNodesCopy = JSON.parse(JSON.stringify(existentNodes))
      let existentNodeCopy = existentNodesCopy.find(n => n.address === value)
      nodeCopy.address = existentNodeCopy.address
      nodeCopy.name = existentNodeCopy.name
      nodeCopy.selectedNode = existentNodeCopy.name
      delete nodeCopy.nameError
      delete nodeCopy.addressError
      setNodes(nodesCopy)
    }

    else if (key === 'serviceName') {
      delete errorsCopy.serviceNameError
      setErrors(errorsCopy)
      setServiceName(value)
    }

    else if (key === 'routeDomain') {
      setRouteDomain(value)
    }

    else if (key === 'snat') {
      delete errorsCopy.snatError
      setErrors(errorsCopy)
      setSnat(value)
    }

    else if (key === 'snat' && value !== 'snat') {
      setDgChoices([])
      setDgName('')
      setCode('')
      setSnatPoolAddress('')
    }

    else if (key === 'snatPoolAddress') {
      delete errorsCopy.snatPoolAddressError
      setErrors(errorsCopy)
      setSnatPoolAddress(value)
    }

    else if (key === 'destination') {
      delete errorsCopy.destinationError
      setErrors(errorsCopy)
      setDestination(value)
    }

    else if (key === 'destinationPort') {
      delete errorsCopy.destinationPortError
      setErrors(errorsCopy)
      setDestinationPort(value)
    }

    else if (key === 'lbMethod') {
      delete errorsCopy.lbMethodError
      setErrors(errorsCopy)
      setLbMethod(value)
    }

    else if (key === 'monitorType') {
      delete errorsCopy.monitorTypeError
      setErrors(errorsCopy)
      setMonitorType(value)
    }

    else if (key === 'monitorType' && value === 'tcp-half-open') {
      setMonitorSendString('')
      setMonitorReceiveString('')
      delete errorsCopy.monitorSendStringError
      delete errorsCopy.monitorReceiveStringError
      setErrors(errorsCopy)
    }

    else if (key === 'monitorSendString') {
      delete errorsCopy.monitorSendStringError
      setErrors(errorsCopy)
      setMonitorSendString(value)
    }

    else if (key === 'monitorReceiveString') {
      delete errorsCopy.monitorReceiveStringError
      setErrors(errorsCopy)
      setMonitorReceiveString(value)
    }

    else if (key === 'certificate') {
      delete errorsCopy.certificateError
      setErrors(errorsCopy)
      setCertificate(value)
    }

    else if (key === 'certKey') {
      delete errorsCopy.certKeyError
      setErrors(errorsCopy)
      setCertKey(value)
    }

  }

  let writeDrSet = async e => {
    setDr(e)
  };

  let dgNameSet = async e => {
    setDgName(e)
    let irule = `when CLIENT_ACCEPTED {\n\tif {[findclass [IP::client_addr] ${e}] eq "" } {\n\tsnat none\n}\n}`
    setCode(irule)
  }

  let codeSet = async e => {
    setCode(e.target.value)
  }

  let nodeAdd = async () => {
    let nodesCopy = JSON.parse(JSON.stringify(nodes))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(nodesCopy)
    setNodes(list)
  }

  let nodeRemove = async node => {
    let nodesCopy = JSON.parse(JSON.stringify(nodes))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(node, nodesCopy)
    setNodes(list)
  }

  //VALIDATION
  let validationCheck = async () => {
    let nodesCopy = JSON.parse(JSON.stringify(nodes))
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    let validators = new Validators()


    if (!serviceName) {
      errorsCopy.serviceNameError = true
      setErrors(errorsCopy)
    } 

    if (!changeRequestId) {
      errorsCopy.changeRequestIdError = true
      setErrors(errorsCopy);
    }
    
    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      errorsCopy.changeRequestIdError = true
      setErrors(errorsCopy);
    }

    if (!snat) {
      errorsCopy.snatError = true
      setErrors(errorsCopy)
    } 

    if (snat === 'snat') {
      if (!snatPoolAddress || !validators.ipv4(snatPoolAddress)) {
        errorsCopy.snatPoolAddressError = true
        setErrors(errorsCopy)
      }

      if (dgChoices && dgChoices.length > 0) {
        if (!dgName) {
          errorsCopy.dgNameError = true
          setErrors(errorsCopy)
        }
        else {
          delete errorsCopy.dgNameError
          setErrors(errorsCopy)
        }

        if (!code){
          errorsCopy.codeError = true
          setErrors(errorsCopy)
        }
        else {
          delete errorsCopy.codeError
          setErrors(errorsCopy)
        }
      }
    }

    if (!validators.ipv4(destination)) {
      errorsCopy.destinationError = true
      setErrors(errorsCopy)
    } 

    if (!validators.port(destinationPort)) {
      errorsCopy.destinationPortError = true
      setErrors(errorsCopy)
    }

    if (!lbMethod) {
      errorsCopy.lbMethodError = true
      setErrors(errorsCopy)
    } 

    if (!monitorType) {
      errorsCopy.monitorTypeError = true
      setErrors(errorsCopy)
    } 

    if ((monitorType === 'http' || monitorType === 'https') && !monitorSendString) {
      errorsCopy.monitorSendStringError = true
      setErrors(errorsCopy)
    }

    if ((monitorType === 'http' || monitorType === 'https') && !monitorReceiveString) {
      errorsCopy.monitorReceiveStringError = true
      setErrors(errorsCopy)
    }

    nodesCopy.forEach((n, i) => {

      if (!n.address) {
        n.addressError = true
        if (!errorsCopy[n.id]) {
          errorsCopy[n.id] = {}
        } 
        errorsCopy[n.id].addressError = true
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }
      else if (!validators.ipv4(n.address)) {
        n.addressError = true
        if (!errorsCopy[n.id]) {
          errorsCopy[n.id] = {}
        } 
        errorsCopy[n.id].addressError = true
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }
      else {
        if (errorsCopy[n.id]) {
          delete errorsCopy[n.id].addressError
        } 
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }

      if (!n.name) {
        n.nameError = true
        if (!errorsCopy[n.id]) {
          errorsCopy[n.id] = {}
        } 
        errorsCopy[n.id].nameError = true
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }
      else {
        if (errorsCopy[n.id]) {
          delete errorsCopy[n.id].nameError
        }         
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }

      if (!n.port) {
        n.portError = true
        if (!errorsCopy[n.id]) {
          errorsCopy[n.id] = {}
        } 
        errorsCopy[n.id].portError = true
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }
      else if (!validators.port(n.port)) {
        n.portError = true
        if (!errorsCopy[n.id]) {
          errorsCopy[n.id] = {}
        } 
        errorsCopy[n.id].portError = true
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }
      else {
        if (errorsCopy[n.id]) {
          delete errorsCopy[n.id].portError
        } 
        setNodes(nodesCopy)
        setErrors(errorsCopy)
      }

      if (errorsCopy[n.id] && Object.keys(errorsCopy[n.id]).length === 0) {
        delete errorsCopy[n.id]
        setErrors(errorsCopy)
      }
    })

    return errorsCopy
  }

  let validation = async () => {
    let e = await validationCheck()

    if (Object.keys(e).length === 0) {
      createService()
    }
  }


  //DISPOSAL ACTION
  let createService = async () => {

    let b = {}
    b.data = {
      "virtualServer": {
        "name": `vs_${serviceName}`,
        "type": props.type,
        "snat": snat,
        "routeDomainId": routeDomain,
        "destination": `${destination}:${destinationPort}`,
        "mask": '255.255.255.255',
        "source": source
      },
      "profiles": [],
      "pool": {
        "name": `pool_${serviceName}`,
        "loadBalancingMode": lbMethod,
        "nodes": nodes
      },
      "monitor": {
        "name": `mon_${serviceName}`,
        "type": monitorType
      },
      "change-request-id": changeRequestId,
    }

    if (props.type === 'L4') {
      b.data.profiles.push(
        {
          "name": `fastl4_${serviceName}`,
          "type": "fastl4",
          "idleTimeout": 300
        }
      )
    }
    else if (props.type === 'L7') {
      b.data.profiles.push(
        {
          "name": `tcp-wan-optimized_${serviceName}`,
          "type": "tcp",
          "defaultsFrom": "/Common/tcp-wan-optimized",
          "context": "clientside"
        },
        {
          "name": `tcp-lan-optimized_${serviceName}`,
          "type": "tcp",
          "defaultsFrom": "/Common/tcp-lan-optimized",
          "context": "serverside"
        },
        {
          "name": `http_${serviceName}`,
          "type": "http",
          "defaultsFrom": "/Common/http"
        }
      )
      if (certificate && certKey) {
        b.data.profiles.push(
          {
            "name": `client-ssl_${serviceName}`,
            "type": "client-ssl",
            "certName": serviceName,
            "cert": btoa(certificate),
            "keyName": serviceName,
            "key":  btoa(certKey),
            "chain": "",
            "chainName": "",
            "context": "clientside"
          }
        )
      }
    }

    if ((monitorType === 'http') || (monitorType === 'https')) {
      b.data.monitor.send = monitorSendString
      b.data.monitor.recv = monitorReceiveString
    }

    if (snat === 'snat') {
      b.data.snatPool = {
        "name": `snat_${serviceName}`,
        "members": [
          snatPoolAddress
        ]
      }
    }

    if (code) {
      if ( (code !== '') || (code !== undefined) ) {
        b.data.irules = [
          {
            "name": `irule_${serviceName}`,
            "code": code
          }
        ]
      }
    }

    setLoading(true)

    let url = `f5/usecases/crif/${props.asset.id}/${props.partition}/virtualservers/`

    if (dr) {
      url = `f5/usecases/crif/${props.asset.id}/${props.partition}/virtualservers/?drReplica=1`
    }

    let rest = new Rest(
      "POST",
      resp => {
        setLoading(false)
        setResponse(true)
        responseHandler()
      },
      error => {
        error = Object.assign(error, {
          component: 'createVs',
          vendor: 'f5',
          errorType: 'ServiceCreateError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(url, props.token, b )
  }

  let responseHandler = () => {
    setTimeout( () => setResponse(false), 2000)
    setTimeout( () => closeModal(), 2050)
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
    setNodesLoading(false);
    setRouteDomainsLoading(false);
    setDataGroupsLoading(false);
    setDr(false);

    setRouteDomains([]);
    setRouteDomain('');

    setExistentNodes([]);
    setNodes([{id:1}]); 
    setSelectedNode('')
    
    setSnats(['automap', 'none', 'snat']);
    setSnat('');
    setDataGroupsTypeIp([]);
    setDgChoices([]);
    setDgName('');
    setCode('');
    setSnatPoolAddress('');

    setMonitorTypes(['tcp-half-open', 'http', 'https']);
    setMonitorType('');
    setMonitorSendString('');
    setMonitorReceiveString('');

    setLbMethods(['round-robin', 'least-connections-member', 'observed-member', 'predictive-member']);
    setLbMethod('');

    setCertificate('');
    setCertKey('');

    setSource('0.0.0.0/0');
    
    setServiceName('');

    setDestination('');
    setDestinationPort('');
    
    setErrors({});
    setResponse(false);
    setChangeRequestId('');
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'createVs') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let randomKey = () => {
    return Math.random().toString()
  }

  let returnCol = () => {
    return columns
  }
    
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
      else {
        return (
          <Input
            defaultValue={
              key === 'serviceName' ?
                serviceName
              :
                key === 'destination' ?
                  destination
                :
                  key === 'destinationPort' ?
                    destinationPort
                  :
                    key === 'snatPoolAddress' ?
                      snatPoolAddress
                    :
                      null
            }
            style=
            {errors[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            onBlur={event => set(event.target.value, key)}
          />
        )
      }
      
    }
    else if (element === 'textArea') {
      return (
        <Input.TextArea
          rows={7}
          defaultValue={
            key === 'monitorSendString' ?
              monitorSendString
            :
              key === 'monitorReceiveString' ?
                monitorReceiveString
              :
                key === 'certificate' ?
                  certificate
                :
                  key === 'certKey' ?
                    certKey
                  :
                    null
          }
          onBlur={event => set(event.target.value, key)}
          style=
          { errors[`${key}Error`] ?
            {borderColor: `red`}
          :
            {}
          }
        />
      )
    }
    else if (element === 'select') {
      return (
        <Select
          value={
            key === 'routeDomain' ?
              routeDomain
            :
              key === 'snat' ?
                snat
              :
                key === 'lbMethod' ?
                  lbMethod
                :
                  key === 'monitorType' ?
                    monitorType
                  :
                    null
          }
          showSearch
          style=
          { errors[`${key}Error`] ?
            {width: "100%", border: `1px solid red`}
          :
            {width: "100%"}
          }
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={event => set(event, key)}
        >
          <React.Fragment>
          { choices === 'routeDomains' ?
            routeDomains.map((r,i) => {
              return (
                <Select.Option key={i} value={r.id}>{r.name}</Select.Option>
              )
            })
          :
            choices === 'snats' ?
              snats.map((n, i) => {
                return (
                  <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })
            :
              choices === 'lbMethods' ?
                lbMethods.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
              :
                choices === 'monitorTypes' ?
                monitorTypes.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                :
              null
          }
          </React.Fragment>
        </Select>
      )
    }

  }

  const columns = [
    {
      title: 'Address',
      align: 'center',
      dataIndex: 'address',
      key: 'address',
      render: (name, obj)  => {
        return (
          <React.Fragment>
            <Input
              defaultValue={obj.address}
              style={
                obj.addressError ?
                  {borderColor: 'red', textAlign: 'center', width: 200}
                :
                  {textAlign: 'center', width: 200}
              }
              onBlur={e => {
                set(e.target.value, 'address', obj)}
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      render: (name, obj)  => {
        return (
          <React.Fragment>
            <Input
              defaultValue={obj.name}
              style={
                obj.nameError ?
                  {borderColor: 'red', textAlign: 'center', width: 200}
                :
                  {textAlign: 'center', width: 200}
              }
              onBlur={e => {
                set(e.target.value, 'name', obj)}
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Port',
      align: 'center',
      dataIndex: 'port',
      key: 'port',
      render: (name, obj)  => {
        return (
          <React.Fragment>
            <Input
              defaultValue={obj.port}
              style={
                obj.portError ?
                  {borderColor: 'red', textAlign: 'center', width: 80}
                :
                  {textAlign: 'center', width: 80}
              }
              onBlur={e => {
                set(e.target.value, 'port', obj)}
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Existent Node',
      align: 'center',
      dataIndex: 'selectedNode',
      key: 'selectedNode',
      render: (name, obj)  => {
        return (
          <React.Fragment>
            { nodesLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
            :
              <Select
                value={obj.selectedNode}
                showSearch
                style={{width: 300}}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onSelect={n => set(n, 'selectedNode', obj)}
              >
                <React.Fragment>
                  {existentNodes.map((n, i) => {
                    let str = `${n.address} - ${n.name}`
                    return (
                      <Select.Option key={i} value={n.address}>{str}</Select.Option>
                    )
                  })
                  }
                </React.Fragment>
              </Select>
            }
          </React.Fragment>
          
        )
      }
    },     
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <Space size="small">
          <Button
            type="primary"
            danger
            onClick={(e) => nodeRemove(obj)}
          >
            -
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <React.Fragment>

      <Card 
        props={{
          width: 200, 
          title: `Create ${props.type}`, 
          details: `Create a ${props.type} load balancer.`,
          color: '#5dcc0e',
          onClick: function () { setVisible(true) } 
        }}
      />
      
      <Modal
        title={<p style={{textAlign: 'center'}}>{props.type} CREATE</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <AssetSelector vendor='f5'/>

        <Divider/>

        { ( (props.asset && props.asset.id) && props.partition ) ?
          <React.Fragment>
            { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !loading && response &&
              <Result
                  status="success"
                  title="Service Created"
                />
            }
            { !loading && !response &&
              <React.Fragment>

                <Row>
                  <Col span={2}>
                    <p style={{marginLeft: 10, marginRight: 10, marginTop: 5, float: 'right'}}>Change request id:</p>
                  </Col>
                  <Col span={6}>
                    {createElement('input', 'changeRequestId')}
                  </Col>
                </Row>
                <br />

                <Row>
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('input', 'serviceName')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={8} span={6}>
                    <Checkbox
                      onChange={e => writeDrSet(e.target.checked)}
                      disabled={(props.asset && props.asset.assetsDr && props.asset.assetsDr.length > 0) ? false : true}
                      checked={dr}
                    >
                      Write in dr
                    </Checkbox>
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Route Domain (optional):</p>
                  </Col>
                  <Col span={8}>
                    { routeDomainsLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                      <Col span={24}>
                        {createElement('select', 'routeDomain', 'routeDomains')}
                      </Col>
                    }
                  </Col>
                </Row>
                <br/>

                <React.Fragment>
                  <Row>
                    <Col offset={6} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('select', 'snat', 'snats')}
                    </Col>
                  </Row>
                  <br/>

                  { snat === 'snat' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={6} span={3}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snatpool address:</p>
                        </Col>
                        <Col span={7}>
                          {createElement('input', 'snatPoolAddress')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }

                  { (snat === 'snat' && dgChoices && dgChoices.length > 0) ?
                    <React.Fragment>
                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snatpool Datagroup:</p>
                        </Col>

                        <Col span={6}>
                        { errors.dgNameError ?
                          <React.Fragment>
                            <Select
                              value={dgName}
                              showSearch
                              style={{width: '100%', border: `1px solid red`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => dgNameSet(n)}
                            >
                              <React.Fragment>
                                {dgChoices.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                            <br/>
                          </React.Fragment>
                        :
                          <React.Fragment>
                            <Select
                              value={dgName}
                              showSearch
                              style={{width: '100%'}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => dgNameSet(n)}
                            >
                              <React.Fragment>
                                {dgChoices.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                            <br/>
                          </React.Fragment>
                        }
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Snat irule:</p>
                        </Col>
                        <Col span={6}>
                          { errors.codeError ?
                            <TextArea
                              rows={5}
                              value={code}
                              style={{width: '100%', border: `1px solid red`}}
                              name="code"
                              id='code'
                              onChange={e => codeSet(e)}
                            />
                          :
                            <TextArea
                              rows={5}
                              value={code}
                              style={{width: '100%'}}
                              name="code"
                              id='code'
                              onChange={e => codeSet(e)}
                            />
                          }
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }

                </React.Fragment>

                <Row>
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Destination IP:</p>
                  </Col>
                  <Col span={3}>
                    {createElement('input', 'destination')}
                  </Col>
                  <Col offset={1} span={2}>
                    <p style={{marginRight: 10, marginTop: 5}}>Destination Port:</p>
                  </Col>
                  <Col span={2}>
                    {createElement('input', 'destinationPort')}
                  </Col>
                </Row>
                <br/>

                {props.type === 'L7' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={5} span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Certificate (optional):</p>
                      </Col>
                      <Col span={8}>
                        {createElement('textArea', 'certificate')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={6} span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key (optional):</p>
                      </Col>
                      <Col span={8}>
                        {createElement('textArea', 'certKey')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Load Balancing Methods:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('select', 'lbMethod', 'lbMethods')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor Type:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('select', 'monitorType', 'monitorTypes')}
                  </Col>
                </Row>
                <br/>

              { ((monitorType === 'http') || (monitorType === 'https')) ?
                <React.Fragment>
                  <br/>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor send string:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('textArea', 'monitorSendString')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Monitor receive string:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('textArea', 'monitorReceiveString')}
                    </Col>
                  </Row>
                  <br/>

                </React.Fragment>
              :
                null
              }

              <Divider/>

              <Row>
              <Col offset={2} span={20}>
                <Radio.Group
                  buttonStyle="solid"
                >
                  <Radio.Button
                    buttonStyle="solid"
                    style={{marginLeft: 16 }}
                    onClick={() => nodeAdd()}
                  >
                    Add node
                  </Radio.Button>
                </Radio.Group>

                <Table
                  columns={returnCol()}
                  style={{width: '100%', padding: 15}}
                  dataSource={nodes}
                  bordered
                  rowKey={randomKey}
                  scroll={{x: 'auto'}}
                  pagination={{
                    pageSize: pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'], 
                    onShowSizeChange: (current, size) => setPageSize(size), 
                  }}
                />
                </Col>
              </Row>

              <Row>
                <Col offset={8} span={16}>
                  <Button 
                    type="primary" 
                    shape='round'
                    disabled = {loading ? true : false} 
                    onClick={() => validation()} 
                  >
                    Create {props.type} Load Balancer
                  </Button>
                </Col>
              </Row>
            </React.Fragment>

          }

          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }
      </Modal>

      {errorsComponent()}

    </React.Fragment>

  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
  dataGroups: state.f5.dataGroups,
}))(CreateF5Service);
