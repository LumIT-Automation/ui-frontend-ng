import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Table, Tree } from 'antd'
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
  templateError
} from '../store'

import AssetSelector from '../../vmware/assetSelector'

const { TextArea } = Input;
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
      errors: {},
      request: {}
    };
    this.baseState = this.state
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if ( this.props.asset && (prevProps.asset !== this.props.asset) ) {
        this.main()
      }
      if (this.state.request.datacenterMoId && (prevState.request.datacenterMoId !== this.state.request.datacenterMoId)) {
        this.clustersFetch()
      }
      if (this.state.request.clusterMoId && (prevState.request.clusterMoId !== this.state.request.clusterMoId)) {
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
      console.log(foldersFetched)
      /*
      let string = JSON.stringify(foldersFetched.data.items[0].folders)

      let changed = await this.changeFold(string)
      console.log(changed)
      let changed2 = await this.changeTit(changed)
      console.log(changed2)
      let changed3 = await this.changeK(changed2)
      console.log(changed3)
*/
      this.setState({folders: foldersFetched.data.items[0].children})
    }
  }
/*
  changeFold = async string => {
    let ne = string.replaceAll("folders", "children")
    return ne
  }

  changeTit = async string => {
    let ne = string.replaceAll("name", "title")
    return ne
  }

  changeK = async string => {
    let ne = string.replaceAll("moId", "key")
    return ne
  }
*/

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
    await this.setState({networksLoading: true, datastoresLoading: true})
    let clusterFetched = await this.clusterGet()
    if (clusterFetched.status && clusterFetched.status !== 200 ) {
      this.setState({networksLoading: false, datastoresLoading: false})
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
      this.setState({cluster: clusterFetched, datastores: datastores, networks: clusterFetched.data.networks, networksLoading: false, datastoresLoading: false})
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
    console.log(templateFetched)
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

  networkDeviceRemove = r => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let newList = networkDevices.filter(n => {
      return r.id !== n.id
    })
    this.setState({networkDevices: newList})
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

  diskDeviceRemove = r => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let newList = diskDevices.filter(n => {
      return r.id !== n.id
    })
    this.setState({diskDevices: newList})
  }




  //SETTERS
  //Input
  vmNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.vmName = e.target.value
    this.setState({request: request})
  }

  //select number
  datacenterSet = datacenter => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.datacenter = datacenter[0]
    request.datacenterMoId = datacenter[1]
    this.setState({request: request})
  }

  clusterSet = cluster => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.cluster = cluster[0]
    request.clusterMoId = cluster[1]
    this.setState({request: request})
  }

  folderSet = (selectedKeys, info) => {
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
    this.setState({request: request})
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

  networkDeviceTypeSet = (deviceType , event, networkDeviceId) => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let networkDevice = networkDevices.find( r => r.id === networkDeviceId )
    networkDevice.deviceType = deviceType
    this.setState({networkDevices: networkDevices})
  }

  networkSet = (networkMoId , event, networkDeviceId) => {
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let networkDevice = networkDevices.find( r => r.id === networkDeviceId )
    networkDevice.networkMoId = networkMoId
    this.setState({networkDevices: networkDevices})
  }

  diskDeviceTypeSet = (deviceType , event, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )
    diskDevice.deviceType = deviceType
    this.setState({diskDevices: diskDevices})
  }

  datastoreSet = (datastoreMoId , event, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )
    diskDevice.datastoreMoId = datastoreMoId
    this.setState({diskDevices: diskDevices})
  }

  sizeMBSet = (size, diskDeviceId) => {
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
    let diskDevice = diskDevices.find( r => r.id === diskDeviceId )
    diskDevice.sizeMB = size.target.value
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
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let networkDevices = JSON.parse(JSON.stringify(this.state.networkDevices))
    let diskDevices = JSON.parse(JSON.stringify(this.state.diskDevices))
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

    if (!request.memoryMB || isNaN(request.memoryMB)) {
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
      this.vmCreate()
    }
  }


  //DISPOSAL ACTION
  vmCreate = async () => {

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
        "diskDevices": networkDevices,
        "guestSpec": "centos-test",
        "deleteGuestSpecAfterDeploy": true,
        "bootstrapKeyId": 1,
        "finalPubKeyIds": [
            1
        ],
        "postDeployCommands": [
            {
                "command": "echo",
                "user_args": {
                    "__echo": "Hello World!"
                }
            },
            {
                "command": "ls",
                "user_args": {
                    "__path": "/"
                }
            }
        ]
    }

    console.log(b)
    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true})
        this.response()
      },
      error => {
        this.props.dispatch(vmCreateError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`vmware/${this.props.asset.id}/template/${this.state.template.moId}/`, this.props.token, b )
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
    console.log(this.state)

    let networkNameMoid = obj => {
      if (this.state.networks) {
        let n = this.state.networks.find(e => e.moId === obj.networkMoId)
        if (n && n.name) {
          return(n.name)
        }
      }
    }

    let datastoreNameMoid = obj => {
      if (this.state.datastores) {
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
                    onChange={(value, event) => this.networkSet(value, event, obj.id)}>
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
                      onChange={(value, event) => this.networkSet(value, event, obj.id)}>
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
                onChange={(value, event) => this.networkDeviceTypeSet(value, event, obj.id)}>
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
                onChange={(value, event) => this.networkDeviceTypeSet(value, event, obj.id)}>
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
                    defaultValue={() => datastoreNameMoid(obj)}
                    key={obj.id}
                    style={{ width: '100%' , border: `1px solid ${obj.datastoreMoIdColor}` }}
                    onChange={(value, event) => this.datastoreSet(value, event, obj.id)}>
                    { this.state.datastores?
                      this.state.datastores.map((n, i) => {
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
                  { this.state.datastores ?
                    <Select
                      defaultValue={() => datastoreNameMoid(obj)}
                      key={obj.id}
                      style={{ width: '100%' }}
                      onChange={(value, event) => this.datastoreSet(value, event, obj.id)}>
                      {this.state.datastores.map((n, i) => {
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
                onChange={(value, event) => this.diskDeviceTypeSet(value, event, obj.id)}>
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
                onChange={(value, event) => this.diskDeviceTypeSet(value, event, obj.id)}>
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
                id='sizeMB'
                onBlur={e => this.sizeMBSet(e, obj.id)}
              />
            :
              <Input
                id='sizeMB'
                defaultValue={obj.sizeMB}
                onBlur={e => this.sizeMBSet(e, obj.id)}
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

    let randomKey = () => {
      return Math.random().toString()
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
        >

          <AssetSelector />

          <Divider/>

          { (this.props.asset && this.props.asset.id) ?
            <React.Fragment>
              { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Service Created"
                 />
              }
              { !this.state.loading && !this.state.response &&
                <React.Fragment>

                <Row>
                  <Col offset={4} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Vm Name:</p>
                  </Col>
                  <Col span={4}>
                    {this.state.errors.vmNameError ?
                      <Input style={{width: '100%', borderColor: this.state.errors.vmNameColor}} name="vmName" id='vmName' onChange={e => this.vmNameSet(e)} />
                    :
                      <Input style={{width: '100%'}} defaultValue={this.state.request.vmName} name="vmName" id='vmName' onChange={e => this.vmNameSet(e)} />
                    }
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={1} span={5}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenter:</p>
                  </Col>
                  <Col span={4}>
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
                  <Col offset={2} span={1}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Cluster:</p>
                  </Col>
                  { this.state.clustersLoading ?
                    <Col span={4}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={4}>
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
                </Row>
                <br/>



                <Row>
                  <Col offset={4} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Folder:</p>
                  </Col>
                  { this.state.foldersLoading ?
                    <Col span={11}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={11}>
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
                  <Col offset={4} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Template:</p>
                  </Col>
                  { this.state.templatesLoading ?
                    <Col span={11}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={11}>
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
                  <Col offset={4} span={2}>
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
                      defaultValue={this.state.request.numCoresPerSocket}
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
                      defaultValue={this.state.request.numCoresPerSocket}
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
                  <Col span={2}>
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
                  <Col offset={1} span={5}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Network Devices:</p>
                  </Col>
                  {this.state.networkDevicesLoading ?
                    <Col span={11}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={11}>
                      {this.state.networkDevices ?
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
                            rowKey={randomKey}
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
                  <Col offset={1} span={5}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Main Datastore:</p>
                  </Col>
                  {this.state.datastoresLoading ?
                    <Col span={11}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                    :
                    <Col span={11}>
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
                  <Col offset={1} span={5}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Disk Devices:</p>
                  </Col>
                  {this.state.diskDevicesLoading ?
                    <Col span={11}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={11}>
                      {this.state.diskDevices ?
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
                            rowKey={randomKey}
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
                  <Col offset={1} span={5}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Notes:</p>
                  </Col>
                  <Col span={11}>
                    {this.state.errors.notesError ?
                      <Input.TextArea style={{width: '100%', borderColor: this.state.errors.notesColor}} name="notes" id='notes' onChange={e => this.notesSet(e)} />
                    :
                      <Input.TextArea defaultValue={this.state.request.notes} style={{width: '100%'}} name="notes" id='notes' onChange={e => this.notesSet(e)} />
                    }
                  </Col>
                </Row>
                <br/>



                <Row>
                  <Col offset={10} span={2}>
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
}))(CreateVmService);
