import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Select, Input, Row, Col } from 'antd'
import { LoadingOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  permissionsFetch,
  rolesError,
  newIdentityGroupAddError,
  permissionAddError,
  identityGroups,
  identityGroupsError,

  networksError,
  containersError,
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



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
    if (prevState.request.assetId !== this.state.request.assetId) {
      this.networksGet()
    }
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
      let rolesNoWorkflow = fetchedRolesAndPrivileges.data.items.filter(r => r.role !== 'workflow');
      await this.setState({rolesAndPrivileges: rolesNoWorkflow, rolesLoading: false})
      let rolesAndPrivileges = JSON.parse(JSON.stringify(this.state.rolesAndPrivileges))
      let newList = []

      for (let r in rolesAndPrivileges) {
        newList.push(rolesAndPrivileges[r].role)
      }
      await this.setState({rolesNames: newList})
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
    await rest.doXHR("infoblox/identity-groups/", this.props.token)
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
    await rest.doXHR(`infoblox/roles/?related=privileges`, this.props.token)
    return r
  }

  networksGet = async () => {
    this.setState({networksLoading: true})

    let nets = await this.netsGet()
    if (nets.status && nets.status !== 200) {
      this.props.dispatch(networksError( nets ))
      await this.setState({networks: null, networksLoading: false})
      return
    }

    let containers = await this.containersGet()
    if (containers.status && containers.status !== 200) {
      this.props.dispatch(containersError( containers ))
      await this.setState({networks: null, networksLoading: false})
      return
    }

    let networks = nets.concat(containers)
    this.setState({networks: networks, networksLoading: false})
  }

  netsGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/${this.state.request.assetId}/networks/`, this.props.token)
    return r
  }

  containersGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/${this.state.request.assetId}/network-containers/`, this.props.token)
    return r
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

    if (identityGroupId === '' || identityGroupId === undefined) {
      delete errors.IdentityGroupExistsError
      delete errors.newIdentityGroupError
      await this.setState({errors: errors})
      return
    }

    else if (this.state.identityGroupIds.includes(identityGroupId)) {
      errors.IdentityGroupExistsError = true
      await this.setState({errors: errors})
      return
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
      delete errors.IdentityGroupExistsError
      this.setState({newIdentityGroup: identityGroupId, newCn: cns[0], errors: errors})
    }
  }

  newIdentityGroupHandle = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.newIdentityGroup && this.state.newCn) {
      delete errors.newIdentityGroupError
      await this.setState({errors: errors})

      let awaitIdentityGroup = await this.newIdentityGroupAdd(this.state.newIdentityGroup, this.state.newCn)
      this.setState({identityGroupAddLoading: false})

      if (awaitIdentityGroup.status && awaitIdentityGroup.status !== 201) {
        this.props.dispatch(newIdentityGroupAddError(awaitIdentityGroup))
        errors.newIdentityGroupError = true
        await this.setState({errors: errors})
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
      this.setState({errors: errors})
    }
  }

  roleSet = role => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.role = role
    this.setState({request: request})
  }

  assetSet = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.assetId = id
    this.setState({request: request})
  }

  networkSet = networkName => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.network = {}
    request.network.name = networkName
    this.setState({request: request})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.identityGroupId) {
      errors.identityGroupIdError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.identityGroupIdError
      this.setState({errors: errors})
    }

    if (!request.assetId) {
      errors.assetError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.assetError
      this.setState({errors: errors})
    }

    if (!request.role) {
      errors.roleError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.roleError
      this.setState({errors: errors})
    }

    if (!request.network) {
      errors.networkError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.networkError
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.permissionAdd()
    }
  }


  //DISPOSAL ACTION
  newIdentityGroupAdd = async (identityGroupId, cn) => {
    this.setState({identityGroupAddLoading: true})
    let r
    let b = {}
    b.data = {
      "name": cn,
      "identity_group_identifier": identityGroupId
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
    await rest.doXHR(`infoblox/identity-groups/`, this.props.token, b )
    return r
  }

  permissionAdd = async () => {
    this.setState({loading: true})
    let b = {}
    b.data = {
      "identity_group_name": this.state.request.cn,
      "identity_group_identifier": this.state.request.identityGroupId,
      "role": this.state.request.role,
      "network": {
        "name": this.state.request.network.name,
        "id_asset": this.state.request.assetId
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
    await rest.doXHR(`infoblox/permissions/`, this.props.token, b )
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
      networks: []
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add permission</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
          maskClosable={false}
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
                            style={{width: 350, border: `1px solid red`}}
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
                <Col span={12}>
                { this.state.identityGroupAddLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                :
                  <React.Fragment>
                    {this.state.errors.newIdentityGroupError ?
                      <React.Fragment>
                        <Input
                          defaultValue={this.state.newIdentityGroup}
                          style={{width: 350, borderColor: 'red'}}
                          placeholder="cn= ,cn= ,dc= ,dc= "
                          suffix={
                            <CloseCircleOutlined onClick={() => this.newIdentityGroupSet({target: {value: ''}})}/>
                          }
                          onChange={e => this.newIdentityGroupSet(e)}
                        />
                        <p style={{color: 'red'}}>Error: new DN not set.</p>
                      </React.Fragment>
                    :
                      <Input
                        style={{width: 350}}
                        defaultValue={this.state.newIdentityGroup}
                        placeholder="cn= ,cn= ,dc= ,dc= "
                        suffix={
                          <CloseCircleOutlined onClick={() => this.newIdentityGroupSet({target: {value: ''}})}/>
                        }
                        onChange={e => this.newIdentityGroupSet(e)}
                      />
                    }
                  </React.Fragment>
                }
                {this.state.errors.IdentityGroupExistsError ? <p style={{color: 'red'}}>Error: Group already exists.</p> : null }
                </Col>
                <Col span={4}>
                  {this.state.errors.IdentityGroupExistsError ?
                    <Button icon={addIcon} type='primary' shape='round' style={{marginLeft: 20}} disabled />
                  :
                    <Button icon={addIcon} type='primary' shape='round' style={{marginLeft: 20}} onClick={() => this.newIdentityGroupHandle()} />
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
                              style={{width: 350, border: `1px solid red`}}
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
                            value={this.state.request.assetId}
                            showSearch
                            style={{width: 350, border: `1px solid red`}}
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
                            value={this.state.request.assetId}
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
                  <p style={{marginRight: 25, float: 'right'}}>Network:</p>
                </Col>
                <Col span={16}>
                  { this.state.networksLoading ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
                  :
                    <React.Fragment>
                      { (this.state.networks && this.state.networks.length > 0) ?
                        <React.Fragment>
                          {this.state.errors.networkError ?
                            <Select
                              value={this.state.request && this.state.request.network ? this.state.request.network.name : null}
                              showSearch
                              style={{width: 350, border: `1px solid red`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onChange={n => this.networkSet(n)}
                            >
                              {this.state.request.role === 'admin' ?
                                <Select.Option key={'any'} value={'any'}>any</Select.Option>
                              :
                                <React.Fragment>
                                  <Select.Option key={'any'} value={'any'}>any</Select.Option>
                                  {this.state.networks.map((n, i) => {
                                    return (
                                      <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
                                    )
                                  })
                                  }
                                </React.Fragment>
                              }
                            </Select>
                          :
                            <Select
                              value={this.state.request && this.state.request.network ? this.state.request.network.name : null}
                              showSearch
                              style={{width: 350}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onChange={n => this.networkSet(n)}
                            >
                              {this.state.request.role === 'admin' ?
                                <Select.Option key={'any'} value={'any'}>any</Select.Option>
                              :
                                <React.Fragment>
                                  <Select.Option key={'any'} value={'any'}>any</Select.Option>
                                  {this.state.networks.map((n, i) => {
                                    return (
                                      <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
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
            { this.props.identityGroupsError ? <Error component={'permissionAdd infoblox'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
            { this.props.rolesError ? <Error component={'permissionAdd infoblox'} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
            { this.props.networksError ? <Error component={'permissionAdd infoblox'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
            { this.props.newIdentityGroupAddError ? <Error component={'permissionAdd infoblox'} error={[this.props.newIdentityGroupAddError]} visible={true} type={'newIdentityGroupAddError'} /> : null }
            { this.props.permissionAddError ? <Error component={'permissionAdd infoblox'} error={[this.props.permissionAddError]} visible={true} type={'permissionAddError'} /> : null }
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
  assets: state.infoblox.assets,

  identityGroups: state.infoblox.identityGroups,
  permissions: state.infoblox.permissions,

  rolesError: state.infoblox.rolesError,
  identityGroupsError: state.infoblox.identityGroupsError,
  newIdentityGroupAddError: state.infoblox.newIdentityGroupAddError,
  networksError: state.infoblox.networksError,
  permissionAddError: state.infoblox.permissionAddError,
}))(Add);
