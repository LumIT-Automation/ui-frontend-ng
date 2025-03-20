import React, { useState, useEffect } from 'react';
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

import { Space, Modal, Input, Button, Select, Spin, Divider, Table, Alert, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const netLoadIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />
const responseIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


function RequestIp(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [networkLoading, setNetworkLoading] = useState(false);
  let [responseLoading, setResponseLoading] = useState(false);

  let [real, setReal] = useState([]);
  let [networks, setNetworks] = useState([]);
  let [containers, setContainers] = useState([]);

  let [blocked, setBlocked] = useState(false)
  let [objectTypes, setObjectTypes] = useState([])

  let [requests, setRequests] = useState([]);
  let [response, setResponse] = useState([]);

  let [macAddress, setMacAddress] = useState('');
  let [macAddress2, setMacAddress2] = useState('');
  

  useEffect(() => {
    if (visible) {
      let requestsCopy = JSON.parse(JSON.stringify(requests))
      requestsCopy.push({id:1, macAddress: '00:00:00:00:00:00', range: false})
      setRequests(requestsCopy)
    }
  }, [visible]);

  useEffect(() => {
    if (visible && props.asset) {
      start()
    }
  }, [props.asset]);

  let start = async () => {
    setNetworkLoading(true)
    let networksCopy = await networksGet()
    let containersCopy = await containersGet()
    let realCopy, realNetworks, realContainers

    if (networksCopy) {
      realNetworks = await realNet(networksCopy)
    }
    if (containersCopy) {
      realContainers = await realCont(containersCopy)
    }

    if (networksCopy && containersCopy) {
      realCopy = realNetworks.concat(realContainers)
    }

    if (realCopy) {
      setReal(realCopy)
      setNetworks(networksCopy)
      setContainers(containersCopy)
    }
    setNetworkLoading(false)
  }

  let networksGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        error = Object.assign(error, {
          component: 'requestIp',
          vendor: 'infoblox',
          errorType: 'networksError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/networks/`, props.token)
    return r
  }

  let containersGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        error = Object.assign(error, {
          component: 'requestIp',
          vendor: 'infoblox',
          errorType: 'containersError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/network-containers/`, props.token)
    return r
  }

  let realNet = items => {
    let list = []

    items.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let o = e
          list.push(o)
        }
      }
    })
    return list
  }

  let realCont = items => {
    let list = []

    items.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          let o = e
          o.isContainer = true
          list.push(o)
        }
      }
    })
    return list
  }


  //SETTER
  let requestAdd = async () => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(requestsCopy)

    // Trova l'elemento con l'id più alto
    let maxIdElement = list.reduce((max, current) => (current.id > max.id ? current : max), list[0]);
    let ip = { id: maxIdElement.id, macAddress: '00:00:00:00:00:00', range: false };
    Object.assign(maxIdElement, ip);
    setRequests(list)
    /*
    trova id max
      let ip = {id: n, macAddress: '00:00:00:00:00:00', range: false}
      list.push(ip)
      setRequests(list)
    */
    
  }

  let requestRemove = async r => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(r, requestsCopy)
    if (list.length < 1) {
      let ip = {id: 1, macAddress: '00:00:00:00:00:00', range: false}
      list.push(ip)
    }
    setRequests(list)
  }

  let networkGet = async networkLocal => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        error = Object.assign(error, {
          component: 'requestIp',
          vendor: 'infoblox',
          errorType: 'networkError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/network/${networkLocal}/?related=range`, props.token)
    return r
  }

  let networkManagerSet = async (networkLocal, e, id) => {
    let resetLocal = await reset(id)
    if (resetLocal) {
      networkSet(networkLocal, id)
    }
  }

  let reset = async (id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )
    delete requestCopy.objectType
    requestCopy.objectTypesLoading = true
    requestCopy.blocked = false
    
    setBlocked(true)
    setRequests(requestsCopy)
    setObjectTypes([])
    return requestCopy
  }

  let networkSet = async (network, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    let objectTypesCopy = []
    let prefix = network.split('/')
    prefix = prefix[0]
    let subnetMask
    let gateway

    //children networks contained in the in the container
    const result = real.find( real => real.network === network )
    requestCopy.option12 = false
    delete requestCopy.option12Error
    if (result.isContainer) {
      networks.forEach((item, i) => {
        if (item.network_container === network ) {
          if (item.extattrs && item.extattrs['Object Type'] ) {
            objectTypesCopy.push(item.extattrs['Object Type'].value)
          }
        }
      })
      let unique = objectTypesCopy.filter((v, i, a) => a.indexOf(v) === i);
      requestCopy.objectTypes = unique
      requestCopy.objectTypesLoading = false
      requestCopy.isContainer = true
    }
    else {
      delete requestCopy.objectTypes
      delete requestCopy.isContainer
      requestCopy.objectTypesLoading = false
    }

    let info = await networkGet(prefix)

    if (info && info.extattrs) {
      if (info.extattrs.Mask) {
        subnetMask = info.extattrs.Mask.value
      }
      if (info.extattrs.Gateway) {
        gateway = info.extattrs.Gateway.value
      }
    }
    delete requestCopy.networkError

    if (info && info.rangeInfo && info.rangeInfo.length > 0) {
      requestCopy.ranges = info.rangeInfo
    }
    else {
      delete requestCopy.ranges
    }


    requestCopy.prefix = prefix
    requestCopy.subnetMask = subnetMask
    requestCopy.gateway = gateway
    requestCopy.network = network
    delete requestCopy.blocked
    setBlocked(false)
    setRequests(requestsCopy)
  }

  let objectTypeSet = async (objectType, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.objectType = objectType
    delete requestCopy.objectTypeError

    if (objectType === 'Heartbeat') {
      requestCopy.macAddress2 = '00:00:00:00:00:00'
      requestCopy.serverName2 = ''
    }
    else {
      delete requestCopy.macAddress2
      delete requestCopy.serverName2
    }

    if (requestCopy.isContainer && objectType === 'Serverdhcp') {
      requestCopy.option12 = true
      delete requestCopy.option12Error
    }
    else if (requestCopy.isContainer && objectType !== 'Serverdhcp') {
      requestCopy.option12 = false
      delete requestCopy.option12Error
    }
    setRequests(requestsCopy)
  }

  let serverNameSet = (e, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.serverName = e.target.value
    delete requestCopy.serverNameError
    setRequests(requestsCopy)
  }

  let serverNameSet2 = (e, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.serverName2 = e.target.value
    delete requestCopy.serverName2Error
    setRequests(requestsCopy)
  }

  let macAddressSet = (m, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.macAddress = m.target.value
    delete requestCopy.macAddressError
    setRequests(requestsCopy)
  }

  let macAddressSet2 = (m, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.macAddress2 = m.target.value
    delete requestCopy.macAddress2Error
    setRequests(requestsCopy)
  }

  let rangeSet = (value, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )
    
    requestCopy.range = value
    setRequests(requestsCopy)
  }

  let choosedRangeSet  = (value, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.choosedRange = value
    delete requestCopy.choosedRangeError
    setRequests(requestsCopy)
  }

  let rangeReferenceSet = async (value, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.rangeReference = value
    delete requestCopy.rangeReferenceError
    setRequests(requestsCopy)
  }

  let option12Set = (value, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )

    requestCopy.option12 = value
    if (!requestCopy.option12) {
      delete requestCopy.option12Error
    }
    setRequests(requestsCopy)
  }


  //validation
  let validation = async () => {
    let valid = await validationCheck()
    if (valid) {
      sendRequests()
    }
  }

  let validationCheck = async () => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let validators = new Validators()
    let ok = true

    requestsCopy.forEach((requestCopy, i) => {
      if (!requestCopy.network) {
        requestCopy.networkError = 'error'
        ok = false
      }
      if (requestCopy.range && !requestCopy.choosedRange) {
        requestCopy.choosedRangeError = 'error'
        ok = false
      }
      if (requestCopy.range && !requestCopy.rangeReference) {
        requestCopy.rangeReferenceError = 'error'
        ok = false
      }
      if (requestCopy.range && requestCopy.macAddress === '00:00:00:00:00:00') {
        requestCopy.macAddressError = 'error'
        ok = false
      }
      if (!requestCopy.objectType) {
        requestCopy.objectTypeError = 'error'
        ok = false
      }
      if (!requestCopy.serverName) {
        requestCopy.serverNameError = 'error'
        ok = false
      }
      if (!validators.macAddress(requestCopy.macAddress)) {
        requestCopy.macAddressError = 'error'
        ok = false
      }
      if (requestCopy.option12) {
        if (requestCopy.macAddress === '00:00:00:00:00:00') {
          requestCopy.macAddressError = 'error'
          ok = false
        }
      }
      if (requestCopy.objectType === 'Heartbeat') {
        if (!requestCopy.serverName2) {
          requestCopy.serverName2Error = 'error'
          ok = false
        }
        if (!validators.macAddress(requestCopy.macAddress2)) {
          requestCopy.macAddress2Error = 'error'
          ok = false
        }
      }
    })

    setRequests(requestsCopy)
    return ok
  }

  let sendRequests = async () => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    setLoading(true)
    setResponse([])
    setResponseLoading(true)

    let responseCopy = []

    for await (const requestCopy of requestsCopy) {
      requestCopy.isLoading = true
        //this.setState({foo: true})
        setRequests([...requestsCopy]);
      try {
        const resp = await nextAvailableIp(requestCopy)
        let res = await updateResponse(resp, requestCopy.id)
        requestCopy.isLoading = false
        //this.setState({foo: false})
        setRequests([...requestsCopy]);
        responseCopy.push(res)
      } catch(resp) {
        requestCopy.isLoading = false
        //this.setState({foo: false})
        setRequests([...requestsCopy]);
      }
    }
    setResponse(responseCopy)
    setLoading(false)
    setResponseLoading(false)
  }

  let nextAvailableIp = async r => {
    let re
    let b

    if (r.objectType !== 'Heartbeat') {
      b = {
        "data": {
          "network": `${r.prefix}`,
          "object_type": `${r.objectType}`,
          "number": 1,
          "mac": [
              `${r.macAddress}`
          ],
          "extattrs": [
            {
              "Name Server": {
                  "value": `${r.serverName}`
              }
            }
          ]
        }
      }
    }
    else {
      b = {
        "data": {
          "network": `${r.prefix}`,
          "object_type": `${r.objectType}`,
          "number": 2,
          "mac": [
              `${r.macAddress}`, `${r.macAddress2}`
          ],
          "extattrs": [
            {
              "Name Server": {
                  "value": `${r.serverName}`
              }
            },
            {
              "Name Server": {
                  "value": `${r.serverName2}`
              }
            },
          ]
        }
      }
    }

    if (r.range && r.choosedRange) {
      b.data["range_by_reference"] = r.choosedRange
      b.data["reference_prefix"] = r.rangeReference
    }


    if (r.option12) {
      b.data["options"] = [
        {
          "name": "host-name",
          "num": 12,
          "value": r.serverName,
          "vendor_class": "DHCP"
        }
      ]
    }

    let rest = new Rest(
      "POST",
      resp => {
        re = resp
      },
      error => {
        error = Object.assign(error, {
          component: 'requestIp',
          vendor: 'infoblox',
          errorType: 'nextAvailableIpError'
        })
        props.dispatch(err(error))
        re = error
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4s/?next-available`, props.token, b )
    return re
  }

  let updateResponse = async (resp, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))

    if (resp.data && resp.data.length > 0) {
      let ips = []

      resp.data.forEach(result => {

        let str = result.result
        let st = str.split(':')
        let s = st[1]
        let ip = s.split('/')
        ip = ip[0]
        let gateway = result.gateway
        let subnetMask = result.mask

        ips.push({ip: ip, gateway: gateway, subnetMask: subnetMask})

      })

      let requestCopy = requestsCopy.find( r => r.id === id )
      let res = Object.assign({}, requestCopy)
      res.ips = ips
      if (requestCopy.option12) {
        res.option12 = res.serverName
      }
      return res
    }
    else {
      let requestCopy = requestsCopy.find( r => r.id === id )
      let res = Object.assign({}, requestCopy)
      res.ips = ['no ip']
      if (requestCopy.option12) {
        res.option12 = res.serverName
      }
      return res
    }

    //response.push(request)
    //this.setState({response: response})
  }

  let authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
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
    setNetworkLoading(false);
    setResponseLoading(false);
  
    setReal([]);
    setNetworks([]);
    setContainers([]);
  
    setBlocked(false)
    setObjectTypes([])
  
    setRequests([]);
    setResponse([]);
  
    setMacAddress('');
    setMacAddress2('');
  }

  let referenceRangeList = []
  let list = []

  const requestsColumn = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      key: 'id',
      name: 'dable',
      description: '',
    },
    {
      title: 'Network',
      align: 'center',
      dataIndex: 'network',
      key: 'network',
      render: (name, obj)  => (
        <React.Fragment>
          { networkLoading ?
            <Spin indicator={netLoadIcon} style={{margin: 'auto auto'}}/>
          :
            <React.Fragment>
              { blocked && !obj.blocked ?
                <Select 
                  defaultValue={obj.network} 
                  style={{ width: '300px'}} 
                  disabled
                />
              :
                <Select
                  showSearch
                  //defaultValue={obj.network}
                  value={obj.network}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  key={obj.id}
                  style={obj.networkError ?
                    { width: '300px', border: `1px solid red`}
                  :
                    { width: '300px'}
                  }
                  onChange={(value, event) => networkManagerSet(value, event, obj.id)}>
                  { real ?
                    real.map((n, i) => {
                    return (
                      <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
                      )
                    })
                    :
                    null
                  }
                </Select> 
              }
            </React.Fragment>
          }
        </React.Fragment>
      ),
    },
    ...(
        (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'infoblox', 'ranges_get')) ?
        [
          {
            title: 'Range',
            align: 'center',
            dataIndex: 'range',
            key: 'range',
            render: (name, obj)  => (
              <React.Fragment>
                { obj.ranges ?
                  <Checkbox
                    checked={obj.range}
                    onChange={event => rangeSet(event.target.checked, obj.id)}
                  />
                :
                  null
                }
              </React.Fragment>
            )
          },
        ]
        :
        []
      ),
      {
        title: 'Assignee',
        align: 'center',
        dataIndex: 'rangeReference',
        key: 'rangeReference',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.range ?
              <Input
                placeholder='Insert your name'
                value={obj.rangeReference}
                style={obj.rangeReferenceError ? { width: '150px', borderColor: 'red' } : { width: '150px'}}
                onChange={e => rangeReferenceSet(e.target.value, obj.id)}
              />
            :
              null
            }
          </React.Fragment>
        )
      },
      {
      title: 'Ranges',
      align: 'center',
      dataIndex: 'ranges',
      key: 'ranges',
      render: (name, obj)  => (
        <React.Fragment>
          { obj.range ?
            <Select
              value={obj.choosedRange}
              key={obj.id}
              style={obj.choosedRangeError ? { width: 300, border: `1px solid red` } : {width: 300}}
              onChange={e => choosedRangeSet(e, obj.id)}
            >
              { obj.ranges ? obj.ranges.map((r, i) => {
                let range = ''
                  if (r.extattrs && r.extattrs.Reference && r.extattrs.Reference.value) {
                    referenceRangeList.push(r.extattrs.Reference.value)
                  }
                })
              :
                null
              }
              {
                list = [...new Set(referenceRangeList)]
              }
              {
                list ? list.map((r, i) => {
                  return (
                    <Select.Option key={i} value={r}>{r}</Select.Option>
                    )
                  })
              :
                null
              }
            </Select>
          :
            null
          }
        </React.Fragment>
      )
    },
    {
      title: 'Object Type',
      align: 'center',
      dataIndex: 'objectType',
      key: 'objectType',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.objectTypesLoading ?
            <Spin indicator={netLoadIcon} style={{margin: 'auto auto'}}/>
          :
          <React.Fragment>
            {!obj.network ?
              <Select style={{ width: '100%'}} disabled/>
            :
              <Select 
                value={obj.objectType} 
                key={obj.id} 
                style={ obj.objectTypeError ?
                  { width: '150px', border: `1px solid red`}
                :
                  { width: '150px'}
                } 
                onChange={e => objectTypeSet(e, obj.id)}
              >
                { obj.objectTypes ?
                  obj.objectTypes.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                  :
                  <Select.Option key={'-'} value={'-'}>-</Select.Option>
                }
              </Select>
            }
          </React.Fragment>
          }
        </React.Fragment>
      ),
    },
    {
      title: 'Server Name',
      align: 'center',
      dataIndex: 'serverName',
      key: 'serverName',
      render: (name, obj)  => (
        <React.Fragment>
          { (obj.objectType === 'Heartbeat') ?
            <React.Fragment>
              <Input
                placeholder={obj.serverName}
                style={ obj.serverNameError ?
                  { width: '150px', borderColor: 'red'}
                :
                  { width: '150px'}
                }
                onChange={e => serverNameSet(e, obj.id)}
                onPressEnter={() => validation()}
              />

              <Divider/>

              <Input
                placeholder={obj.serverName2}
                style={obj.serverName2Error ? 
                  { width: '150px', borderColor: 'red' }
                :
                  { width: '150px' }
                }
                onChange={e => serverNameSet2(e, obj.id)}
                onPressEnter={() => validation()}
              />

            </React.Fragment>
          :
            <Input
              placeholder={obj.serverName}
              style={ obj.serverNameError ?
                { width: '150px', borderColor: 'red' }
              :
                { width: '150px' }
              }
              onChange={e => serverNameSet(e, obj.id)}
              onPressEnter={() => validation()}
            />
          }
        </React.Fragment>
      ),
    },
    {
      title: 'Option 12',
      align: 'center',
      dataIndex: 'option12',
      key: 'option12',
      render: (name, obj)  => (
        <React.Fragment>
          <Checkbox
            checked={obj.option12}
            onChange={event => option12Set(event.target.checked, obj.id)}
            disabled={obj.isContainer ? true : false}
          />
        </React.Fragment>
      )
    },
    {
      title: 'Mac address',
      align: 'center',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.objectType === 'Heartbeat') ?
          <React.Fragment>
            <Input
              defaultValue={obj.macAddress}
              style={ obj.macAddressError ?
                { width: '150px', borderColor: 'red' }
              :
                { width: '150px' }
              }
              onChange={e => macAddressSet(e, obj.id)}
              onPressEnter={() => validation()}
            />

            <Divider/>

            <Input
              defaultValue={obj.macAddress2}
              style={obj.macAddress2Error ? 
                { width: '150px', borderColor: 'red' }
              :
                { width: '150px' }
              }
              onChange={e => macAddressSet2(e, obj.id)}
              onPressEnter={() => validation()}
            />

          </React.Fragment>
        :
          <Input
            defaultValue={obj.macAddress}
            style={obj.macAddressError ? 
              { width: '150px', borderColor: 'red' }
            :
              { width: '150px' }
            }
            onChange={e => macAddressSet(e, obj.id)}
            onPressEnter={() => validation()}
          />
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Remove request',
      align: 'center',
      dataIndex: 'remove',
      key: 'remove',
      render: (name, obj)  => (
        <Button type="danger" onClick={() => requestRemove(obj)}>
          -
        </Button>
      ),
    },
  ]

  const responseColumn = [
    {
      title: 'IP address',
      align: 'center',
      dataIndex: ['ips', 'ip'],
      key: 'ip',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
          obj.ips.map((ip, i) => {
          return (
            <React.Fragment>
              {ip.ip}
              <br/>
            </React.Fragment>
          )
          })
          :
          <React.Fragment>
            {obj.ips[0].ip}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Network',
      align: 'center',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Subnet Mask',
      align: 'center',
      dataIndex: 'subnetMask',
      key: 'subnetMask',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
          obj.ips.map((ip, i) => {
          return (
            <React.Fragment>
              {ip.subnetMask}
              <br/>
            </React.Fragment>
          )
          })
          :
          <React.Fragment>
            {obj.ips[0].subnetMask}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Gateway',
      align: 'center',
      dataIndex: 'gateway',
      key: 'gateway',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
          obj.ips.map((ip, i) => {
          return (
            <React.Fragment>
              {ip.gateway}
              <br/>
            </React.Fragment>
          )
          })
          :
          <React.Fragment>
            {obj.ips[0].gateway}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Server Name',
      align: 'center',
      dataIndex: 'serverName',
      key: 'serverName',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
            <React.Fragment>
              {obj.serverName}
              <br/>
              {obj.serverName2}
            </React.Fragment>
          :
          <React.Fragment>
            {obj.serverName}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Mac Address',
      align: 'center',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
            <React.Fragment>
              {obj.macAddress}
              <br/>
              {obj.macAddress2}
            </React.Fragment>
          :
          <React.Fragment>
            {obj.macAddress}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Option 12 (DHCP)',
      align: 'center',
      dataIndex: 'option12',
      key: 'option12',
      render: (name, obj)  => (
        <React.Fragment>
        { (obj.ips.length > 1) ?
            <React.Fragment>
              {obj.option12 ? obj.option12 : null}
              <br/>
              {obj.option12 ? obj.option12 : null}
            </React.Fragment>
          :
          <React.Fragment>
            {obj.option12 ? obj.option12 : null}
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Object Type',
      align: 'center',
      dataIndex: 'objectType',
      key: 'objectType',
    },
  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'requestIp') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>REQUEST IP</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>REQUEST IP</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <AssetSelector vendor='infoblox'/>
        <Divider/>

        { ( props.asset && props.asset.id ) ?
          <React.Fragment>
            <React.Fragment>
              <Button type="primary" onClick={() => requestAdd()}>
                +
              </Button>
              <br/>
              <br/>
              <Table
                columns={requestsColumn}
                dataSource={requests}
                bordered
                rowKey="id"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />
              <Button
                type="primary"
                style={{float: "right", marginRight: '20px'}}
                onClick={() => validation()}
              >
                Request Ip
              </Button>
              <br/>
            </React.Fragment>
            { response.length !== 0  ?
              <React.Fragment>
                {responseLoading ?
                  <Spin indicator={responseIcon} style={{margin: '10% 45%'}}/>
                :
                  <React.Fragment>
                    <Divider/>
                    <Table
                      columns={responseColumn}
                      dataSource={response}
                      bordered
                      rowKey="id"
                      scroll={{x: 'auto'}}
                      pagination={false}
                      style={{marginBottom: 10}}
                    />
                  </React.Fragment>
                }
              </React.Fragment>
            :
              null
            }
          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }
      </Modal>

      {visible ?
        <React.Fragment>
          {errorsComponent()}
        </React.Fragment>
      :
        null
      }

    </React.Fragment>
  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  assets: state.infoblox.assets,
  asset: state.infoblox.asset,
}))(RequestIp);
