import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  datacentersError,
  clustersError,
  clusterError,
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
      errors: {},
      request: {}
    };
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
      console.log(datacentersFetched.data.items)
      this.setState({datacenters: datacentersFetched.data.items})
    }
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
    let clusterFetched = await this.clusterGet()
    if (clusterFetched.status && clusterFetched.status !== 200 ) {
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
      this.setState({cluster: clusterFetched, datastores: datastores, networks: clusterFetched.data.networks})
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
    let templateFetched = await this.templateGet()
    if (templateFetched.status && templateFetched.status !== 200 ) {
      this.props.dispatch(templateError(templateFetched))
      return
    }
    else {
      let networkDevices = []
      let diskDevices = []

      if (templateFetched.data.networkDevices && templateFetched.data.networkDevices.existent) {
        templateFetched.data.networkDevices.existent.forEach(d => {
          networkDevices.push(d)
        })
      }
      if (templateFetched.data.diskDevices && templateFetched.data.diskDevices.existent) {
        templateFetched.data.diskDevices.existent.forEach(d => {
          diskDevices.push(d)
        })
      }

      this.setState({template: templateFetched, networkDevices: networkDevices, diskDevices: diskDevices})
    }
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

  //select

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
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
    let vmName = this.state.request.vmName

    let b = {}
    b.data = {

    }

    if (this.state.request.foo === 'snat') {
      b.data.snatPool = {
        "name": `snatpool_${vmName}`,
        "members": [
          this.state.request.snatPoolAddress
        ]
      }
    }

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
    await rest.doXHR(`vmware/${this.props.asset.id}/${this.props.partition}/workflow/virtualservers/`, this.props.token, b )
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
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Vm Name:</p>
                  </Col>
                  <Col span={16}>
                    {this.state.errors.vmNameError ?
                      <Input style={{width: 450, borderColor: this.state.errors.vmNameColor}} name="vmName" id='vmName' onChange={e => this.vmNameSet(e)} />
                    :
                      <Input defaultValue={this.state.request.vmName} style={{width: 450}} name="vmName" id='vmName' onChange={e => this.vmNameSet(e)} />
                    }
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenters:</p>
                  </Col>
                  <Col span={16}>
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
                              style={{width: 450, border: `1px solid ${this.state.errors.datacenterColor}`}}
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
                              style={{width: 450}}
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
                </Row>
                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Clusters:</p>
                  </Col>
                  { this.state.clustersLoading ?
                    <Col span={16}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={16}>
                      { this.state.clusters ?
                        <React.Fragment>
                          { this.state.clusters && this.state.clusters.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.clusterError ?
                                <Select
                                  defaultValue={this.state.request.cluster}
                                  value={this.state.request.cluster}
                                  showSearch
                                  style={{width: 450, border: `1px solid ${this.state.errors.clusterColor}`}}
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
                                  style={{width: 450}}
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
                          style={{width: 450}}
                          disabled
                        />
                      }
                    </Col>
                  }
                </Row>
                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Templates:</p>
                  </Col>
                  { this.state.templatesLoading ?
                    <Col span={9}>
                      <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                    </Col>
                  :
                    <Col span={9}>
                      { this.state.templates ?
                        <React.Fragment>
                          { this.state.templates && this.state.templates.length > 0 ?
                            <React.Fragment>
                              {this.state.errors.templateError ?
                                <Select
                                  defaultValue={this.state.request.template}
                                  value={this.state.request.template}
                                  showSearch
                                  style={{width: 450, border: `1px solid ${this.state.errors.templateColor}`}}
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
                                  style={{width: 450}}
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
                          style={{width: 450}}
                          optionFilterProp="children"
                          disabled
                        />
                      }
                    </Col>
                  }
                  <Col span={4}>
                    <Button type="primary" shape='round' onClick={() => this.templatesFetch()} >
                      Refresh
                    </Button>
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Main Datastore:</p>
                  </Col>
                  <Col span={16}>
                    { this.state.datastores && this.state.datastores.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.mainDatastoreError ?
                          <Select
                            defaultValue={this.state.request.mainDatastore}
                            value={this.state.request.mainDatastore}
                            showSearch
                            style={{width: 450, border: `1px solid ${this.state.errors.mainDatastoreColor}`}}
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
                            style={{width: 450}}
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
                        style={{width: 450}}
                        disabled
                      />
                    }
                  </Col>
                </Row>

                <Row>
                  <Col offset={8} span={16}>
                    <Button type="primary" shape='round' onClick={() => this.validation()} >
                      Create Virtual machine
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

        {this.state.visible ?
          <React.Fragment>
            { this.props.datacentersError ? <Error component={'create vm'} error={[this.props.datacentersError]} visible={true} type={'datacentersError'} /> : null }
            { this.props.clustersError ? <Error component={'create vm'} error={[this.props.clustersError]} visible={true} type={'clustersError'} /> : null }
            { this.props.clusterError ? <Error component={'create vm'} error={[this.props.clusterError]} visible={true} type={'clusterError'} /> : null }
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
  templatesError: state.vmware.templatesError,
  templateError: state.vmware.templateError,
}))(CreateVmService);
