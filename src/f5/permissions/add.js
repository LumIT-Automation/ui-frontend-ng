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
  newIdentityGroupAddError,
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
      request: {},
      errors: {},
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
    this.setState({visible: true})
    this.main()
  }

  main = async () => {
    let fetchedIdentityGroups = await this.identityGroupsGet()
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      return
    }
    else {
      this.props.dispatch(identityGroups( fetchedIdentityGroups ))
    }
    let items = []
    let identityGroupIds = JSON.parse(JSON.stringify(this.props.identityGroups))
    identityGroupIds.forEach( ig => {
      items.push(ig.identity_group_identifier)
    })
    this.setState({identityGroupIds: items})

    await this.setState({rolesLoading: true})
    let fetchedRolesAndPrivileges = await this.rolesAndPrivilegesGet()
    if (fetchedRolesAndPrivileges.status && fetchedRolesAndPrivileges.status !== 200 ) {
      this.props.dispatch(rolesError(fetchedRolesAndPrivileges))
      await this.setState({rolesLoading: false})
      return
    }
    else {
      await this.setState({rolesAndPrivileges: fetchedRolesAndPrivileges.data.items, rolesLoading: false})
      let rolesAndPrivileges = JSON.parse(JSON.stringify(this.state.rolesAndPrivileges))
      let newList = []

      for (let r in rolesAndPrivileges) {
        newList.push(rolesAndPrivileges[r].role)
      }
      this.setState({rolesNames: newList})
    }
  }


  //GET
  identityGroupsGet = async () => {
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

  rolesAndPrivilegesGet = async () => {
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
    await rest.doXHR(`f5/roles/?related=privileges`, this.props.token)
    return r
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
  identityGroupIdSet = async identityGroupId => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.identityGroupId = identityGroupId

    let cn = this.props.identityGroups.find( ig => {
      return ig.identity_group_identifier === identityGroupId
    })
    request.cn = cn.name
    await this.setState({request: request, newIdentityGroup: null})
  }

  newIdentityGroupSet = async e => {
    let identityGroupId = e.target.value
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.identityGroupIds.includes(identityGroupId)) {
      errors.newIdentityGroup =
      await this.setState({errors: errors})
      this.identityGroupIdSet(identityGroupId)
    }
    else {
      request.identityGroupId = ''
      request.cn = ''
      await this.setState({request: request})

      let list = identityGroupId.split(',')
      let cns = []

      let found = list.filter(i => {
        let iLow = i.toLowerCase()
        if (iLow.startsWith('cn=')) {
          let cn = iLow.split('=')
          cns.push(cn[1])
        }
      })
      delete errors.newIdentityGroup
      this.setState({newIdentityGroup: identityGroupId, newCn: cns[0], errors: errors})
    }
  }

  newIdentityGroupHandle = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.newIdentityGroup && this.state.newCn) {

      delete errors.newIdentityGroupError
      delete errors.newIdentityGroupColor
      await this.setState({errors: errors})

      let awaitIdentityGroup = await this.newIdentityGroupAdd(this.state.newIdentityGroup, this.state.newCn)
      this.setState({identityGroupAddLoading: false})

      if (awaitIdentityGroup.status && awaitIdentityGroup.status !== 201) {
        this.props.dispatch(newIdentityGroupAddError(awaitIdentityGroup))
        return
      }

      let identityGroupsFetched = await this.identityGroupsGet()
      if (identityGroupsFetched.status && identityGroupsFetched.status !== 200 ) {
        this.props.dispatch(identityGroupsError(identityGroupsFetched))
        return
      }
      else {
        this.props.dispatch(identityGroups( identityGroupsFetched ))
        this.main()
        this.identityGroupIdSet(this.state.newIdentityGroup)
      }
    }
    else {
      errors.newIdentityGroupError = true
      errors.newIdentityGroupColor = 'red'
      this.setState({errors: errors})
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


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.identityGroupId) {
      errors.identityGroupIdError = true
      errors.identityGroupIdColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.identityGroupIdError
      delete errors.identityGroupIdColor
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
    else {
      console.log(this.state.errors)
    }
  }


  //DISPOSAL ACTION
  newIdentityGroupAdd = async (identityGroupId, cn) => {
    this.setState({identityGroupAddLoading: true})
    let request = JSON.parse(JSON.stringify(this.state.request))
    let r
    const b = {
      "data":
        {
          "name": cn,
          "identity_group_identifier": identityGroupId
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
    this.setState({loading: true})
    const b = {
      "data":
        {
          "identity_group_name": this.state.request.cn,
          "identity_group_identifier": this.state.request.identityGroupId,
          "role": this.state.request.role,
          "partition": {
            "name": this.state.request.partition.name,
            "id_asset": this.state.request.asset
          }
        }
      }


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
    console.log(this.state)
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
                  <p style={{marginRight: 25, float: 'right'}}>Identity group:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                    { this.state.identityGroupIds && this.state.identityGroupIds.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.identityGroupIdError ?
                          <Select
                            value={this.state.request.identityGroupId}
                            showSearch
                            style={{width: 350, border: `1px solid ${this.state.errors.identityGroupIdColor}`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.identityGroupIdSet(n)}
                          >
                            <React.Fragment>
                              {this.state.identityGroupIds.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n}>{n}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.identityGroupId}
                            showSearch
                            style={{width: 350}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.identityGroupIdSet(n)}
                          >
                            <React.Fragment>
                              {this.state.identityGroupIds.map((n, i) => {
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
                  <p style={{marginRight: 25, float: 'right'}}>New IdentityGroup (optional):</p>
                  {this.state.errors.newIdentityGroup ? <p style={{color: 'red', marginRight: 25, float: 'right'}}>Error: new DN not set.</p> : null }
                </Col>
                <Col span={16}>
                { this.state.identityGroupAddLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                :
                  <React.Fragment>
                    <Input
                      name="newIdentityGroup"
                      id='newIdentityGroup'
                      style={{width: 350}}
                      placeholder="cn= ,cn= ,dc= ,dc= "
                      onBlur={e => this.newIdentityGroupSet(e)}
                    />
                    <Button icon={addIcon} type='primary' shape='round' style={{marginLeft: 20}} onClick={() => this.newIdentityGroupHandle()} />
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
                      { this.state.rolesNames && this.state.rolesNames.length > 0 ?
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
                                {this.state.rolesNames.map((n, i) => {
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
                                {this.state.rolesNames.map((n, i) => {
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
            { this.props.newIdentityGroupAddError ? <Error component={'add f5'} error={[this.props.newIdentityGroupAddError]} visible={true} type={'newIdentityGroupAddError'} /> : null }

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
  newIdentityGroupAddError: state.f5.newIdentityGroupAddError,

  partitionsError: state.f5.partitionsError,
  permissionAddError: state.f5.permissionAddError,
}))(Add);
