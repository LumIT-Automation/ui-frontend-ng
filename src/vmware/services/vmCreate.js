import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Table, Tree, Checkbox, Collapse } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  datacentersError,
  clustersError,
  clusterError,
  foldersError,
  templatesError,
  templateError,
  customSpecsError,
  customSpecError,
  bootstrapkeysError,
  finalpubkeysError,
  vmCreateError
} from '../store'

import AssetSelector from '../../vmware/assetSelector'

const { TextArea } = Input;
const { Panel } = Collapse;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class CreateVmService extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      numCpus: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
      numCoresPerSockets: [1,2],
      networkDeviceTypes: ['vmxnet', 'vmxnet2', 'vmxnet3', 'e1000', 'e1000e', 'pcnet32', 'vmrma', 'sr-iov'],
      diskDeviceTypes: ['thin', 'thick eager zeroed', 'thick lazy zerod'],
      networkDevices: [],
      diskDevices: [],
      datastorePlus: [],
      errors: {},
      cs: {},
      addresses: [],
      request: {
        numCoresPerSocket: 1
      },
      json: {
        name: "",
        notes: "",
        datacenter: "",
        cluster: "",
        host: "",
        main_datastore: "",
        folder: "",
        template: "",
        network_devices: [
          {
            portgroup: "",
            device_type: "vmxnet3"
          }
        ],
        disk_devices: [
          {
            datastore: "MAIN_DATASTORE",
            device_type: "thin",
            size_gib: ""
          }
        ],
        ram_mb: "",
        cpu: "",
        guestspec: "",
        hostname: "",
        domainName: "",
        network: [
          {
            dhcp: false,
            ip: "192.168.18.206",
            netMask: "255.255.255.0",
            gw: "192.168.18.1"
          }
        ],
        dns1: "",
        dns2: "",
        __vm_FARMBIL:"0",
        __vm_FARMNOBIL:"1",
        __tivoli_backup:"no",
        __monitoring:"no"
      }
    };
    this.baseState = this.state
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.state)

    if (this.state.visible) {
      if ( this.props.asset && (prevProps.asset !== this.props.asset) ) {
        this.main()
      }
      /*
      if (this.state.request.datacenterMoId && (prevState.request.datacenterMoId !== this.state.request.datacenterMoId)) {
        this.clustersFetch()
      }*/
      if (this.state.request.clusterMoId && (prevState.request.clusterMoId !== this.state.request.clusterMoId)) {
        console.log('clustmoidchanged ')
        this.clusterFetch()
      }
      if (this.state.request.templateMoId && (prevState.request.templateMoId !== this.state.request.templateMoId)) {
        this.templateFetch()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  main = async () => {

    await this.setState({datacentersLoading: true})
    let datacentersFetched = await this.datacentersGet()
    await this.setState({datacentersLoading: false})
    if (datacentersFetched.status && datacentersFetched.status !== 200 ) {
      this.props.dispatch(datacentersError(datacentersFetched))
      return
    }
    else {
      this.setState({datacenters: datacentersFetched.data.items})
    }

    await this.setState({foldersLoading: true})
    let foldersFetched = await this.foldersGet()
    await this.setState({foldersLoading: false})
    if (foldersFetched.status && foldersFetched.status !== 200 ) {
      this.props.dispatch(foldersError(foldersFetched))
      return
    }
    else {
      this.setState({folders: foldersFetched.data.items[0].children})
    }

    await this.setState({customSpecsLoading: true})
    let customSpecsFetched = await this.customSpecsGet()
    await this.setState({customSpecsLoading: false})
    if (customSpecsFetched.status && customSpecsFetched.status !== 200 ) {
      this.props.dispatch(customSpecsError(customSpecsFetched))
      return
    }
    else {
      this.setState({customSpecs: customSpecsFetched.data.items})
    }

    await this.setState({bootstrapkeysLoading: true})
    let bootstrapkeysFetched = await this.bootstrapkeysGet()
    await this.setState({bootstrapkeysLoading: false})
    if (bootstrapkeysFetched.status && bootstrapkeysFetched.status !== 200 ) {
      this.props.dispatch(bootstrapkeysError(bootstrapkeysFetched))
      return
    }
    else {
      this.setState({bootstrapkeys: bootstrapkeysFetched.data.items})
    }

    await this.setState({finalpubkeysLoading: true})
    let finalpubkeysFetched = await this.finalpubkeysGet()
    await this.setState({finalpubkeysLoading: false})
    if (finalpubkeysFetched.status && finalpubkeysFetched.status !== 200 ) {
      this.props.dispatch(finalpubkeysError(finalpubkeysFetched))
      return
    }
    else {
      this.setState({finalpubkeys: finalpubkeysFetched.data.items})
    }

    this.setState({jsonEnabled: true })
  }


  //FETCH
  datacentersGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/datacenters/?quick`, this.props.token)
    return r
  }

  clustersGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/datacenter/${this.state.request.datacenterMoId}/`, this.props.token)
    return r
  }

  foldersGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/vmFolders/tree/`, this.props.token)
    return r
  }

  customSpecsGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/customSpecs/`, this.props.token)
    return r
  }

  ///



  ///

  clusterGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/cluster/${this.state.request.clusterMoId}/`, this.props.token)
    return r
  }

  templatesGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/templates/?quick`, this.props.token)
    return r
  }

  templateGet = async () => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/template/${this.state.request.templateMoId}/`, this.props.token)
    return r
  }

  bootstrapkeysGet = async () => {
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
    await rest.doXHR(`vmware/stage2/bootstrapkeys/`, this.props.token)
    return r
  }

  finalpubkeysGet = async () => {
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
    await rest.doXHR(`vmware/stage2/finalpubkeys/`, this.props.token)
    return r
  }

  clustersFetch = async () => {
    await this.setState({clustersLoading: true})
    let clustersFetched = await this.clustersGet()
    await this.setState({clustersLoading: false})
    if (clustersFetched.status && clustersFetched.status !== 200 ) {
      this.props.dispatch(clustersError(clustersFetched))
      return
    }
    else {
      this.setState({clusters: clustersFetched.data.clusters})
    }
  }

  clusterFetch = async () => {
    await this.setState({networksLoading: true, datastoresLoading: true, hostsLoading: true})
    let clusterFetched = await this.clusterGet()
    if (clusterFetched.status && clusterFetched.status !== 200 ) {
      this.setState({networksLoading: false, datastoresLoading: false, hostsLoading: false})
      this.props.dispatch(clusterError(clusterFetched))
      return
    }
    else {
      let datastores = []
      clusterFetched.data.datastores.forEach(d => {
        if (d.multipleHostAccess === true) {
          datastores.push(d)
        }
      })
      this.setState({cluster: clusterFetched, hosts: clusterFetched.data.hosts, datastores: datastores, networks: clusterFetched.data.networks, networksLoading: false, datastoresLoading: false, hostsLoading: false})
    }
  }

  templatesFetch = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    delete request.template
    delete request.templateMoId
    await this.setState({request: request, templates: null, templatesLoading: true})

    let templatesFetched = await this.templatesGet()
    await this.setState({templatesLoading: false})
    if (templatesFetched.status && templatesFetched.status !== 200 ) {
      this.props.dispatch(templatesError(templatesFetched))
      return
    }
    else {
      this.setState({templates: templatesFetched.data.items})
    }
  }

  templateFetch = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    await this.setState({networkDevicesLoading: true, diskDevicesLoading: true})
    let templateFetched = await this.templateGet()

    if (templateFetched.status && templateFetched.status !== 200 ) {
      await this.setState({networkDevicesLoading: false, diskDevicesLoading: false})
      this.props.dispatch(templateError(templateFetched))
      return
    }
    else {
      let networkDevices = []
      let diskDevices = []

      if (templateFetched.data.networkDevices && templateFetched.data.networkDevices.existent) {
        let i = 1
        templateFetched.data.networkDevices.existent.forEach(n => {
          n.id = i
          n.existent = true
          networkDevices.push(n)
          ++i
        })
      }
      if (templateFetched.data.diskDevices && templateFetched.data.diskDevices.existent) {
        let i = 1
        templateFetched.data.diskDevices.existent.forEach(n => {
          n.id = i
          n.existent = true
          n.originalSizeMB = n.sizeMB
          diskDevices.push(n)
          ++i
        })
      }

      this.setState({networkDevicesLoading: false, diskDevicesLoading: false, template: templateFetched, templateNetworkDevices: networkDevices, networkDevices: networkDevices, diskDevices: diskDevices})
    }
  }

  networkDeviceAdd = () => {
    //let n = this.state.counter + 1
    let id = 0
    let n = 0
    this.state.networkDevices.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n, existent: false, networkMoId: null, deviceType: null, label:''}
    let list = JSON.parse(JSON.stringify(this.state.networkDevices))
    list.push(r)
    this.setState({networkDevices: list})
  }

  networkDeviceRemove = async r => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let newList = networkDevices.filter(n => {
      return r.id !== n.id
    })
    await this.setState({networkDevices: newList})
    if (this.state.networkDevices.length < 1 ) {
      newList.push({id: 0, existent: false, networkMoId: null, deviceType: null, label:''})
      await this.setState({networkDevices: newList})
    }
  }

  diskDeviceAdd = () => {
    //let n = this.state.counter + 1
    let id = 0
    let n = 0
    this.state.diskDevices.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n, existent: false, datastoreMoId: null, deviceType: null, label:''}
    let list = JSON.parse(JSON.stringify(this.state.diskDevices))
    list.push(r)
    this.setState({diskDevices: list})
  }

  diskDeviceRemove = async r => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let newList = diskDevices.filter(n => {
      return r.id !== n.id
    })
    await this.setState({diskDevices: newList})
    if (this.state.diskDevices.length < 1 ) {
      newList.push({id: 0, existent: false, datastoreMoId: null, deviceType: null, label:''})
      await this.setState({diskDevices: newList})
    }
  }

  addressAdd = () => {
    //let n = this.state.counter + 1
    let id = 0
    let n = 0
    this.state.addresses.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n, ip: '', netMask: '', gw: []}
    let list = JSON.parse(JSON.stringify(this.state.addresses))
    list.push(r)
    this.setState({addresses: list})
  }

  addressRemove = async r => {
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let newList = addresses.filter(n => {
      return r.id !== n.id
    })
    await this.setState({addresses: newList})
    if (this.state.addresses.length < 1 ) {
      newList.push({id: 0, ip: '', netMask: '', gw: []})
      await this.setState({addresses: newList})
    }
  }


  //SETTERS
  //Input

  jsonClusterSet = async c => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let clusters = JSON.parse(JSON.stringify(this.state.clusters))
    let cluster = clusters.find( r => r.moId === c )
    request.cluster = cluster.name
    request.clusterMoId = cluster.moId
    await this.setState({request: request})
    return cluster
  }

  jsonValidate = async e => {
    let json, beauty
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    try {
      json = JSON.parse(e.target.value)
      beauty = JSON.stringify(json, null, 2)
      json = JSON.parse(beauty)
      delete errors.jsonError
      delete errors.jsonColor
      await this.setState({json: json, errors: errors})
      this.jsonSet()
    } catch (error) {
      errors.jsonError = error.message
      errors.jsonColor = 'red'
      await this.setState({errors: errors})
    }
  }

  jsonSet = async () => {
    let json = JSON.parse(JSON.stringify(this.state.json))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (json.name) {
      request.vmName = json.name
    }
    if (json.notes) {
      request.notes = json.notes
    }
    if (json.datacenter) {
      let datacenters = JSON.parse(JSON.stringify(this.state.datacenters))
      let datacenter = datacenters.find( r => r.moId === json.datacenter )
      request.datacenterMoId = datacenter.moId
      request.datacenter = datacenter.name
    }
    await this.setState({request: request})
    await this.clustersFetch()

    if (json.cluster) {
      await this.jsonClusterSet(json.cluster)
    }

    if (json.host) {
      let hosts = JSON.parse(JSON.stringify(this.state.hosts))
      let host = hosts.find( r => r.moId === json.host )
      request.host = host.name
      request.hostMoId = host.moId
      await this.update(request)
    }

    if (json.folder) {
      request.vmFolderMoId = json.folder
      await this.update(request)
    }
  }




  vmNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.vmName = e.target.value
    this.setState({request: request})
  }

  //select number
  bootstrapkeySet = bootstrapkey => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.bootstrapkey = bootstrapkey
    this.setState({request: request})
  }

  finalpubkeySet = finalpubkey => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.finalpubkey = finalpubkey
    this.setState({request: request})
  }

  datacenterSet = async datacenter => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.datacenter = datacenter[0]
    request.datacenterMoId = datacenter[1]
    await this.setState({request: request})
    this.clustersFetch()
  }

  clusterSet = cluster => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.cluster = cluster[0]
    request.clusterMoId = cluster[1]
    this.setState({request: request})
  }

  hostSet = host => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.host = host[0]
    request.hostMoId = host[1]
    this.setState({request: request})
  }

  folderSet = (selectedKeys, info) => {
    console.log(selectedKeys)
    console.log(info)
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.vmFolderMoId = info.node.moId
    this.setState({ request: request})
  }

  templateSet = template => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.template = template[0]
    request.templateMoId = template[1]
    this.setState({request: request})
  }

  mainDatastoreSet = mainDatastore => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.mainDatastore = mainDatastore[0]
    request.mainDatastoreMoId = mainDatastore[1]

    let datastores = JSON.parse(JSON.stringify(this.state.datastores))
    let datastore = datastores.find( r => r.moId === mainDatastore[1] )
    let main = JSON.parse(JSON.stringify(datastore))
    main.name = 'MainDatastore'

    let newList = datastores.filter(n => {
      return n.name !== 'MainDatastore'
    })
    newList.push(main)

    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let newDiskDevices = []

    diskDevices.forEach((item, i) => {
      if (item.name === 'MainDatastore') {
        item.datastoreMoId = mainDatastore[1]
      }
      newDiskDevices.push(item)
    });

    this.setState({request: request, datastoresPlus: newList, diskDevices: newDiskDevices})
  }

  numCpuSet = numCpu => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.numCpu = numCpu
    this.setState({request: request})
  }

  numCoresPerSocketSet = numCoresPerSocket => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.numCoresPerSocket = numCoresPerSocket
    this.setState({request: request})
  }

  memoryMBSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.memoryMB = e.target.value
    this.setState({request: request})
  }

  networkDeviceTypeSet = (deviceType, networkDeviceId) => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let networkDevice = networkDevices.find( r => r.id === networkDeviceId )
    networkDevice.deviceType = deviceType
    this.setState({networkDevices: networkDevices})
  }

  networkSet = (networkMoId, networkDeviceId) => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let networkDevice = networkDevices.find( r => r.id === networkDeviceId )
    networkDevice.networkMoId = networkMoId
    this.setState({networkDevices: networkDevices})
  }

  customSpecSet = c => {
    let customSpecs = JSON.parse(JSON.stringify(this.state.customSpecs))
    let customSpec = customSpecs.find( r => r.name === c )
    let list = []
    customSpec.network.forEach((item, i) => {
      item.id = i
      list.push(item)
    });

    this.setState({customSpec: customSpec, addresses: list})
  }

  dns1Set = e => {
    let cs = JSON.parse(JSON.stringify(this.state.cs))
    cs.dns1 = e.target.value
    this.setState({cs: cs})
  }

  dns2Set = e => {
    let cs = JSON.parse(JSON.stringify(this.state.cs))
    cs.dns2 = e.target.value
    this.setState({cs: cs})
  }

  csHostnameSet = e => {
    let cs = JSON.parse(JSON.stringify(this.state.cs))
    cs.csHostname = e.target.value
    this.setState({cs: cs})
  }

  csDomainSet = e => {
    let cs = JSON.parse(JSON.stringify(this.state.cs))
    cs.csDomain = e.target.value
    this.setState({cs: cs})
  }

  dhcpSet = (dhcp, id) => {
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let address = addresses.find( r => r.id === id )
    address.dhcp = dhcp.target.checked
    this.setState({addresses: addresses})
  }

  ipSet = (ip, id) => {
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let address = addresses.find( r => r.id === id )
    address.ip = ip.target.value
    this.setState({addresses: addresses})
  }

  netMaskSet = (netMask, id) => {
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let address = addresses.find( r => r.id === id )
    address.netMask = netMask.target.value
    this.setState({addresses: addresses})
  }

  gwSet = (gw, id) => {
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let address = addresses.find( r => r.id === id )
    address.gw[0] = gw.target.value
    this.setState({addresses: addresses})
  }

  diskDeviceTypeSet = (deviceType, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )
    diskDevice.deviceType = deviceType
    this.setState({diskDevices: diskDevices})
  }

  datastoreSet = (datastoreMoId, event, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )

    if (event.children === 'MainDatastore') {
      let datastores = JSON.parse(JSON.stringify(this.state.datastores))
      let datastore = datastores.find( r => r.name === this.state.request.mainDatastore )
      diskDevice.datastoreMoId = datastore.moId
      diskDevice.name = event.children
    }
    else {
      diskDevice.datastoreMoId = datastoreMoId
      diskDevice.name = event.children
    }
    this.setState({diskDevices: diskDevices})
  }

  sizeMBSet = (size, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )

    if (diskDevice.existent) {
      if (size.target.value < diskDevice.originalSizeMB || isNaN(size.target.value || parseInt(size.target.value) < 1)) {
        diskDevice.sizeMBError = true
        diskDevice.sizeMBColor = 'red'
      }
      else {
        delete diskDevice.sizeMBError
        delete diskDevice.sizeMBColor
        diskDevice.sizeMB = parseInt(size.target.value)
      }
    }
    else {
      if (isNaN(size.target.value) || parseInt(size.target.value) < 1) {
        diskDevice.sizeMBError = true
        diskDevice.sizeMBColor = 'red'
      }
      else {
        delete diskDevice.sizeMBError
        delete diskDevice.sizeMBColor
        diskDevice.sizeMB = parseInt(size.target.value)
      }
    }

    this.setState({diskDevices: diskDevices})
  }

  notesSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.notes = e.target.value
    this.setState({request: request})
  }



  //select

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let cs = JSON.parse(JSON.stringify(this.state.cs))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let addresses = JSON.parse(JSON.stringify(this.state.addresses))
    let validators = new Validators()


    if (!request.vmName) {
      errors.vmNameError = true
      errors.vmNameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.vmNameError
      delete errors.vmNameColor
      this.setState({errors: errors})
    }

    if (!request.datacenter) {
      errors.datacenterError = true
      errors.datacenterColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.datacenterError
      delete errors.datacenterColor
      this.setState({errors: errors})
    }

    if (!request.bootstrapkey) {
      errors.bootstrapkeyError = true
      errors.bootstrapkeyColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.bootstrapkeyError
      delete errors.bootstrapkeyColor
      this.setState({errors: errors})
    }

    if (!request.finalpubkey) {
      errors.finalpubkeyError = true
      errors.finalpubkeyColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.finalpubkeyError
      delete errors.finalpubkeyColor
      this.setState({errors: errors})
    }

    if (!request.cluster) {
      errors.clusterError = true
      errors.clusterColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.clusterError
      delete errors.clusterColor
      this.setState({errors: errors})
    }

    if (!request.vmFolderMoId) {
      errors.vmFolderMoIdError = true
      errors.vmFolderMoIdColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.vmFolderMoIdError
      delete errors.vmFolderMoIdColor
      this.setState({errors: errors})
    }

    if (!request.numCpu) {
      errors.numCpuError = true
      errors.numCpuColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.numCpuError
      delete errors.numCpuColor
      this.setState({errors: errors})
    }

    if (!request.numCoresPerSocket) {
      errors.numCoresPerSocketError = true
      errors.numCoresPerSocketColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.numCoresPerSocketError
      delete errors.numCoresPerSocketColor
      this.setState({errors: errors})
    }

    if (!request.memoryMB || isNaN(request.memoryMB) || request.memoryMB < 100 || (request.memoryMB % 4 != 0)) {
      errors.memoryMBError = true
      errors.memoryMBColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.memoryMBError
      delete errors.memoryMBColor
      this.setState({errors: errors})
    }

    if (!request.notes) {
      errors.notesError = true
      errors.notesColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.notesError
      delete errors.notesColor
      this.setState({errors: errors})
    }

    if (!cs.csHostname) {
      errors.csHostnameError = true
      errors.csHostnameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.csHostnameError
      delete errors.csHostnameColor
      this.setState({errors: errors})
    }

    if (!cs.csDomain || !validators.fqdn(cs.csDomain)) {
      errors.csDomainError = true
      errors.csDomainColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.csDomainError
      delete errors.csDomainColor
      this.setState({errors: errors})
    }

    if (addresses.length > 0) {
      addresses.forEach((address, i) => {
        errors[address.id] = {}

        if (address.dhcp) {
          delete address.ipError
          delete address.ipColor
          delete errors[address.id].ipError
          delete errors[address.id].ipColor
          delete address.netMaskError
          delete address.netMaskColor
          delete errors[address.id].netMaskError
          delete errors[address.id].netMaskColor
          delete address.gwError
          delete address.gwColor
          delete errors[address.id].gwError
          delete errors[address.id].gwColor
          this.setState({errors: errors, addresses: addresses})
        }
        else {
          if (!address.ip || !validators.ipv4(address.ip)) {
            address.ipError = true
            address.ipColor = 'red'
            errors[address.id].ipError = true
            errors[address.id].ipColor = 'red'
            this.setState({errors: errors, addresses: addresses})
          }
          else {
            delete address.ipError
            delete address.ipColor
            delete errors[address.id].ipError
            delete errors[address.id].ipColor
            this.setState({errors: errors, addresses: addresses})
          }

          if (!address.netMask || !validators.ipv4(address.netMask)) {
            address.netMaskError = true
            address.netMaskColor = 'red'
            errors[address.id].netMaskError = true
            errors[address.id].netMaskColor = 'red'
            this.setState({errors: errors, addresses: addresses})
          }
          else {
            delete address.netMaskError
            delete address.netMaskColor
            delete errors[address.id].netMaskError
            delete errors[address.id].netMaskColor
            this.setState({errors: errors, addresses: addresses})
          }

          if (!address.gw || !validators.ipv4(address.gw)) {
            address.gwError = true
            address.gwColor = 'red'
            errors[address.id].gwError = true
            errors[address.id].gwColor = 'red'
            this.setState({errors: errors, addresses: addresses})
          }
          else {
            delete address.gwError
            delete address.gwColor
            delete errors[address.id].gwError
            delete errors[address.id].gwColor
            this.setState({errors: errors, addresses: addresses})
          }
        }



        if (Object.keys(errors[address.id]).length === 0) {
          delete errors[address.id]
          this.setState({errors: errors})
        }
      })
    }

    if (networkDevices.length > 0) {
      networkDevices.forEach((networkDevice, i) => {
        errors[networkDevice.id] = {}

        if (networkDevice.deviceType) {
          delete networkDevice.deviceTypeError
          delete networkDevice.deviceTypeColor
          delete errors[networkDevice.id].deviceTypeError
          delete errors[networkDevice.id].deviceTypeColor
          this.setState({errors: errors, networkDevices: networkDevices})
        }
        else {
          networkDevice.deviceTypeError = true
          networkDevice.deviceTypeColor = 'red'
          errors[networkDevice.id].deviceTypeError = true
          errors[networkDevice.id].deviceTypeColor = 'red'
          this.setState({errors: errors, networkDevices: networkDevices})
        }

        if (networkDevice.networkMoId) {
          delete networkDevice.networkMoIdError
          delete networkDevice.networkMoIdColor
          delete errors[networkDevice.id].networkMoIdError
          delete errors[networkDevice.id].networkMoIdColor
          this.setState({errors: errors, networkDevices: networkDevices})
        }
        else {
          networkDevice.networkMoIdError = true
          networkDevice.networkMoIdColor = 'red'
          errors[networkDevice.id].networkMoIdError = true
          errors[networkDevice.id].networkMoIdColor = 'red'
          this.setState({errors: errors, networkDevices: networkDevices})
        }

        if (Object.keys(errors[networkDevice.id]).length === 0) {
          delete errors[networkDevice.id]
          this.setState({errors: errors})
        }
      })
    }

    if (addresses.length !== networkDevices.length) {
      errors.addressesLengthError = true
      errors.addressesLengthColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.addressesLengthError
      delete errors.addressesLengthColor
      this.setState({errors: errors})
    }

    if (!request.datacenter) {
      errors.datacenterError = true
      errors.datacenterColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.datacenterError
      delete errors.datacenterColor
      this.setState({errors: errors})
    }

    if (diskDevices.length > 0) {
      diskDevices.forEach((diskDevice, i) => {
        errors[diskDevice.id] = {}

        if (diskDevice.deviceType) {
          delete diskDevice.deviceTypeError
          delete diskDevice.deviceTypeColor
          delete errors[diskDevice.id].deviceTypeError
          delete errors[diskDevice.id].deviceTypeColor
          this.setState({errors: errors, diskDevices: diskDevices})
        }
        else {
          diskDevice.deviceTypeError = true
          diskDevice.deviceTypeColor = 'red'
          errors[diskDevice.id].deviceTypeError = true
          errors[diskDevice.id].deviceTypeColor = 'red'
          this.setState({errors: errors, diskDevices: diskDevices})
        }

        if (diskDevice.datastoreMoId) {
          delete diskDevice.datastoreMoIdError
          delete diskDevice.datastoreMoIdColor
          delete errors[diskDevice.id].datastoreMoIdError
          delete errors[diskDevice.id].datastoreMoIdColor
          this.setState({errors: errors, diskDevices: diskDevices})
        }
        else {
          diskDevice.datastoreMoIdError = true
          diskDevice.datastoreMoIdColor = 'red'
          errors[diskDevice.id].datastoreMoIdError = true
          errors[diskDevice.id].datastoreMoIdColor = 'red'
          this.setState({errors: errors, diskDevices: diskDevices})
        }

        if (!diskDevice.sizeMB || isNaN(diskDevice.sizeMB)) {
          diskDevice.sizeMBError = true
          diskDevice.sizeMBColor = 'red'
          errors[diskDevice.id].sizeMBError = true
          errors[diskDevice.id].sizeMBColor = 'red'
          this.setState({errors: errors, diskDevices: diskDevices})
        }
        else {
          delete diskDevice.sizeMBError
          delete diskDevice.sizeMBColor
          delete errors[diskDevice.id].sizeMBError
          delete errors[diskDevice.id].sizeMBColor
          this.setState({errors: errors, diskDevices: diskDevices})
        }

        if (Object.keys(errors[diskDevice.id]).length === 0) {
          delete errors[diskDevice.id]
          this.setState({errors: errors})
        }
      })
    }

    if (!request.mainDatastore) {
      errors.mainDatastoreError = true
      errors.mainDatastoreColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.mainDatastoreError
      delete errors.mainDatastoreColor
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let validators = new Validators()
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.vmCreateHandler()
    }
  }


  customSpecAdd = async () => {

    let cs = JSON.parse(JSON.stringify(this.state.cs))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    let r
    let b = {}
    b.data = {
      "network": this.state.addresses,
      "hostName": `${this.state.cs.csHostname}`,
      "domainName": `${this.state.cs.csDomain}`,
    }

    if (cs.dns1) {
      if (!validators.ipv4(cs.dns1)) {
        errors.dns1Error = true
        errors.dns1Color = 'red'
        this.setState({errors: errors})
      }
      else {
        delete errors.dns1Error
        delete errors.dns1Color
        this.setState({errors: errors})
        b.data.dns1 = `${this.state.cs.dns1}`
      }
    }

    if (cs.dns2) {
      if (!validators.ipv4(cs.dns2)) {
        errors.dns2Error = true
        errors.dns2Color = 'red'
        this.setState({errors: errors})
      }
      else {
        delete errors.dns2Error
        delete errors.dns2Color
        this.setState({errors: errors})
        b.data.dns2 = `${this.state.cs.dns2}`
      }
    }


    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`vmware/${this.props.asset.id}/customSpec/${this.state.customSpec.name}/`, this.props.token, b)
    return r
  }

  VmCreate = async b => {
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
    await rest.doXHR(`vmware/${this.props.asset.id}/template/${this.state.request.templateMoId}/`, this.props.token, b )
    return r
  }

  //DISPOSAL ACTION
  vmCreateHandler = async () => {
    let csNew

    this.setState({customSpecLoading: true})
    let csAdd = await this.customSpecAdd()
    this.setState({customSpecLoading: false})
    if (csAdd.status && csAdd.status !== 201 ) {
      this.setState({loading: false})
      this.props.dispatch(customSpecError(csAdd))
      return
    }
    else {
      csNew = csAdd.data.newSpecName
    }

    let networkDevices = {existent: [], new: []}
    let diskDevices = {existent: [], new: []}

    this.state.networkDevices.forEach((nic, i) => {
      if (nic.existent) {
        delete nic.existent
        delete nic.id
        networkDevices.existent.push(nic)
      }
      else {
        delete nic.existent
        delete nic.id
        networkDevices.new.push(nic)
      }
    })

    this.state.diskDevices.forEach((disk, i) => {
      if (disk.existent) {
        delete disk.existent
        delete disk.id
        diskDevices.existent.push(disk)
      }
      else {
        delete disk.existent
        delete disk.id
        diskDevices.new.push(disk)
      }
    })



    let b = {}
    b.data = {
        "vmName": this.state.request.vmName,
        "datacenterMoId": this.state.request.datacenterMoId,
        "clusterMoId": this.state.request.clusterMoId,
        "vmFolderMoId": this.state.request.vmFolderMoId,
        "mainDatastoreMoId": this.state.request.mainDatastoreMoId,
        "powerOn": true,
        "numCpu": this.state.request.numCpu,
        "numCoresPerSocket": this.state.request.numCoresPerSocket,
        "memoryMB": parseInt(this.state.request.memoryMB),
        "notes": this.state.request.notes,
        "networkDevices": networkDevices,
        "diskDevices": diskDevices,
        "guestSpec": csNew,
        "deleteGuestSpecAfterDeploy": true,
        "bootstrapKeyId": this.state.request.bootstrapkey,
        "postDeployCommands": [
            {
                "command": "waitPowerOn",
                "user_args": {}
            },
            {
                "command": "resizeLastPartition",
                "user_args": {
                    "__diskDevice": "sda"
                }
            },
            {
                "command": "renameVg",
                "user_args": {
                    "__vgName": `vg_${this.state.request.csHostname}`
                }
            },
            {
                "command": "reboot",
                "user_args": {}
            },
            {
                "command": "addMountPoint",
                "user_args": {
                    "__vgName": `vg_${this.state.request.csHostname}`,
                    "__lvName": "var",
                    "__lvSize": 2,
                    "__filesystem": "ext4",
                    "__mountFolder": "/var"
                }
            },
            {
                "command": "reboot",
                "user_args": {}
            },
            {
                "command": "addPubKey",
                "user_args": {
                    "__pubKeyId": this.state.request.finalpubkey
                }
            },
                        {
                "command": "removeBootstrapKey",
                "user_args": {}
            }
        ]
    }

    if (this.state.request.host) {
      b.hostMoId = this.state.request.hostMoId
    }

    this.setState({loading: true})
    let vmC = await this.VmCreate(b)
    this.setState({loading: false})
    if (vmC.status && vmC.status !== 202 ) {
      this.setState({loading: false, response: false})
      this.props.dispatch(vmCreateError(vmC))
    }
    else {
      this.setState({loading: false, response: true})
      this.response()
    }

  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {

    this.setState({
      visible: false,
      response: false,
      request: {},
      errors: {}
    })
  }


  render() {
    //console.log(this.state)

    let networkNameMoid = obj => {
      if (this.state.networks) {
        let n = this.state.networks.find(e => e.moId === obj.networkMoId)
        if (n && n.name) {
          return(n.name)
        }
      }
    }

    let datastoreNameMoid = obj => {
      if (this.state.datastoresPlus && this.state.datastoresPlus.length > 1) {
        let n = this.state.datastoresPlus.find(e => e.moId === obj.datastoreMoId)
        if (n && n.name) {
          return(n.name)
        }
      }
      else {
        let n = this.state.datastores.find(e => e.moId === obj.datastoreMoId)
        if (n && n.name) {
          return(n.name)
        }
      }
    }


    const networkDeviceCol = [
      {
        title: 'Label',
        align: 'center',
        dataIndex: 'label',
        key: 'label',
        name: 'label',
        description: '',
      },
      {
        title: 'Network Port Group',
        align: 'center',
        dataIndex: 'networkMoId',
        key: 'network',
        name: 'network',
        render: (name, obj)  => (
          <React.Fragment>
            {this.state.networksLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
            :
              <React.Fragment>
                {obj.networkMoIdError ?
                  <Select
                    defaultValue={() => networkNameMoid(obj)}
                    key={obj.id}
                    style={{ width: '100%' , border: `1px solid ${obj.networkMoIdColor}` }}
                    onChange={e => this.networkSet(e, obj.id)}>
                    { this.state.networks?
                      this.state.networks.map((n, i) => {
                      return (
                        <Select.Option key={i} value={n.moId}>{n.name}</Select.Option>
                        )
                      })
                    :
                      null
                    }
                  </Select>
                :
                  <React.Fragment>
                  { this.state.networks ?
                    <Select
                      defaultValue={() => networkNameMoid(obj)}
                      key={obj.id}
                      style={{ width: '100%' }}
                      onChange={e => this.networkSet(e, obj.id)}>
                      {this.state.networks.map((n, i) => {
                        return (
                          <Select.Option key={i} value={n.moId}>{n.name}</Select.Option>
                          )
                        })
                      }
                    </Select>
                  :
                    <Select disabled style={{ width: '100%'}}></Select>
                  }
                  </React.Fragment>
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Device Type',
        align: 'center',
        dataIndex: 'deviceType',
        key: 'deviceType',
        name: 'deviceType',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.deviceTypeError ?
              <Select
                defaultValue={obj.deviceType}
                key={obj.id}
                style={{ width: '100%', border: `1px solid ${obj.deviceTypeColor}` }}
                onChange={e => this.networkDeviceTypeSet(e, obj.id)}>
                { this.state.networkDeviceTypes.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                }
              </Select>
            :
              <Select
                defaultValue={obj.deviceType}
                key={obj.id}
                style={{ width: '100%' }}
                onChange={e => this.networkDeviceTypeSet(e, obj.id)}>
                { this.state.networkDeviceTypes.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                }
              </Select>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'networkDeviceRemove',
        key: 'networkDeviceRemove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.networkDeviceRemove(obj)}>
            -
          </Button>
        ),
      },
    ]

    const diskDeviceCol = [
      {
        title: 'Label',
        align: 'center',
        dataIndex: 'label',
        key: 'label',
        name: 'label',
        description: '',
      },
      {
        title: 'Datastore',
        align: 'center',
        dataIndex: 'datastoreMoId',
        key: 'datastore',
        name: 'datastore',
        render: (name, obj)  => (
          <React.Fragment>
            {this.state.datastoresLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
            :
              <React.Fragment>
                {obj.datastoreMoIdError ?
                  <Select
                    key={obj.id}
                    style={{ width: '100%' , border: `1px solid ${obj.datastoreMoIdColor}` }}
                    onChange={(id, event) => this.datastoreSet(id, event, obj.id)}>
                    { this.state.datastores ?
                      <React.Fragment>
                        { this.state.request.mainDatastore ?
                          <Select.Option value={'MainDatastore'}>MainDatastore</Select.Option>
                        :
                          null
                        }
                        {this.state.datastores.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n.moId}>{n.name}</Select.Option>
                            )
                          })}
                      </React.Fragment>
                    :
                      null
                    }
                  </Select>
                :
                  <React.Fragment>
                  { this.state.datastores ?
                    <Select
                      key={obj.id}
                      style={{ width: '100%' }}
                      onChange={(id, event) => this.datastoreSet(id, event, obj.id)}>
                      { this.state.datastores ?
                        <React.Fragment>
                          { this.state.request.mainDatastore ?
                            <Select.Option value={'MainDatastore'}>MainDatastore</Select.Option>
                          :
                            null
                          }
                          {this.state.datastores.map((n, i) => {
                            return (
                              <Select.Option key={i} value={n.moId}>{n.name}</Select.Option>
                              )
                          })}
                        </React.Fragment>
                      :
                        null
                      }
                    </Select>
                  :
                    <Select disabled style={{ width: '100%'}}></Select>
                  }
                  </React.Fragment>
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Device Type',
        align: 'center',
        dataIndex: 'deviceType',
        key: 'deviceType',
        name: 'deviceType',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.deviceTypeError ?
              <Select
                defaultValue={obj.deviceType}
                key={obj.id}
                style={{ width: '100%', border: `1px solid ${obj.deviceTypeColor}` }}
                onChange={e => this.diskDeviceTypeSet(e, obj.id)}>
                { this.state.diskDeviceTypes.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                }
              </Select>
            :
              <Select
                defaultValue={obj.deviceType}
                key={obj.id}
                style={{ width: '100%' }}
                onChange={e => this.diskDeviceTypeSet(e, obj.id)}>
                { this.state.diskDeviceTypes.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                }
              </Select>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Size (MB)',
        align: 'center',
        dataIndex: 'sizeMB',
        width: 100,
        key: 'sizeMB',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.sizeMBError ?
              <Input
                defaultValue={obj.sizeMB}
                style={{borderColor: obj.sizeMBColor}}
                onChange={e => this.sizeMBSet(e, obj.id)}
              />
            :
              <Input
                defaultValue={obj.sizeMB}
                onChange={e => this.sizeMBSet(e, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'diskDeviceRemove',
        key: 'diskDeviceRemove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.diskDeviceRemove(obj)}>
            -
          </Button>
        ),
      },
    ]

    const addressCol = [
      {
        title: 'DHCP',
        align: 'center',
        dataIndex: 'dhcp',
        key: 'dhcp',
        render: (name, obj)  => (
          <Checkbox
            checked={obj.dhcp}
            onChange={e => this.dhcpSet(e, obj.id)}
          />
        )
      },
      {
        title: 'IP',
        align: 'center',
        dataIndex: 'ip',
        key: 'ip',
        render: (name, obj)  => (
          <React.Fragment>
            { obj.dhcp ?
              <Input disabled />
            :
              <React.Fragment>
                {obj.ipError ?
                  <Input
                    defaultValue={obj.ip}
                    style={{borderColor: obj.ipColor}}
                    onChange={e => this.ipSet(e, obj.id)}
                  />
                :
                  <Input
                    defaultValue={obj.ip}
                    onChange={e => this.ipSet(e, obj.id)}
                  />
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Subnet Mask',
        align: 'center',
        dataIndex: 'netMask',
        key: 'netMask',
        name: 'netMask',
        render: (name, obj)  => (
          <React.Fragment>
            { obj.dhcp ?
              <Input disabled />
            :
              <React.Fragment>
                {obj.netMaskError ?
                  <React.Fragment>
                    <Input
                      defaultValue={obj.netMask}
                      style={{borderColor: obj.netMaskColor}}
                      onChange={e => this.netMaskSet(e, obj.id)}
                    />
                  </React.Fragment>
                :
                  <Input
                    id='netMask'
                    key={obj.id}
                    defaultValue={obj.netMask}
                    onChange={e => this.netMaskSet(e, obj.id)}
                  />
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Gateway',
        align: 'center',
        dataIndex: 'gw',
        key: 'gw',
        name: 'gw',
        render: (name, obj)  => (
          <React.Fragment>
            { obj.dhcp ?
              <Input disabled />
            :
              <React.Fragment>
                {obj.gwError ?
                  <React.Fragment>
                    <Input
                      defaultValue={obj.gw[0]}
                      style={{borderColor: obj.gwColor}}
                      onChange={e => this.gwSet(e, obj.id)}
                    />
                  </React.Fragment>
                :
                  <Input
                    defaultValue={obj.gw}
                    onChange={e => this.gwSet(e, obj.id)}
                  />
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'addressRemove',
        key: 'addressRemove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.addressRemove(obj)}>
            -
          </Button>
        ),
      },
    ]

    let randomKey = () => {
      return Math.random().toString()
    }

    let jsonPretty = () => {
      return JSON.stringify(this.state.json, null, 2)
    }

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>VM CREATE</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>VM CREATE</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          bodyStyle={{height: '80vh', overflowY: 'scroll'}}
        >

          <AssetSelector />

          <Divider/>

          { (this.props.asset && this.props.asset.id) ?
            <React.Fragment>
              { (this.state.loading || this.state.customSpecLoading) && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Service Created"
                 />
              }
              { !this.state.loading && !this.state.response &&
                <React.Fragment>


                <Row>
                  <Col offset={5} span={12}>
                  { !this.state.jsonEnabled ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                    { this.state.errors.jsonError ?
                      <Collapse>
                        <Panel header="Paste your JSON here (optional)" key="1">
                          <React.Fragment>
                            <p style={{color: 'red'}}>{this.state.errors.jsonError}</p>
                            <Input.TextArea
                              defaultValue={jsonPretty()}

                              style={{width: '100%'}}
                              rows={50}
                              onBlur={e => this.jsonValidate(e)}
                            />
                          </React.Fragment>
                        </Panel>
                      </Collapse>
                    :
                      <Collapse disabled>
                        <Panel header="Paste your JSON here (optional)" key="1">
                          <Input.TextArea
                            defaultValue={jsonPretty()}

                            style={{width: '100%'}}
                            rows={50}
                            onBlur={e => this.jsonValidate(e)}
                          />
                        </Panel>
                      </Collapse>
                    }
                    </React.Fragment>
                  }

                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Vm Name:</p>
                  </Col>
                  <Col span={4}>
                    {this.state.errors.vmNameError ?
                      <Input
                        style={{width: '100%', borderColor: this.state.errors.vmNameColor}}
                        value={this.state.request.vmName}
                        onChange={e => this.vmNameSet(e)}
                      />
                    :
                      <Input
                        style={{width: '100%'}}
                        defaultValue={this.state.request.vmName}
                        value={this.state.request.vmName}
                        onChange={e => this.vmNameSet(e)}
                      />
                    }
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenter:</p>
                  </Col>
                  <Col span={2}>
                    { this.state.datacentersLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.datacenters && this.state.datacenters.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.datacenterError ?
                            <Select
                              defaultValue={this.state.request.datacenter}
                              value={this.state.request.datacenter}
                              showSearch
                              style={{width: '100%', border: `1px solid ${this.state.errors.datacenterColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.datacenterSet(n)}
                            >
                              <React.Fragment>
                                {this.state.datacenters.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              defaultValue={this.state.request.datacenter}
                              value={this.state.request.datacenter}
                              showSearch
                              style={{width: '100%'}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.datacenterSet(n)}
                            >
                              <React.Fragment>
                                {this.state.datacenters.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          }
                        </React.Fragment>
                      :
                        null
                      }
                    </React.Fragment>
                    }
                  </Col>
                  <Col offset={1} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Cluster:</p>
                  </Col>
                  { this.state.clustersLoading ?
                    <Col span={2}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={2}>
                      { this.state.clusters ?
                        <React.Fragment>
                          { this.state.clusters && this.state.clusters.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.clusterError ?
                                <Select
                                  defaultValue={this.state.request.cluster}
                                  value={this.state.request.cluster}
                                  showSearch
                                  style={{width: '100%', border: `1px solid ${this.state.errors.clusterColor}`}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.clusterSet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.clusters.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              :
                                <Select
                                  defaultValue={this.state.request.cluster}
                                  value={this.state.request.cluster}
                                  showSearch
                                  style={{width: '100%'}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.clusterSet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.clusters.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              }
                            </React.Fragment>
                          :
                            null
                          }
                        </React.Fragment>
                      :
                        <Select
                          style={{width: '100%'}}
                          disabled
                        />
                      }
                    </Col>
                  }
                  <Col offset={1} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Host:</p>
                  </Col>
                  { this.state.hostsLoading ?
                    <Col span={2}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={2}>
                      { this.state.hosts && this.state.hosts.length > 0 ?
                        <Select
                          defaultValue={this.state.request.host}
                          value={this.state.request.host}
                          showSearch
                          style={{width: '100%'}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onSelect={n => this.hostSet(n)}
                        >
                          <React.Fragment>
                            {this.state.hosts.map((n, i) => {
                              return (
                                <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                              )
                            })
                            }
                          </React.Fragment>
                        </Select>
                      :
                        <Select
                          style={{width: '100%'}}
                          disabled
                        />
                      }
                    </Col>
                  }
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Folder:</p>
                  </Col>
                  { this.state.foldersLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={12}>
                      { this.state.folders ?
                        <React.Fragment>
                          {this.state.errors.vmFolderMoIdError ?
                            <Tree
                              showLine
                              style={{color: this.state.errors.vmFolderMoIdColor}}
                              onSelect={this.folderSet}
                              treeData={this.state.folders}
                            />
                          :
                            <Tree
                              showLine
                              onSelect={this.folderSet}
                              treeData={this.state.folders}
                            />
                          }
                        </React.Fragment>
                      :
                        null
                      }
                    </Col>
                  }
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Template:</p>
                  </Col>
                  { this.state.templatesLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={12}>
                      { this.state.templates ?
                        <React.Fragment>
                          { this.state.templates && this.state.templates.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.templateError ?
                                <Select
                                  defaultValue={this.state.request.template}
                                  value={this.state.request.template}
                                  showSearch
                                  style={{width: '100%', border: `1px solid ${this.state.errors.templateColor}`}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.templateSet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.templates.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              :
                                <Select
                                  defaultValue={this.state.request.template}
                                  value={this.state.request.template}
                                  showSearch
                                  style={{width: '100%'}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.templateSet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.templates.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              }
                            </React.Fragment>
                          :
                            null
                          }
                        </React.Fragment>
                      :
                        <Select
                          defaultValue={this.state.request.template}
                          value={this.state.request.template}
                          showSearch
                          style={{width: '100%'}}
                          optionFilterProp="children"
                          disabled
                        />
                      }
                    </Col>
                  }
                  <Col offset={1} span={4}>
                    <Button type="primary" shape='round' onClick={() => this.templatesFetch()} >
                      Refresh
                    </Button>
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>CPUs:</p>
                  </Col>
                  <Col span={2}>
                    {this.state.errors.numCpuError ?
                    <Select
                      defaultValue={this.state.request.numCpu}
                      value={this.state.request.numCpu}
                      style={{width: '100%', border: `1px solid ${this.state.errors.numCpuColor}`}}
                      onSelect={n => this.numCpuSet(n)}
                    >
                      <React.Fragment>
                        {this.state.numCpus.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  :
                    <Select
                      defaultValue={this.state.request.numCpu}
                      value={this.state.request.numCpu}
                      style={{width: '100%'}}
                      onSelect={n => this.numCpuSet(n)}
                    >
                      <React.Fragment>
                        {this.state.numCpus.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  }
                  </Col>
                  <Col offset={1} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Cores/Socket:</p>
                  </Col>
                  <Col span={2}>
                    {this.state.errors.numCoresPerSocketError ?
                    <Select
                      value={this.state.request.numCoresPerSocket}
                      style={{width: '100%', border: `1px solid ${this.state.errors.numCoresPerSocketColor}`}}
                      onSelect={n => this.numCoresPerSocketSet(n)}
                    >
                      <React.Fragment>
                        {this.state.numCoresPerSockets.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  :
                    <Select
                      value={this.state.request.numCoresPerSocket}
                      style={{width: '100%'}}
                      onSelect={n => this.numCoresPerSocketSet(n)}
                    >
                      <React.Fragment>
                        {this.state.numCoresPerSockets.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  }
                  </Col>
                  <Col offset={1} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Memory (MB):</p>
                  </Col>
                  <Col span={2}>
                    {this.state.errors.memoryMBError ?
                      <Input style={{width: '100%', borderColor: this.state.errors.memoryMBColor}} name="memoryMB" id='memoryMB' onChange={e => this.memoryMBSet(e)} />
                    :
                      <Input value={this.state.request.memoryMB} defaultValue={this.state.request.memoryMB} style={{width: '100%'}} name="memoryMB" id='memoryMB' onChange={e => this.memoryMBSet(e)} />
                    }
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Network Devices:</p>
                  </Col>
                  {this.state.networkDevicesLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={12}>
                      {(this.state.networkDevices  && this.state.networkDevices.length > 0) ?
                        <React.Fragment>
                          <Button type="primary" onClick={() => this.networkDeviceAdd()}>
                            +
                          </Button>
                          <br/>
                          <br/>
                          <Table
                            columns={networkDeviceCol}
                            dataSource={this.state.networkDevices}
                            bordered
                            rowKey='id'
                            scroll={{x: 'auto'}}
                            pagination={false}
                            style={{marginBottom: 10}}
                          />
                        </React.Fragment>
                      :
                        null
                      }
                    </Col>
                  }

                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>GuestSpec:</p>
                  </Col>
                  {this.state.customSpecsLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                  <Col span={12}>
                    { this.state.customSpecs && this.state.customSpecs.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.customSpecError ?
                          <Select
                            value={this.state.customSpec ? this.state.customSpec.name : null }
                            showSearch
                            style={{width: '100%', border: `1px solid ${this.state.errors.customSpecColor}`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.customSpecSet(n)}
                          >
                            <React.Fragment>
                              {this.state.customSpecs.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.customSpec ? this.state.customSpec.name : null }
                            showSearch
                            style={{width: '100%'}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.customSpecSet(n)}
                          >
                            <React.Fragment>
                              {this.state.customSpecs.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        }
                      </React.Fragment>
                    :
                      <Select
                        style={{width: '100%'}}
                        disabled
                      />
                    }
                  </Col>
                  }

                </Row>
                <br/>

                { this.state.customSpec ?
                  <React.Fragment>
                  <Row>
                    <Col offset={4} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Hostname:</p>
                    </Col>
                    <Col span={4}>
                      {this.state.errors.csHostnameError ?
                        <Input style={{width: '100%', borderColor: this.state.errors.csHostnameColor}} name="csHostname" id='csHostname' onChange={e => this.csHostnameSet(e)} />
                      :
                        <Input style={{width: '100%'}} defaultValue={this.state.request.csHostname} name="csHostname" id='csHostname' onChange={e => this.csHostnameSet(e)} />
                      }
                    </Col>

                    <Col offset={1} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Domain Name:</p>
                    </Col>
                    <Col span={4}>
                      {this.state.errors.csDomainError ?
                        <Input style={{width: '100%', borderColor: this.state.errors.csDomainColor}} name="csDomain" id='csDomain' onChange={e => this.csDomainSet(e)} />
                      :
                        <Input style={{width: '100%'}} defaultValue={this.state.request.csDomain} name="csDomain" id='csDomain' onChange={e => this.csDomainSet(e)} />
                      }
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={4} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>DNS 1:</p>
                    </Col>
                    <Col span={4}>
                      {this.state.errors.dns1Error ?
                        <Input style={{width: '100%', borderColor: this.state.errors.dns1Color}} name="dns1" id='dns1' onChange={e => this.dns1Set(e)} />
                      :
                        <Input style={{width: '100%'}} defaultValue={this.state.request.dns1} name="dns1" id='dns1' onChange={e => this.dns1Set(e)} />
                      }
                    </Col>

                    <Col offset={1} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>DNS 2:</p>
                    </Col>
                    <Col span={4}>
                      {this.state.errors.dns2Error ?
                        <Input style={{width: '100%', borderColor: this.state.errors.dns2Color}} name="dns2" id='dns2' onChange={e => this.dns2Set(e)} />
                      :
                        <Input style={{width: '100%'}} defaultValue={this.state.request.dns2} name="dns2" id='dns2' onChange={e => this.dns2Set(e)} />
                      }
                    </Col>
                  </Row>
                  <br/>



                  <Row>
                    <Col offset={4} span={2}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'left'}}>Addresses:</p>
                    </Col>
                    <Col span={11}>
                      {(this.state.addresses  && this.state.addresses.length > 0) ?
                        <React.Fragment>
                          <Button type="primary" onClick={() => this.addressAdd()}>
                            +
                          </Button>
                          { this.state.errors.addressesLengthError ?
                            <p style={{marginRight: 10, marginTop: 5, float: 'right', color: this.state.errors.addressesLengthColor}}>
                              Addresses' lenght is different from network devices' lenght:
                            </p>
                          :
                            null
                          }
                          <br/>
                          <br/>
                          <Table
                            columns={addressCol}
                            dataSource={this.state.addresses}
                            bordered
                            rowKey='id'
                            scroll={{x: 'auto'}}
                            pagination={false}
                            style={{marginBottom: 10}}
                          />
                        </React.Fragment>
                      :
                        null
                      }
                    </Col>
                  </Row>
                  <br/>

                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Main Datastore:</p>
                  </Col>
                  {this.state.datastoresLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                    :
                    <Col span={12}>
                      { this.state.datastores && this.state.datastores.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.mainDatastoreError ?
                            <Select
                              defaultValue={this.state.request.mainDatastore}
                              value={this.state.request.mainDatastore}
                              showSearch
                              style={{width: '100%', border: `1px solid ${this.state.errors.mainDatastoreColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.mainDatastoreSet(n)}
                            >
                              <React.Fragment>
                                {this.state.datastores.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              defaultValue={this.state.request.mainDatastore}
                              value={this.state.request.mainDatastore}
                              showSearch
                              style={{width: '100%'}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.mainDatastoreSet(n)}
                            >
                              <React.Fragment>
                                {this.state.datastores.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={[n.name, n.moId]}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          }
                        </React.Fragment>
                      :
                        <Select
                          style={{width: '100%'}}
                          disabled
                        />
                      }
                    </Col>
                  }

                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Disk Devices:</p>
                  </Col>
                  {this.state.diskDevicesLoading ?
                    <Col span={12}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={12}>
                      {(this.state.diskDevices  && this.state.diskDevices.length > 0) ?
                        <React.Fragment>
                          <Button type="primary" onClick={() => this.diskDeviceAdd()}>
                            +
                          </Button>
                          <br/>
                          <br/>
                          <Table
                            columns={diskDeviceCol}
                            dataSource={this.state.diskDevices}
                            bordered
                            rowKey='id'
                            scroll={{x: 'auto'}}
                            pagination={false}
                            style={{marginBottom: 10}}
                          />
                        </React.Fragment>
                      :
                        null
                      }
                    </Col>
                  }

                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Bootstrap Keys:</p>
                  </Col>
                  <Col span={4}>
                    { this.state.bootstrapkeysLoading ?
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    :
                    <React.Fragment>
                      { this.state.bootstrapkeys && this.state.bootstrapkeys.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.bootstrapkeyError ?
                            <Select
                              defaultValue={this.state.request.bootstrapkey}
                              value={this.state.request.bootstrapkey}
                              showSearch
                              style={{width: '100%', border: `1px solid ${this.state.errors.bootstrapkeyColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.bootstrapkeySet(n)}
                            >
                              <React.Fragment>
                                {this.state.bootstrapkeys.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.id}>{n.comment}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              defaultValue={this.state.request.bootstrapkey}
                              value={this.state.request.bootstrapkey}
                              showSearch
                              style={{width: '100%'}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.bootstrapkeySet(n)}
                            >
                              <React.Fragment>
                                {this.state.bootstrapkeys.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.id}>{n.comment}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          }
                        </React.Fragment>
                      :
                      <Select
                        style={{width: '100%'}}
                        disabled
                      />
                      }
                    </React.Fragment>
                    }
                  </Col>

                  <Col offset={2} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Final Pub Keys:</p>
                  </Col>
                  { this.state.finalpubkeysLoading ?
                    <Col span={4}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={4}>
                      { this.state.finalpubkeys ?
                        <React.Fragment>
                          { this.state.finalpubkeys && this.state.finalpubkeys.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.finalpubkeyError ?
                                <Select
                                  defaultValue={this.state.request.finalpubkey}
                                  value={this.state.request.finalpubkey}
                                  showSearch
                                  style={{width: '100%', border: `1px solid ${this.state.errors.finalpubkeyColor}`}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.finalpubkeySet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.finalpubkeys.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={n.id}>{n.comment}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              :
                                <Select
                                  defaultValue={this.state.request.finalpubkey}
                                  value={this.state.request.finalpubkey}
                                  showSearch
                                  style={{width: '100%'}}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                  }
                                  onSelect={n => this.finalpubkeySet(n)}
                                >
                                  <React.Fragment>
                                    {this.state.finalpubkeys.map((n, i) => {
                                      return (
                                        <Select.Option key={i} value={n.id}>{n.comment}</Select.Option>
                                      )
                                    })
                                    }
                                  </React.Fragment>
                                </Select>
                              }
                            </React.Fragment>
                          :
                            null
                          }
                        </React.Fragment>
                      :
                        <Select
                          style={{width: '100%'}}
                          disabled
                        />
                      }
                    </Col>
                  }
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Notes:</p>
                  </Col>
                  <Col span={12}>
                    {this.state.errors.notesError ?
                      <Input.TextArea
                        value={this.state.request.notes}
                        style={{width: '100%', borderColor: this.state.errors.notesColor}}
                        onChange={e => this.notesSet(e)}
                      />
                    :
                      <Input.TextArea
                        defaultValue={this.state.request.notes}
                        value={this.state.request.notes}
                        style={{width: '100%'}}
                        onChange={e => this.notesSet(e)}
                      />
                    }
                  </Col>
                </Row>
                <br/>



                <Row>
                  <Col offset={9} span={2}>
                    <Button type="primary" shape='round' onClick={() => this.validation()} >
                      Create Virtual machine
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

            }

            </React.Fragment>
            :
            <Alert message="vCenter not set" type="error" />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.datacentersError ? <Error component={'create vm'} error={[this.props.datacentersError]} visible={true} type={'datacentersError'} /> : null }
            { this.props.clustersError ? <Error component={'create vm'} error={[this.props.clustersError]} visible={true} type={'clustersError'} /> : null }
            { this.props.clusterError ? <Error component={'create vm'} error={[this.props.clusterError]} visible={true} type={'clusterError'} /> : null }
            { this.props.foldersError ? <Error component={'create vm'} error={[this.props.foldersError]} visible={true} type={'foldersError'} /> : null }
            { this.props.templatesError ? <Error component={'create vm'} error={[this.props.templatesError]} visible={true} type={'templatesError'} /> : null }
            { this.props.templateError ? <Error component={'create vm'} error={[this.props.templateError]} visible={true} type={'templateError'} /> : null }
            { this.props.customSpecsError ? <Error component={'create vm'} error={[this.props.customSpecsError]} visible={true} type={'customSpecsError'} /> : null }
            { this.props.customSpecError ? <Error component={'create vm'} error={[this.props.customSpecError]} visible={true} type={'customSpecError'} /> : null }
            { this.props.bootstrapkeysError ? <Error component={'create vm'} error={[this.props.bootstrapkeysError]} visible={true} type={'bootstrapkeysError'} /> : null }
            { this.props.finalpubkeysError ? <Error component={'create vm'} error={[this.props.finalpubkeysError]} visible={true} type={'finalpubkeysError'} /> : null }
            { this.props.vmCreateError ? <Error component={'create vm'} error={[this.props.vmCreateError]} visible={true} type={'vmCreateError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.vmware,

  asset: state.vmware.asset,
  datacentersError: state.vmware.datacentersError,
  clustersError: state.vmware.clustersError,
  clusterError: state.vmware.clusterError,
  foldersError: state.vmware.foldersError,
  templatesError: state.vmware.templatesError,
  templateError: state.vmware.templateError,
  customSpecsError: state.vmware.customSpecsError,
  customSpecError: state.vmware.customSpecError,
  bootstrapkeysError: state.vmware.bootstrapkeysError,
  finalpubkeysError: state.vmware.finalpubkeysError,
  vmCreateError: state.vmware.vmCreateError,
}))(CreateVmService);
