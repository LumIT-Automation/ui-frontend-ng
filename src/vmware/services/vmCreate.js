import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  datacentersError
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
    let request = JSON.parse(JSON.stringify(this.state.request))
    if (this.state.visible) {
      if ( this.props.asset && (prevProps.asset !== this.props.asset) ) {
        this.main()
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

  //SETTERS
  //Input
  serviceNameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.serviceName = e.target.value
    this.setState({request: request})
  }

  //select number
  datacenterSet = datacenter => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.datacenter = datacenter[0]
    request.datacenterMoId = datacenter[1]
    this.setState({request: request})
  }

  //select
  snatSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.snat = e
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.serviceName) {
      errors.serviceNameError = true
      errors.serviceNameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.serviceNameError
      delete errors.serviceNameColor
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

    return errors
  }

  validation = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let validators = new Validators()
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      let ips = []
      ips.push(this.state.request.destination)
      this.state.request.nodes.forEach((node, i) => {
        ips.push(node.address)
      })

      if (request.snat === 'snat') {
        this.state.networkDataGroups.forEach((dg, i) => {
          dg.records.forEach((record, i) => {
            if (record.name) {
              if (validators.ipInSubnet(record.name, ips)) {
                let irule = `when CLIENT_ACCEPTED {\n\tif {[findclass [IP::client_addr] ${dg.name}] eq "" } {\n\tsnat none\n}\n}`
                request.code = irule
                this.setState({request: request})
              }
            }
          });
        })
      }
      this.l4ServiceCreate()
    }
  }


  //DISPOSAL ACTION
  l4ServiceCreate = async () => {
    let serviceName = this.state.request.serviceName

    let b = {}
    b.data = {
      "virtualServer": {
        "name": `vs_${serviceName}`,
        "type": 'VM',
        "snat": this.state.request.snat,
        "routeDomainId": this.state.request.routeDomain,
        "destination": `${this.state.request.destination}:${this.state.request.destinationPort}`,
        "mask": '255.255.255.255',
        "source": '0.0.0.0/0'
      },
      "profiles": [
        {
          "name": `fastl4_${serviceName}`,
          "type": "fastl4",
          "idleTimeout": 300
        }
      ],
      "pool": {
        "name": `pool_${serviceName}`,
        "loadBalancingMode": this.state.request.datacenter,
        "nodes": this.state.request.nodes
      },
      "monitor": {
        "name": `mon_${serviceName}`,
        "type": this.state.request.monitorType
      }
    }

    if (this.state.request.snat === 'snat') {
      b.data.snatPool = {
        "name": `snatpool_${serviceName}`,
        "members": [
          this.state.request.snatPoolAddress
        ]
      }
    }

    if (this.state.request.code) {
      if ( (this.state.request.code !== '') || (this.state.request.code !== undefined) ) {
        b.data.irules = [
          {
            "name": `irule_${serviceName}`,
            "code": this.state.request.code
          }
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
        this.props.dispatch(l4ServiceCreateError(error))
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
    console.log(this.state.request)
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Service Name:</p>
                  </Col>
                  <Col span={16}>
                    {this.state.errors.serviceNameError ?
                      <Input style={{width: 450, borderColor: this.state.errors.serviceNameColor}} name="serviceName" id='serviceName' onChange={e => this.serviceNameSet(e)} />
                    :
                      <Input defaultValue={this.state.request.serviceName} style={{width: 450}} name="serviceName" id='serviceName' onChange={e => this.serviceNameSet(e)} />
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
                  <Col offset={8} span={16}>
                    <Button type="primary" shape='round' onClick={() => this.validation()} >
                      Create Load Balancer
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
}))(CreateVmService);
