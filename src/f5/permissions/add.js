import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import { Button, Modal, Spin, Result, Select, Input, Row, Col } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import Rest from "../../_helpers/Rest"
import Error from '../../error/f5Error'

import {
  permissionsFetch,
  rolesError,
  newDnAddError,
  permissionAddError,
  identityGroups,
  identityGroupsError,

  partitionsError
} from '../../_store/store.f5'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      request: {}
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = () => {
    this.ig()
    this.setState({visible: true})
    this.rolesGet()
  }


  ig = () => {
    let items = []

    let dns = JSON.parse(JSON.stringify(this.props.identityGroups))
    dns.forEach( ig => {
      items.push(ig.identity_group_identifier)
    })
    this.setState({dns: items})
  }

  privilegesBeautify = () => {
    let fetchedList = JSON.parse(JSON.stringify(this.state.rolesAndPrivileges))
    let newList = []

    for (let r in fetchedList) {
      let newRole = fetchedList[r].role
      newList.push(newRole)
    }
    this.setState({rolesBeauty: newList})
  }


  //GET
  dnsGet = async () => {
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
    await rest.doXHR("f5/identity-groups/", this.props.token)
    return r
  }

  rolesGet = async () => {
    this.setState({rolesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.privilegesBeautify()})
        },
      error => {
        this.props.dispatch(rolesError(error))
        this.setState({rolesLoading: false, response: false})
      }
    )
    await rest.doXHR(`f5/roles/?related=privileges`, this.props.token)
    this.setState({rolesLoading: false})
  }

  partitionsGet = async (id) => {
    this.setState({partitionsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({partitions: resp.data.items, partitionsLoading: false})
      },
      error => {
        this.props.dispatch(partitionsError(error))
      }
    )
    await rest.doXHR(`f5/${this.state.request.asset}/partitions/`, this.props.token)
    this.setState({partitionsLoading: false})
  }


  //SET
  dnSet = async dn => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.dn = dn

    let cn = this.props.identityGroups.find( ig => {
      return ig.identity_group_identifier === dn
    })
    request.cn = cn.name
    await this.setState({request: request, newDn: null})
  }

  newDnSet = async e => {
    let dn = e.target.value
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.dns.includes(dn)) {
      errors.newDn = null
      await this.setState({errors: errors})
      this.dnSet(dn)
    }
    else {
      request.dn = ''
      request.cn = ''
      await this.setState({request: request})

      let list = dn.split(',')
      let cns = []

      let found = list.filter(i => {
        let iLow = i.toLowerCase()
        if (iLow.startsWith('cn=')) {
          let cn = iLow.split('=')
          cns.push(cn[1])
        }
      })
      errors.newDn = null
      this.setState({newDn: dn, newCn: cns[0], errors: errors})
    }
  }

  assetSet = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.asset = id
    this.setState({request: request}, () => this.partitionsGet())
  }

  roleSet = role => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.role = role
    this.setState({request: request})
  }

  partitionSet = partitionName => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.partition = {}
    request.partition.name = partitionName
    this.setState({request: request})
  }

  newDnHandle = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.newDn && this.state.newCn) {

      errors.newDn = null
      await this.setState({errors: errors})

      let awaitDn = await this.newDnAdd(this.state.newDn, this.state.newCn)
      this.setState({addDnLoading: false})

      if (awaitDn.status && awaitDn.status !== 201) {
        this.props.dispatch(newDnAddError(awaitDn))
        return
      }

      let identityGroups = await this.identityGroupsGet()
      if (identityGroups.status && identityGroups.status !== 200 ) {
        this.props.dispatch(identityGroupsError(identityGroups))
        return
      }
      else {
        this.props.dispatch(identityGroups( identityGroups ))
      }
      this.dnSet(this.state.newDn)
    }
    else {
      errors.newDn = 'error'
      this.setState({errors: errors})
    }
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.dn) {
      errors.dnError = true
      errors.dnColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.dnError
      delete errors.dnColor
      this.setState({errors: errors})
    }

    if (!request.asset) {
      errors.assetError = true
      errors.assetColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.assetError
      delete errors.assetColor
      this.setState({errors: errors})
    }

    if (!request.role) {
      errors.roleError = true
      errors.roleColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.roleError
      delete errors.roleColor
      this.setState({errors: errors})
    }

    if (!request.partition) {
      errors.partitionError = true
      errors.partitionColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.partitionError
      delete errors.partitionColor
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    let validation = await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.permissionAdd()
    }
  }


  //DISPOSAL ACTION
  newDnAdd = async (dn, cn) => {
    this.setState({addDnLoading: true})
    let request = JSON.parse(JSON.stringify(this.state.request))
    let r
    const b = {
      "data":
        {
          "name": cn,
          "identity_group_identifier": dn
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
    await rest.doXHR(`f5/identity-groups/`, this.props.token, b )
    return r
  }

  permissionAdd = async () => {
    this.setState({message: null});

    const b = {
      "data":
        {
          "identity_group_name": this.state.request.cn,
          "identity_group_identifier": this.state.request.dn,
          "role": this.state.request.role,
          "partition": {
            "name": this.state.request.partition.name,
            "id_asset": this.state.request.asset
          }
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.response()
      },
      error => {
        this.props.dispatch(permissionAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/permissions/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(permissionsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {},
      partitions: []
    })
  }


  render() {
    console.log(this.state.request)
    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD PERMISSION</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 25, float: 'right'}}>Distinguished Name:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                    { this.state.dns && this.state.dns.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.dnError ?
                          <Select
                            value={this.state.request.dn}
                            showSearch
                            style={{width: 350, border: `1px solid ${this.state.errors.dnColor}`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.dnSet(n)}
                          >
                            <React.Fragment>
                              {this.state.dns.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.dn}
                            showSearch
                            style={{width: 350}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.dnSet(n)}
                          >
                            <React.Fragment>
                              {this.state.dns.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
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
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 25, float: 'right'}}>Add new Dn (optional):</p>
                  {this.state.errors.newDn ? <p style={{color: 'red', marginRight: 25, float: 'right'}}>Error: new DN not set.</p> : null }
                </Col>
                <Col span={16}>
                  <Input style={{width: 350}} name="newDn" id='newDn' defaultValue="cn= ,cn= ,dc= ,dc= " onBlur={e => this.newDnSet(e)} />
                  <Button icon={addIcon} type='primary' shape='round' style={{marginLeft: 20}} onClick={() => this.newDnHandle()} />
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 25, float: 'right'}}>Asset:</p>
                </Col>
                <Col span={16}>
                  { this.props.assetsLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                :
                  <React.Fragment>
                    { this.props.assets && this.props.assets.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.assetError ?
                          <Select
                            value={this.state.request.asset}
                            showSearch
                            style={{width: 350, border: `1px solid ${this.state.errors.assetColor}`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.assetSet(n)}
                          >
                            <React.Fragment>
                              {this.props.assets.map((a, i) => {
                                return (
                                  <Select.Option key={i} value={a.id}>{a.address}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.asset}
                            showSearch
                            style={{width: 350}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.assetSet(n)}
                          >
                            <React.Fragment>
                              {this.props.assets.map((a, i) => {
                                return (
                                  <Select.Option key={i} value={a.id}>{a.address}</Select.Option>
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
                  <p style={{marginRight: 25, float: 'right'}}>Role:</p>
                </Col>
                <Col span={16}>
                  { this.state.rolesLoading ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.state.rolesBeauty && this.state.rolesBeauty.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.roleError ?
                            <Select
                              value={this.state.request.role}
                              showSearch
                              style={{width: 350, border: `1px solid ${this.state.errors.roleColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.roleSet(n)}
                            >
                              <React.Fragment>
                                {this.state.rolesBeauty.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              value={this.state.request.role}
                              showSearch
                              style={{width: 350}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.roleSet(n)}
                            >
                              <React.Fragment>
                                {this.state.rolesBeauty.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
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
                  <p style={{marginRight: 25, float: 'right'}}>Partition:</p>
                </Col>
                <Col span={16}>
                  { this.state.partitionsLoading ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
                  :
                    <React.Fragment>
                      { (this.state.partitions && this.state.partitions.length > 0) ?
                        <React.Fragment>
                          {this.state.errors.partitionError ?
                            <Select
                              defaultValue={this.state.partition ? this.state.request.partition.name : null}
                              showSearch
                              style={{width: 350, border: `1px solid ${this.state.errors.partitionColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onChange={n => this.partitionSet(n)}
                            >
                              {this.state.request.role === 'admin' ?
                                <Select.Option key={'any'} value={'any'}>any</Select.Option>
                              :
                                <React.Fragment>
                                  <Select.Option key={'any'} value={'any'}>any</Select.Option>
                                  {this.state.partitions.map((n, i) => {
                                    return (
                                      <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                    )
                                  })
                                  }
                                </React.Fragment>
                              }
                            </Select>
                          :
                            <Select
                              defaultValue={this.state.partition ? this.state.request.partition.name : null}
                              showSearch
                              style={{width: 350}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onChange={n => this.partitionSet(n)}
                            >
                              {this.state.request.role === 'admin' ?
                                <Select.Option key={'any'} value={'any'}>any</Select.Option>
                              :
                                <React.Fragment>
                                  <Select.Option key={'any'} value={'any'}>any</Select.Option>
                                  {this.state.partitions.map((n, i) => {
                                    return (
                                      <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                    )
                                  })
                                  }
                                </React.Fragment>
                              }
                            </Select>
                          }
                        </React.Fragment>
                      :
                        <Select style={{width: 350}} disabled value={null} onChange={null}>
                        </Select>
                      }
                    </React.Fragment>
                  }
                </Col>
              </Row>
              <br/>

              {this.state.message ?
                <p style={{color: 'red'}}>{this.state.message}</p>
              :
                null
              }

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" onClick={() => this.validation()}>
                    Add Permission
                  </Button>
                </Col>
              </Row>

            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.permissionAddError ? <Error component={'add f5'} error={[this.props.permissionAddError]} visible={true} type={'permissionAddError'} /> : null }
            { this.props.rolesError ? <Error component={'add f5'} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
            { this.props.newDnAddError ? <Error component={'add f5'} error={[this.props.newDnAddError]} visible={true} type={'newDnAddError'} /> : null }

            { this.props.partitionsError ? <Error component={'add f5'} error={[this.props.partitionsError]} visible={true} type={'partitionsError'} /> : null }
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
  assets: state.f5.assets,

  identityGroups: state.f5.identityGroups,
  permissions: state.f5.permissions,

  rolesError: state.f5.rolesError,
  newDnAddError: state.f5.newDnAddError,

  partitionsError: state.f5.partitionsError,
  permissionAddError: state.f5.permissionAddError,
}))(Add);
