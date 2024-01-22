import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from './error'

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin, Divider, Card } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined, CloseCircleOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';


import {
  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError,
  drAddError,
  drDeleteError
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const assetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



//import List from './list'



class Permission extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};

    this.state = {
      searchText: '',
      searchedColumn: '',
      assets: [],
      protocols: [],
      ports: [],
      paths: [],
      environments: [],
      datacenters: [],
      originAssets: [],
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.assetsError) {
      this.setState({assetsRefresh: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({assetsRefresh: false})
      this.main()
    }
    if (this.state.assetsRefresh) {
      this.setState({assetsRefresh: false})
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
    await this.setState({loading: true})

    let fetchedAssets = await this.dataGet('assets')
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      await this.setState({loading: false})
      return
    }
    else {
      let protocols = []
      let ports = []
      let paths = []
      let environments = []
      let datacenters = []
      let uniqueProtocols = []
      let uniquePorts = []
      let uniquePaths = []
      let uniqueEnvironments = []
      let uniqueDatacenters = []

      fetchedAssets.data?.items.forEach((item, i) => {
        item.existent = true
        item.isModified = {}
        item.tlsverify = item.tlsverify
        protocols.push(item.protocol)
        ports.push(item.port)
        paths.push(item.path)
        environments.push(item.environment)
        datacenters.push(item.datacenter)
      });

      uniqueProtocols = [...new Set(protocols)];
      uniquePorts = [...new Set(ports)];
      uniquePaths = [...new Set(paths)];
      uniqueEnvironments = [...new Set(environments)];
      uniqueDatacenters = [...new Set(datacenters)];

      await this.setState({
        assets: fetchedAssets.data.items,
        originAssets: fetchedAssets.data.items,
        protocols: uniqueProtocols,
        ports: uniquePorts,
        paths: uniquePaths,
        environments: uniqueEnvironments,
        datacenters: uniqueDatacenters
      })
    }

    await this.setState({loading: false})
  }

  dataGet = async (entities, assetId) => {
    let endpoint = `${this.props.vendor}/${entities}/`
    let r
    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    if (this.props.vendor === 'f5' && entities === 'assets') {
      endpoint = `${this.props.vendor}/${entities}/?includeDr`
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

  assetsRefresh = async () => {
    await this.setState({assetsRefresh: true})
  }

  assetAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(this.state.assets))

    this.state.assets.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });

    n = id + 1
    p.id = n
    p.tlsverify = true
    list.push(p)

    await this.setState({assets: list})
  }

  assetRemove = async p => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let newList = assets.filter(n => {
      return p.id !== n.id
    })

    await this.setState({assets: newList})
  }

  readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = res => {
        resolve(res.target.result);
      };
      reader.onerror = err => reject(err);
  
      reader.readAsBinaryString(file);
    });
  }

  set = async (key, value, asset) => {

    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let origAsset = this.state.originAssets.find(a => a.id === asset.id)
    let ass = assets.find(a => a.id === asset.id)

    if (key === 'fqdn') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_fqdn`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_fqdn`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'name') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_name`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_name`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'protocol') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_protocol`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_protocol`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'protocols') {
      let ref = this.myRefs[`${asset.id}_protocol`]

      let protocols = JSON.parse(JSON.stringify(this.state.protocols))
      if (value) {
        protocols.push(value)
      }
      await this.setState({protocols: protocols})
      ref = this.myRefs[`${asset.id}_protocol`]
      ref.focus()
    }

    if (key === 'port') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_port`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_port`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }
    
    if (key === 'ports') {
      let ref = this.myRefs[`${asset.id}_port`]

      let ports = JSON.parse(JSON.stringify(this.state.ports))
      if (value) {
        ports.push(value)
      }
      await this.setState({ports: ports})
      ref = this.myRefs[`${asset.id}_port`]
      ref.focus()
    }

    if (key === 'path') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_path`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_path`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'paths') {
      let ref = this.myRefs[`${asset.id}_path`]

      let paths = JSON.parse(JSON.stringify(this.state.paths))
      if (value) {
        paths.push(value)
      }
      await this.setState({paths: paths})
      ref = this.myRefs[`${asset.id}_path`]
      ref.focus()
    }

    if (key === 'environment') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_environment`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_environment`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'environments') {
      let ref = this.myRefs[`${asset.id}_environment`]

      let environments = JSON.parse(JSON.stringify(this.state.environments))
      if (value) {
        environments.push(value)
      }
      await this.setState({environments: environments})
      ref = this.myRefs[`${asset.id}_environment`]
      ref.focus()
    }

    if (key === 'datacenters') {
      let ref = this.myRefs[`${asset.id}_datacenter`]

      let datacenters = JSON.parse(JSON.stringify(this.state.datacenters))
      if (value) {
        datacenters.push(value)
      }
      await this.setState({datacenters: datacenters})
      ref = this.myRefs[`${asset.id}_datacenter`]
      ref.focus()
    }

    if (key === 'datacenter') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_datacenter`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_datacenter`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
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
      await this.setState({assets: assets})
    }

    if (key === 'assetDr') {
      if (ass.existent) {
        if (origAsset.assetsDr && origAsset.assetsDr[0]) {
          if (value) {
            let assDr = assets.find(a => a.id === value)
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
            let assDr = assets.find(a => a.id === value)
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
          let assDr = assets.find(a => a.id === value)
          ass.assetsDr = []
          ass.assetsDr.push({asset: assDr})
        }
        else {
          ass.assetsDr = []
        }
      }

      await this.setState({assets: assets})
    }

    if (key === 'username') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_username`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_username`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'password') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`${asset.id}_password`]

      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

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

      await this.setState({assets: assets})
      ref = this.myRefs[`${asset.id}_password`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
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
            let t = await this.readFile(value)
            ass.binaryString = t
          }
          else {
            delete ass.isModified[key]
            ass.file = value
            ass.fileName = value.name
            ass.size = value.size
            ass.type = value.type
            let t = await this.readFile(value)
            ass.binaryString = t
          }
        }
        else {
          ass.file = value
          ass.fileName = value.name
          ass.size = value.size
          ass.type = value.type
          let t = await this.readFile(value)
          ass.binaryString = t
        }
        delete ass[`binaryStringError`]
      }
      else {
        //blank value while typing.
        ass.binaryString = ''
      }

      await this.setState({assets: assets})
    }

    if (key === 'toDelete') {
      if (value) {
        ass.toDelete = true
      }
      else {
        delete ass.toDelete
      }
      await this.setState({assets: assets})
    }

  }

  validation = async () => {
    let errors = await this.validationCheck()
    console.log(errors)
    if (errors === 0) {
      
      this.cudManager()
    }
  }

  validationCheck = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let errors = 0
    let validators = new Validators()

    for (const ass of Object.values(assets)) {
      if (!validators.fqdn(ass.fqdn)) {
        ++errors
        ass.fqdnError = true
      }
      if (this.props.vendor === 'proofpoint' && !ass.name) {
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
      if (this.props.vendor !== 'proofpoint') {
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
    await this.setState({assets: assets})
    return errors
  }
//
  cudManager = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
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
        await this.setState({assets: assets})

        let a = await this.assetDelete(ass.id)
        if (a.status && a.status !== 200 ) {
          this.props.dispatch(assetDeleteError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
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

        if (this.props.vendor === 'proofpoint') {
          body.data.name = ass.name
          body.data["logo_base64"] = btoa(ass.binaryString)
        }

        ass.loading = true
        await this.setState({assets: assets})

        let a = await this.assAdd(body)
        if (a.status && a.status !== 201 ) {
          this.props.dispatch(assetAddError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
        }
      }
    }

    //add dr
    if (toPost.length > 0) {
      let tempAssets = []
      let fetchedAssets = await this.dataGet('assets')
      if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
        this.props.dispatch(assetsError(fetchedAssets))
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
            await this.setState({assets: assets})
            let drAdd = await this.drAdd(as.id, b)
            if (drAdd.status && drAdd.status !== 201 ) {
              this.props.dispatch(drAddError(drAdd))
              ass.drLoading = false
              await this.setState({assets: assets})
            }
            else {
              ass.drLoading = false
              await this.setState({assets: assets})
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

        if (this.props.vendor === 'proofpoint') {
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
        await this.setState({assets: assets})

        let a = await this.assModify(ass.id, body)
        if (a.status && a.status !== 200 ) {
          this.props.dispatch(assetModifyError(a))
          ass.loading = false
          await this.setState({assets: assets})
        }
        else {
          ass.loading = false
          await this.setState({assets: assets})
        }

        if (ass.isModified.assetsDr) {
          if (ass.assetsDr && ass.assetsDr.length < 1 ) {
            //deletedr
            let origAsset = this.state.originAssets.find(a => a.id === ass.id)

            ass.drLoading = true
            await this.setState({assets: assets})

            let drDelete = await this.drDelete(ass.id, origAsset.assetsDr[0].asset.id)
            if (drDelete.status && drDelete.status !== 200 ) {
              this.props.dispatch(drDeleteError(drDelete))
              ass.drLoading = false
              await this.setState({assets: assets})
            }
            else {
              ass.drLoading = false
              await this.setState({assets: assets})
            }
          }
          else {
            //deletedr
            let origAsset = this.state.originAssets.find(a => a.id === ass.id)

            if (origAsset.assetsDr.length > 0) {
              ass.drLoading = true
              await this.setState({assets: assets})

              let drDelete = await this.drDelete(ass.id, origAsset.assetsDr[0].asset.id)
              if (drDelete.status && drDelete.status !== 200 ) {
                this.props.dispatch(drDeleteError(drDelete))
                ass.drLoading = false
                await this.setState({assets: assets})
              }
              else {
                ass.drLoading = false
                await this.setState({assets: assets})
              }
            }

            //add new dr
            let b = {}
            b.data = {
              "assetDrId": ass.assetsDr[0].asset.id,
              "enabled": true
            }

            ass.drLoading = true
            await this.setState({assets: assets})
            let drAdd = await this.drAdd(ass.id, b)
            if (drAdd.status && drAdd.status !== 201 ) {
              this.props.dispatch(drAddError(drAdd))
              ass.drLoading = false
              await this.setState({assets: assets})
            }
            else {
              ass.drLoading = false
              await this.setState({assets: assets})
            }
          }
        }

      }
    }

    this.assetsRefresh()

  }

  drAdd = async (id, b) => {
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
    await rest.doXHR(`${this.props.vendor}/asset/${id}/assetsdr/`, this.props.token, b )
    return r
  }

  drDelete = async (assetId, assetDrId) => {
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
    await rest.doXHR(`${this.props.vendor}/asset/${assetId}/assetdr/${assetDrId}/`, this.props.token )
    return r
  }

  assetDelete = async (assetId) => {
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
    await rest.doXHR(`${this.props.vendor}/asset/${assetId}/`, this.props.token )
    return r
  }

  assModify = async (assId, body) => {
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
    await rest.doXHR(`${this.props.vendor}/asset/${assId}/`, this.props.token, body )
    return r
  }

  assAdd = async (body) => {
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
    await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token, body )
    return r
  }


  render() {

    let returnCol = () => {
      let newArray
      newArray = vendorColumns.filter(value => Object.keys(value).length !== 0);
      
      if (this.props.vendor === 'proofpoint') {
        newArray = proofpointColumns.filter(value => Object.keys(value).length !== 0);
      }
      return newArray
    }

    const Example = ({ data }) => <img src={`data:image/jpeg;base64,${data}`} width="200" />

    const vendorColumns = [
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
                  this.set('protocol', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_protocol`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('protocols', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.protocols ? this.state.protocols.map((item) => ({
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
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.fqdn}
              ref={ref => this.myRefs[`${obj.id}_fqdn`] = ref}
              style={
                obj.fqdnError ?
                  {borderColor: 'red', textAlign: 'center', width: 200}
                :
                  {textAlign: 'center', width: 200}
              }
              onChange={e => {
                this.set('fqdn', e.target.value, obj)}
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
                  this.set('port', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_port`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('ports', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.ports ? this.state.ports.map((item) => ({
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
                  this.set('path', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_path`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('paths', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.paths ? this.state.paths.map((item) => ({
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
                  this.set('environment', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_environment`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('environments', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.environments ? this.state.environments.map((item) => ({
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
                  this.set('datacenter', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_datacenter`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('datacenters', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.datacenters ? this.state.datacenters.map((item) => ({
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
                onChange={e => {this.set('tlsverify', e.target.value, obj)}
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
        this.props.vendor === 'f5' ?
          [
            {
              title: 'DR',
              align: 'center',
              width: 250,
              dataIndex: 'assetsDrList',
              key: 'assetsDrList',
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
                        onChange={e => {this.set('assetDr', e, obj)} }
                      >
                        { this.state.assets.map((dr,i) => {
                          return (
                            <Select.Option key={i} value={dr.id}>{dr.fqdn}</Select.Option>
                          )
                        })
                        }
                      </Select>
                      <CloseCircleOutlined style={{ marginLeft: '15px'}} onClick={() => this.set('assetDr', '', obj)}/>
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
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.username}
              suffix={<UserOutlined className="site-form-item-icon" />}
              ref={ref => this.myRefs[`${obj.id}_username`] = ref}
              style={
                obj.usernameError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('username', e.target.value, obj)}
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
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input.Password
              value={obj.password}
              ref={ref => this.myRefs[`${obj.id}_password`] = ref}
              style={
                obj.passwordError ?
                  {borderColor: 'red', textAlign: 'left', width: 150}
                :
                  {textAlign: 'left', width: 150}
              }
              onChange={e => {
                this.set('password', e.target.value, obj)}
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
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.assetRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    const proofpointColumns = [
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
              onChange={e => this.set('upload', e.target.files[0], obj)} 
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
                  this.set('protocol', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_protocol`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('protocols', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.protocols ? this.state.protocols.map((item) => ({
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
        render: (name, obj)  => {
          return (
            <React.Fragment>
            <Input
              value={obj.fqdn}
              ref={ref => this.myRefs[`${obj.id}_fqdn`] = ref}
              style={
                obj.fqdnError ?
                  {borderColor: 'red', textAlign: 'center', width: 200}
                :
                  {textAlign: 'center', width: 200}
              }
              onChange={e => {
                this.set('fqdn', e.target.value, obj)}
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
              value={obj.name}
              ref={ref => this.myRefs[`${obj.id}_name`] = ref}
              style={
                obj.nameError ?
                  {borderColor: 'red', textAlign: 'center', width: 200}
                :
                  {textAlign: 'center', width: 200}
              }
              onChange={e => {
                this.set('name', e.target.value, obj)}
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
                  this.set('port', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_port`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('ports', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.ports ? this.state.ports.map((item) => ({
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
                  this.set('path', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_path`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('paths', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.paths ? this.state.paths.map((item) => ({
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
                  this.set('environment', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_environment`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('environments', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.environments ? this.state.environments.map((item) => ({
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
                  this.set('datacenter', e, obj)}
                }
                ref={ref => this.myRefs[`${obj.id}_datacenter`] = ref}
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
                      <Button type="text" icon={<PlusOutlined />} onClick={() => {this.set('datacenters', s, obj)} }
                      >
                      </Button>

                    </Space>
                  </>
                )}
                options={this.state.datacenters ? this.state.datacenters.map((item) => ({
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
                onChange={e => {this.set('tlsverify', e.target.value, obj)}
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
        this.props.vendor === 'f5' ?
          [
            {
              title: 'DR',
              align: 'center',
              width: 250,
              dataIndex: 'assetsDrList',
              key: 'assetsDrList',
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
                        onChange={e => {this.set('assetDr', e, obj)} }
                      >
                        { this.state.assets.map((dr,i) => {
                          return (
                            <Select.Option key={i} value={dr.id}>{dr.fqdn}</Select.Option>
                          )
                        })
                        }
                      </Select>
                      <CloseCircleOutlined style={{ marginLeft: '15px'}} onClick={() => this.set('assetDr', '', obj)}/>
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
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.assetRemove(obj)}
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
                onClick={() => this.assetsRefresh()}
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
                onClick={() => this.assetAdd()}
              >
                Add asset
              </Radio.Button>
            </Radio.Group>

            <br/>
            <Table
              columns={returnCol()}
              style={{width: '100%', padding: 15}}
              dataSource={this.state.assets}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />

              <Button
                type="primary"
                style={{float: 'right', marginRight: 15}}
                onClick={() => this.validation()}
              >
                Commit
              </Button>


          </React.Fragment>
          //</Space>
        }

        { this.props.assetsError ? <Error vendor={this.props.vendor} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.assetAddError ? <Error vendor={this.props.vendor} error={[this.props.assetAddError]} visible={true} type={'assetAddError'} /> : null }
        { this.props.assetModifyError ? <Error vendor={this.props.vendor} error={[this.props.assetModifyError]} visible={true} type={'assetModifyError'} /> : null }
        { this.props.assetDeleteError ? <Error vendor={this.props.vendor} error={[this.props.assetDeleteError]} visible={true} type={'assetDeleteError'} /> : null }
        { this.props.drAddError ? <Error vendor={this.props.vendor} error={[this.props.drAddError]} visible={true} type={'drAddError'} /> : null }
        { this.props.drDeleteError ? <Error vendor={this.props.vendor} error={[this.props.drDeleteError]} visible={true} type={'drDeleteError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  assetsError: state.concerto.assetsError,
  assetAddError: state.concerto.assetAddError,
  assetModifyError: state.concerto.assetModifyError,
  assetDeleteError: state.concerto.assetDeleteError,
  drAddError: state.concerto.drAddError,
  drDeleteError: state.concerto.drDeleteError,
}))(Permission);
