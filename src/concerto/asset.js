import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error'

import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin, Divider, Card } from 'antd';

import { LoadingOutlined, ReloadOutlined, CloseCircleOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';

import { err } from './store'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const assetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function Asset(props) {

  let [loading, setLoading] = useState(false);
  let [assetsRefresh, setAssetsRefresh] = useState(false);

  let [assets, setAssets] = useState([]);  
  let [protocols, setProtocols] = useState([]);
  let [ports, setPorts] = useState([]);
  let [paths, setPaths] = useState([]);
  let [environments, setEnvironments] = useState([]);
  let [datacenters, setDatacenters] = useState([]);
  let [originAssets, setOriginAssets] = useState([]);

  let [errors, setErrors] = useState({});

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  const prevVendor = useRef(props.vendor);

  useEffect(() => {
    if (assetsRefresh) {
      setAssetsRefresh(false)
      main()
    }
  }, [assetsRefresh]);

  useEffect(() => {
    //if (prevVendor.current !== props.vendor) {
      setAssetsRefresh(false);
      main();
    //}
    //prevVendor.current = props.vendor;
  }, [props.vendor]);


  let main = async () => {
    setLoading(true)

    let fetchedAssets = await dataGet('assets')
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      let error = Object.assign(fetchedAssets, {
        component: 'asset',
        vendor: 'concerto',
        errorType: 'assetsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      let protocolsLocal = []
      let portsLocal = []
      let pathsLocal = []
      let environmentsLocal = []
      let datacentersLocal = []
      let uniqueProtocols = []
      let uniquePorts = []
      let uniquePaths = []
      let uniqueEnvironments = []
      let uniqueDatacenters = []

      fetchedAssets.data?.items.forEach((item, i) => {
        item.existent = true
        item.isModified = {}
        item.tlsverify = item.tlsverify
        protocolsLocal.push(item.protocol)
        portsLocal.push(item.port)
        pathsLocal.push(item.path)
        environmentsLocal.push(item.environment)
        datacentersLocal.push(item.datacenter)
      });

      uniqueProtocols = [...new Set(protocolsLocal)];
      uniquePorts = [...new Set(portsLocal)];
      uniquePaths = [...new Set(pathsLocal)];
      uniqueEnvironments = [...new Set(environmentsLocal)];
      uniqueDatacenters = [...new Set(datacentersLocal)];

      setAssets(fetchedAssets.data.items);  
      setOriginAssets(fetchedAssets.data.items);
      setProtocols(uniqueProtocols);
      setPorts(uniquePorts);
      setPaths(uniquePaths);
      setEnvironments(uniqueEnvironments);
      setDatacenters(uniqueDatacenters);
    }

    setLoading(false)
  }

  let dataGet = async (entities, assetId) => {
    let endpoint = `${props.vendor}/${entities}/`
    let r
    if (assetId) {
      endpoint = `${props.vendor}/${assetId}/${entities}/`
    }
    if (props.vendor === 'f5' && entities === 'assets') {
      endpoint = `${props.vendor}/${entities}/?includeDr`
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

  let itemAdd = async (items, type) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(items, type);
    setAssets([...list]);  
  };

  let itemRemove = async (item, items) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, items);
    setAssets([...list]);  
  };

  let readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = res => {
        resolve(res.target.result);
      };
      reader.onerror = err => reject(err);
  
      reader.readAsBinaryString(file);
    });
  }

  let set = async (key, value, asset) => {

    /*
      se non copi correttamente la proprietà assetsDr, 
      e poi modifichi ass.assetsDr, 
      modificherai anche origAsset.assetsDr 
      (perché ass e origAsset condividono lo stesso riferimento a quella proprietà)
    */

    //let assetsCopy = [...assets]
    let assetsCopy = JSON.parse(JSON.stringify(assets));

    /*let assetsCopy = assets.map(a => ({
      ...a,
      assetsDr: a.assetsDr ? a.assetsDr.map(dr => ({ ...dr, asset: { ...dr.asset } })) : [],
      isModified: { ...a.isModified },
    }));*/
    let origAsset = originAssets.find(a => a.id === asset.id)
    let ass = assetsCopy.find(a => a.id === asset.id)

    if (key === 'fqdn') {
      if (value) {
        if (ass.existent) {
          if (origAsset.fqdn !== value) {
            ass.isModified.fqdn = true
            ass.fqdn = value
          }
          else {
            delete ass.isModified.fqdn
            ass.fqdn = value
          }
        }
        else {
          ass.fqdn = value
        }
        delete ass.fqdnError
      }
      else {
        //blank value while typing.
        ass.fqdn = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'name') {

      if (value) {
        if (ass.existent) {
          if (origAsset.name !== value) {
            ass.isModified.name = true
            ass.name = value
          }
          else {
            delete ass.isModified.name
            ass.name = value
          }
        }
        else {
          ass.name = value
        }
        delete ass.nameError
      }
      else {
        //blank value while typing.
        ass.name = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'protocol') {

      if (value) {
        if (ass.existent) {
          if (origAsset.protocol !== value) {
            ass.isModified.protocol = true
            ass.protocol = value
          }
          else {
            delete ass.isModified.protocol
            ass.protocol = value
          }
        }
        else {
          ass.protocol = value
        }
        delete ass.protocolError
      }
      else {
        //blank value while typing.
        ass.protocol = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'protocols') {

      let protocolsCopy = [...protocols]
      if (value) {
        protocolsCopy.push(value)
      }
      setProtocols([...protocolsCopy])
    }

    if (key === 'port') {

      if (value) {
        if (ass.existent) {
          if (origAsset.port !== value) {
            ass.isModified.port = true
            ass.port = value
          }
          else {
            delete ass.isModified.port
            ass.port = value
          }
        }
        else {
          ass.port = value
        }
        delete ass.portError
      }
      else {
        //blank value while typing.
        ass.port = ''
      }

      setAssets([...assetsCopy])
    }
    
    if (key === 'ports') {

      let portsCopy = [...ports]
      if (value) {
        portsCopy.push(value)
      }
      setPorts([...portsCopy])
    }

    if (key === 'path') {

      if (value) {
        if (ass.existent) {
          if (origAsset.path !== value) {
            ass.isModified.path = true
            ass.path = value
          }
          else {
            delete ass.isModified.path
            ass.path = value
          }
        }
        else {
          ass.path = value
        }
        delete ass.pathError
      }
      else {
        //blank value while typing.
        ass.path = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'paths') {

      let pathsCopy = [...paths]
      if (value) {
        pathsCopy.push(value)
      }
      setPaths([...pathsCopy])
    }

    if (key === 'environment') {

      if (value) {
        if (ass.existent) {
          if (origAsset.environment !== value) {
            ass.isModified.environment = true
            ass.environment = value
          }
          else {
            delete ass.isModified.environment
            ass.environment = value
          }
        }
        else {
          ass.environment = value
        }
        delete ass.environmentError
      }
      else {
        //blank value while typing.
        ass.environment = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'environments') {

      let environmentsCopy = [...environments]
      if (value) {
        environmentsCopy.push(value)
      }
      setEnvironments([...environmentsCopy])
    }

    if (key === 'datacenters') {

      let datacentersCopy = [...datacenters]
      if (value) {
        datacentersCopy.push(value)
      }
      setDatacenters([...datacentersCopy])

    }

    if (key === 'datacenter') {

      if (value) {
        if (ass.existent) {
          if (origAsset.datacenter !== value) {
            ass.isModified.datacenter = true
            ass.datacenter = value
          }
          else {
            delete ass.isModified.datacenter
            ass.datacenter = value
          }
        }
        else {
          ass.datacenter = value
        }
        delete ass.datacenterError
      }
      else {
        //blank value while typing.
        ass.datacenter = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'tlsverify') {
      if (ass.existent) {
        if (origAsset.tlsverify !== value) {
          ass.isModified.tlsverify = true
          ass.tlsverify = value
        }
        else {
          delete ass.isModified.tlsverify
          ass.tlsverify = value
        }
      }
      else {
        ass.tlsverify = value
      }
      delete ass.tlsverifyError
      setAssets([...assetsCopy])
    }

    if (key === 'assetDr') {
      if (ass.existent) {
        if (origAsset.assetsDr && origAsset.assetsDr[0]) {
          if (value) {
            let assDr = assetsCopy.find(a => a.id === value)
            if (origAsset.assetsDr[0].asset.id !== value) {
              ass.isModified.assetsDr = true
              ass.assetsDr[0].asset = assDr
            }
            else {
              delete ass.isModified.assetsDr
              ass.assetsDr[0].asset = origAsset.assetsDr[0].asset
            }
          }
          else {
            ass.isModified.assetsDr = true
            ass.assetsDr = []
          }
        }
        else {
          if (value) {
            let assDr = assetsCopy.find(a => a.id === value)
            ass.assetsDr = []
            ass.assetsDr.push({asset: assDr})
            ass.isModified.assetsDr = true
          }
          else {
            ass.assetsDr = []
            delete ass.isModified.assetsDr
          }
        }
      }
      else {
        if (value) {
          let assDr = assetsCopy.find(a => a.id === value)
          ass.assetsDr = []
          ass.assetsDr.push({asset: assDr})
        }
        else {
          ass.assetsDr = []
        }
      }

      setAssets([...assetsCopy])
    }

    if (key === 'username') {

      if (value) {
        if (ass.existent) {
          if (origAsset.username !== value) {
            ass.isModified.username = true
            ass.username = value
          }
          else {
            delete ass.isModified.username
            ass.username = value
          }
        }
        else {
          ass.username = value
        }
        delete ass.usernameError
      }
      else {
        //blank value while typing.
        ass.username = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'password') {

      if (value) {
        if (ass.existent) {
          if (origAsset.password !== value) {
            ass.isModified.password = true
            ass.password = value
          }
          else {
            delete ass.isModified.password
            ass.password = value
          }
        }
        else {
          ass.password = value
        }
        delete ass.passwordError
      }
      else {
        //blank value while typing.
        ass.password = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'upload') {

      if (value) {
        if (ass.existent) {
          if (origAsset[key] !== value) {
            ass.isModified[key] = true
            ass.file = value
            ass.fileName = value.name
            ass.size = value.size
            ass.type = value.type
            let t = await readFile(value)
            ass.binaryString = t
          }
          else {
            delete ass.isModified[key]
            ass.file = value
            ass.fileName = value.name
            ass.size = value.size
            ass.type = value.type
            let t = await readFile(value)
            ass.binaryString = t
          }
        }
        else {
          ass.file = value
          ass.fileName = value.name
          ass.size = value.size
          ass.type = value.type
          let t = await readFile(value)
          ass.binaryString = t
        }
        delete ass[`binaryStringError`]
      }
      else {
        //blank value while typing.
        ass.binaryString = ''
      }

      setAssets([...assetsCopy])
    }

    if (key === 'toDelete') {
      if (value) {
        ass.toDelete = true
      }
      else {
        delete ass.toDelete
      }
      setAssets([...assetsCopy])
    }

  }

  let validation = async () => {
    let errors = await validationCheck()
    if (errors === 0) {
      
      cudManager()
    }
  }

  let validationCheck = async () => {
    let assetsCopy = [...assets]
    let errors = 0
    let validators = new Validators()

    for (const ass of Object.values(assetsCopy)) {
      if (!validators.fqdn(ass.fqdn)) {
        ++errors
        ass.fqdnError = true
      }
      if (props.vendor === 'proofpoint' && !ass.name) {
        ++errors
        ass.nameError = true
      }
      if (!ass.protocol) {
        ass.protocolError = true
        ++errors
      }
      if (!ass.port || !validators.port(ass.port)) {
        ass.portError = true
        ++errors
      }
      if (!ass.path) {
        ass.pathError = true
        ++errors
      }
      if (!ass.environment) {
        ass.environmentError = true
        ++errors
      }
      if (!ass.datacenter) {
        ass.datacenterError = true
        ++errors
      }
      if (props.vendor !== 'proofpoint') {
        if (!ass.existent) {
          if (!ass.username) {
            ass.usernameError = true
            ++errors
          }
          if (!ass.password) {
            ass.passwordError = true
            ++errors
          }
        }
        else {
          if (ass.isModified.username && !ass.username) {
            ass.usernameError = true
            ++errors
          }
          if (ass.isModified.password && !ass.password) {
            ass.passwordError = true
            ++errors
          }
        }
      }
      

    }
    setAssets([...assetsCopy])
    return errors
  }
  
  let cudManager = async () => {
    let assetsCopy = [...assets]
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const ass of Object.values(assets)) {
      if (ass.toDelete) {
        toDelete.push(ass)
      }
      if (ass.isModified && Object.keys(ass.isModified).length > 0) {
        toPatch.push(ass)
      }
      if (!ass.existent) {
        toPost.push(ass)
      }
    }

    if (toDelete.length > 0) {
      for (const ass of toDelete) {
        ass.loading = true
        setAssets([...assetsCopy])

        let a = await assetDelete(ass.id)
        if (a.status && a.status !== 200 ) {
          let error = Object.assign(a, {
            component: 'asset',
            vendor: 'concerto',
            errorType: 'assetDeleteError'
          })
          props.dispatch(err(error))
          ass.loading = false
          setAssets([...assetsCopy])
        }
        else {
          ass.loading = false
          setAssets([...assetsCopy])
        }

      }
    }

    if (toPost.length > 0) {
      for (const ass of toPost) {
        let body = {}

        body.data = {
           "fqdn": ass.fqdn,
           "protocol": ass.protocol,
           "port": ass.port,
           "path": ass.path,
           "environment": ass.environment,
           "datacenter": ass.datacenter,
           "tlsverify": ass.tlsverify,
           "username": ass.username,
           "password": ass.password
        }

        if (props.vendor === 'proofpoint') {
          body.data.name = ass.name
          body.data["logo_base64"] = btoa(ass.binaryString)
        }

        ass.loading = true
        setAssets([...assetsCopy])

        let a = await assAdd(body)
        if (a.status && a.status !== 201 ) {
          let error = Object.assign(a, {
            component: 'asset',
            vendor: 'concerto',
            errorType: 'assetAddError'
          })
          props.dispatch(err(error))
          ass.loading = false
          setAssets([...assetsCopy])
        }
        else {
          ass.loading = false
          setAssets([...assetsCopy])
        }
      }
    }

    //add dr
    if (toPost.length > 0) {
      let tempAssets = []
      let fetchedAssets = await dataGet('assets')
      if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
        let error = Object.assign(fetchedAssets, {
          component: 'asset',
          vendor: 'concerto',
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
        return
      }
      else {
        tempAssets = JSON.parse(JSON.stringify(fetchedAssets.data.items))
        for (const ass of toPost) {
          if (ass.assetsDr && ass.assetsDr.length > 0) {
            let as = tempAssets.find(a => a.fqdn === ass.fqdn)
            let b = {}
            b.data = {
              "assetDrId": ass.assetsDr[0].asset.id,
              "enabled": true
            }

            ass.drLoading = true
            setAssets([...assetsCopy])
            let drAdd = await drAddFunc(as.id, b)
            if (drAdd.status && drAdd.status !== 201 ) {
              let error = Object.assign(drAdd, {
                component: 'asset',
                vendor: 'concerto',
                errorType: 'drAddError'
              })
              props.dispatch(err(error))
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
            else {
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
          }
        }
      }
    }

    if (toPatch.length > 0) {
      for (const ass of toPatch) {
        let body = {}

        body.data = {
           "fqdn": ass.fqdn,
           "protocol": ass.protocol,
           "port": ass.port,
           "path": ass.path,
           "environment": ass.environment,
           "datacenter": ass.datacenter,
           "tlsverify": ass.tlsverify
        }

        if (props.vendor === 'proofpoint') {
          body.data.name = ass.name
          body.data["logo_base64"] = btoa(ass.binaryString)
        }

        if (ass.isModified.username) {
          body.data.username = ass.username
        }
        if (ass.isModified.password) {
          body.data.password = ass.password
        }

        ass.loading = true
        setAssets([...assetsCopy])

        let a = await assModify(ass.id, body)
        if (a.status && a.status !== 200 ) {
          let error = Object.assign(a, {
            component: 'asset',
            vendor: 'concerto',
            errorType: 'assetModifyError'
          })
          props.dispatch(err(error))
          ass.loading = false
          setAssets([...assetsCopy])
        }
        else {
          ass.loading = false
          setAssets([...assetsCopy])
        }

        if (ass.isModified.assetsDr) {
          if (ass.assetsDr && ass.assetsDr.length < 1 ) {
            //deletedr
            let origAsset = originAssets.find(a => a.id === ass.id)

            ass.drLoading = true
            setAssets([...assetsCopy])

            let drDelete = await drDeleteFunc(ass.id, origAsset.assetsDr[0].asset.id)
            if (drDelete.status && drDelete.status !== 200 ) {
              let error = Object.assign(drDelete, {
                component: 'asset',
                vendor: 'concerto',
                errorType: 'drDeleteError'
              })
              props.dispatch(err(error))
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
            else {
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
          }
          else {
            //deletedr
            let origAsset = originAssets.find(a => a.id === ass.id)

            if (origAsset.assetsDr.length > 0) {
              ass.drLoading = true
              setAssets([...assetsCopy])

              let drDelete = await drDeleteFunc(ass.id, origAsset.assetsDr[0].asset.id)
              if (drDelete.status && drDelete.status !== 200 ) {
                let error = Object.assign(drDelete, {
                  component: 'asset',
                  vendor: 'concerto',
                  errorType: 'drDeleteError'
                })
                props.dispatch(err(error))
                ass.drLoading = false
                setAssets([...assetsCopy])
              }
              else {
                ass.drLoading = false
                setAssets([...assetsCopy])
              }
            }

            //add new dr
            let b = {}
            b.data = {
              "assetDrId": ass.assetsDr[0].asset.id,
              "enabled": true
            }

            ass.drLoading = true
            setAssets([...assetsCopy])
            let drAdd = await drAddFunc(ass.id, b)
            if (drAdd.status && drAdd.status !== 201 ) {
              let error = Object.assign(drAdd, {
                component: 'asset',
                vendor: 'concerto',
                errorType: 'drAddError'
              })
              props.dispatch(err(error))
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
            else {
              ass.drLoading = false
              setAssets([...assetsCopy])
            }
          }
        }

      }
    }

    setAssetsRefresh(true)

  }

  let drAddFunc = async (id, b) => {
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
    await rest.doXHR(`${props.vendor}/asset/${id}/assetsdr/`, props.token, b )
    return r
  }

  let drDeleteFunc = async (assetId, assetDrId) => {
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
    await rest.doXHR(`${props.vendor}/asset/${assetId}/assetdr/${assetDrId}/`, props.token )
    return r
  }

  let assetDelete = async (assetId) => {
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
    await rest.doXHR(`${props.vendor}/asset/${assetId}/`, props.token )
    return r
  }

  let assModify = async (assId, body) => {
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
    await rest.doXHR(`${props.vendor}/asset/${assId}/`, props.token, body )
    return r
  }

  let assAdd = async (body) => {
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
    await rest.doXHR(`${props.vendor}/assets/`, props.token, body )
    return r
  }

  let returnCol = () => {
    let newArray = vendorColumns.filter(value => Object.keys(value).length !== 0);
    
    if (props.vendor === 'proofpoint') {
      newArray = proofpointColumns.filter(value => Object.keys(value).length !== 0);
    }
    return newArray
  }

  let Example = ({ data }) => <img src={`data:image/jpeg;base64,${data}`} width="200" />

  let vendorColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={assetLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Protocol',
      align: 'center',
      dataIndex: 'protocol',
      key: 'protocol',
      ...getColumnSearchProps(
        'protocol', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.protocolError ?
                  {border: `1px solid red`, width: 120}
                :
                  {width: 120}
              }
              value={obj.protocol}
              onChange={e => {
                set('protocol', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('protocols', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={protocols ? protocols.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Fqdn',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        return (
          <React.Fragment>
          <Input
            defaultValue={obj.fqdn}
            style={
              obj.fqdnError ?
                {borderColor: 'red', textAlign: 'center', width: 200}
              :
                {textAlign: 'center', width: 200}
            }
            onBlur={e => {
              set('fqdn', e.target.value, obj)}
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
      ...getColumnSearchProps(
        'port', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.portError ?
                  {border: `1px solid red`, width: 100}
                :
                  {width: 100}
              }
              value={obj.port}
              onChange={e => {
                set('port', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('ports', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={ports ? ports.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Path',
      align: 'center',
      dataIndex: 'path',
      key: 'path',
      ...getColumnSearchProps(
        'path', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.pathError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.path}
              onChange={e => {
                set('path', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('paths', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={paths ? paths.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Environment',
      align: 'center',
      dataIndex: 'environment',
      key: 'environment',
      ...getColumnSearchProps(
        'environment', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.environmentError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.environment}
              onChange={e => {
                set('environment', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('environments', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={environments ? environments.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Datacenter',
      align: 'center',
      dataIndex: 'datacenter',
      key: 'datacenter',
      ...getColumnSearchProps(
        'datacenter', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.datacenterError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.datacenter}
              onChange={e => {
                set('datacenter', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('datacenters', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={datacenters ? datacenters.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'TLSverify',
      align: 'center',
      dataIndex: 'tlsverify',
      key: 'tlsverify',
      render: (name, obj)  => {
        return (
            <Radio.Group
              style={
                obj.tlsverifyError ?
                  {marginTop: 5, backgroundColor: 'red'}
                :
                  {marginTop: 5}
              }
              value={obj.tlsverify}
              onChange={e => {set('tlsverify', e.target.value, obj)}
              }
            >
              <Space direction="vertical">
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No </Radio>
              </Space>
            </Radio.Group>
        )
      },
    },
    ...(
      props.vendor === 'f5' ?
        [
          {
            title: 'DR',
            align: 'center',
            width: 250,
            dataIndex: 'assetsDrList',
            key: 'assetsDrList',
            ...getColumnSearchProps(
              'assetsDrList', 
              searchInput, 
              (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
              (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
              searchText, 
              searchedColumn, 
              setSearchText, 
              setSearchedColumn
            ),
            render: (name, obj)  => (
              <React.Fragment>
                {obj.drLoading ?
                  <Spin indicator={assetLoadIcon} style={{margin: 'auto auto'}}/>
                :
                  <Space>
                    <Select
                      value={(obj.assetsDr && obj.assetsDr.length > 0) ? obj.assetsDr[0].asset.id : null}
                      key={obj.id}
                      style={{ width: '200px'}}
                      onChange={e => {set('assetDr', e, obj)} }
                    >
                      { assets.map((dr,i) => {
                        return (
                          <Select.Option key={i} value={dr.id}>{dr.fqdn}</Select.Option>
                        )
                      })
                      }
                    </Select>
                    <CloseCircleOutlined style={{ marginLeft: '15px'}} onClick={() => set('assetDr', '', obj)}/>
                  </Space>
                }
              </React.Fragment>
            )
          },
        ]
      :
        []
      ),
    {
      title: 'Username',
      align: 'center',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps(
        'username', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        return (
          <React.Fragment>
          <Input
            defaultValue={obj.username}
            suffix={<UserOutlined className="site-form-item-icon" />}
            style={
              obj.usernameError ?
                {borderColor: 'red', textAlign: 'left', width: 150}
              :
                {textAlign: 'left', width: 150}
            }
            onBlur={e => {
              set('username', e.target.value, obj)}
            }
          />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Password',
      align: 'center',
      dataIndex: 'password',
      key: 'password',
      ...getColumnSearchProps(
        'password', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        return (
          <React.Fragment>
          <Input.Password
            defaultValue={obj.password}
            style={
              obj.passwordError ?
                {borderColor: 'red', textAlign: 'left', width: 150}
              :
                {textAlign: 'left', width: 150}
            }
            onBlur={e => {
              set('password', e.target.value, obj)}
            }
          />
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
              onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type="primary"
              danger
              onClick={(e) => itemRemove(obj, assets)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  let proofpointColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={assetLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Logo',
      align: 'center',
      dataIndex: '',
      key: 'logo_base64',
      render: (val, obj)  => (
        

        <React.Fragment>
          <Example data={obj.logo_base64} />
        </React.Fragment>    
      )
    },
    {
      title: 'Upload Logo',
      align: 'center',
      dataIndex: '',
      key: 'upload',
      render: (val, obj)  => (
        <React.Fragment>
          <Input 
            type="file"
            style=
              { 
                obj[`binaryStringError`] ?
                {borderColor: `red`, width: 350}
              :
                {width: 350}
              }
            onChange={e => set('upload', e.target.files[0], obj)} 
          />
          <Card>
            <p>Name: {obj.fileName}</p>
            <p>Type: {obj.type}</p>
            <p>Size: {obj.size} Bytes</p>
          </Card>    
        </React.Fragment>    
      )
    },
    {
      title: 'Protocol',
      align: 'center',
      dataIndex: 'protocol',
      key: 'protocol',
      ...getColumnSearchProps(
        'protocol', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.protocolError ?
                  {border: `1px solid red`, width: 120}
                :
                  {width: 120}
              }
              value={obj.protocol}
              onChange={e => {
                set('protocol', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('protocols', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={protocols ? protocols.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Fqdn',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        return (
          <React.Fragment>
          <Input
            defaultValue={obj.fqdn}
            style={
              obj.fqdnError ?
                {borderColor: 'red', textAlign: 'center', width: 200}
              :
                {textAlign: 'center', width: 200}
            }
            onBlur={e => {
              set('fqdn', e.target.value, obj)}
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
              set('name', e.target.value, obj)}
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
      ...getColumnSearchProps(
        'port', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.portError ?
                  {border: `1px solid red`, width: 100}
                :
                  {width: 100}
              }
              value={obj.port}
              onChange={e => {
                set('port', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('ports', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={ports ? ports.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Path',
      align: 'center',
      dataIndex: 'path',
      key: 'path',
      ...getColumnSearchProps(
        'path', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.pathError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.path}
              onChange={e => {
                set('path', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('paths', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={paths ? paths.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Environment',
      align: 'center',
      dataIndex: 'environment',
      key: 'environment',
      ...getColumnSearchProps(
        'environment', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.environmentError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.environment}
              onChange={e => {
                set('environment', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('environments', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={environments ? environments.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'Datacenter',
      align: 'center',
      dataIndex: 'datacenter',
      key: 'datacenter',
      ...getColumnSearchProps(
        'datacenter', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => {
        let s = '';

        return (
          <React.Fragment>
            <Select
              style={
                obj.datacenterError ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              value={obj.datacenter}
              onChange={e => {
                set('datacenter', e, obj)}
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '8px 0',
                    }}
                  />
                  <Space
                    style={{
                      padding: '0 8px 4px',
                    }}
                  >
                    <Input
                      placeholder="Type new"
                      onChange={e => s = e.target.value}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={() => {set('datacenters', s, obj)} }
                    >
                    </Button>

                  </Space>
                </>
              )}
              options={datacenters ? datacenters.map((item) => ({
                label: item,
                value: item,
              }))
              :
              null
              }
            />
          </React.Fragment>
        )
      },
    },
    {
      title: 'TLSverify',
      align: 'center',
      dataIndex: 'tlsverify',
      key: 'tlsverify',
      render: (name, obj)  => {
        return (
            <Radio.Group
              style={
                obj.tlsverifyError ?
                  {marginTop: 5, backgroundColor: 'red'}
                :
                  {marginTop: 5}
              }
              value={obj.tlsverify}
              onChange={e => {set('tlsverify', e.target.value, obj)}
              }
            >
              <Space direction="vertical">
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No </Radio>
              </Space>
            </Radio.Group>
        )
      },
    },
    ...(
      props.vendor === 'f5' ?
        [
          {
            title: 'DR',
            align: 'center',
            width: 250,
            dataIndex: 'assetsDrList',
            key: 'assetsDrList',
            ...getColumnSearchProps(
              'assetsDrList', 
              searchInput, 
              (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
              (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
              searchText, 
              searchedColumn, 
              setSearchText, 
              setSearchedColumn
            ),
            render: (name, obj)  => (
              <React.Fragment>
                {obj.drLoading ?
                  <Spin indicator={assetLoadIcon} style={{margin: 'auto auto'}}/>
                :
                  <Space>
                    <Select
                      value={(obj.assetsDr && obj.assetsDr.length > 0) ? obj.assetsDr[0].asset.id : null}
                      key={obj.id}
                      style={{ width: '200px'}}
                      onChange={e => {set('assetDr', e, obj)} }
                    >
                      { assets.map((dr,i) => {
                        return (
                          <Select.Option key={i} value={dr.id}>{dr.fqdn}</Select.Option>
                        )
                      })
                      }
                    </Select>
                    <CloseCircleOutlined style={{ marginLeft: '15px'}} onClick={() => set('assetDr', '', obj)}/>
                  </Space>
                }
              </React.Fragment>
            )
          },
        ]
      :
        []
      ),
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
              onClick={(e) => itemRemove(obj, assets)}
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
    if (props.error && props.error.component === 'asset') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
        <React.Fragment>

          <Radio.Group>
            <Radio.Button
              style={{marginLeft: 16 }}
              onClick={() => setAssetsRefresh(true)}
            >
              <ReloadOutlined/>
            </Radio.Button>
          </Radio.Group>

          <Radio.Group
            buttonStyle="solid"
          >
            <Radio.Button
              buttonStyle="solid"
              style={{marginLeft: 16 }}
              onClick={() => itemAdd(assets)}
            >
              Add asset
            </Radio.Button>
          </Radio.Group>

          <br/>
          <Table
            columns={returnCol()}
            style={{width: '100%', padding: 15}}
            dataSource={assets}
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


        </React.Fragment>
        //</Space>
      }

      {errorsComponent()}

    </React.Fragment>
  )

}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

}))(Asset);
