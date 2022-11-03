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
  workflows,
  workflowsError,

} from '../store'

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      request: {
        role: 'exec'
      },
      errors: {},
      json: {
        details: {
          checkpoint: {
            allowed_asset_ids: [1,2]
          }
        }
      }
    }
  }

  componentDidMount() {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.details = this.state.json.details
    this.setState({request: request})
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
    await this.setState({identityGroupIds: items})

    let fetchedWorkflows = await this.workflowsGet()
    if (fetchedWorkflows.status && fetchedWorkflows.status !== 200 ) {
      this.props.dispatch(workflowsError(fetchedWorkflows))
      return
    }
    else {
      this.props.dispatch(workflows( fetchedWorkflows))
    }
    await this.setState({workflows: fetchedWorkflows.data.items})

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
    await rest.doXHR("workflow/identity-groups/", this.props.token)
    return r
  }

  workflowsGet = async () => {
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
    await rest.doXHR("workflow/workflows/", this.props.token)
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
    await rest.doXHR(`workflow/roles/?related=privileges`, this.props.token)
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
      delete errors.newIdentityGroupColor
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
      delete errors.newIdentityGroupColor
      await this.setState({errors: errors})

      let awaitIdentityGroup = await this.newIdentityGroupAdd(this.state.newIdentityGroup, this.state.newCn)
      this.setState({identityGroupAddLoading: false})

      if (awaitIdentityGroup.status && awaitIdentityGroup.status !== 201) {
        this.props.dispatch(newIdentityGroupAddError(awaitIdentityGroup))
        errors.newIdentityGroupError = true
        errors.newIdentityGroupColor = 'red'
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
      errors.newIdentityGroupColor = 'red'
      this.setState({errors: errors})
    }
  }

  workflowIdSet = async workflowId => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.workflowId = workflowId
    await this.setState({request: request})
  }

  roleSet = role => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.role = role
    this.setState({request: request})
  }

  //JSON Input
  jsonValidate = async e => {
    let json, beauty
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    try {
      json = JSON.parse(e.target.value)
      beauty = JSON.stringify(json, null, 2)
      json = JSON.parse(beauty)
      delete errors.jsonError
      await this.setState({
        json: json,
        errors: errors
      })
      this.jsonSet()
    } catch (error) {
      errors.jsonError = `json validation: ${error.message }`
      await this.setState({errors: errors})
    }
  }


  //SETTERS
  jsonSet = async () => {
    let json = JSON.parse(JSON.stringify(this.state.json))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (json.details && json.details.checkpoint && json.details.checkpoint.allowed_asset_ids ) {
      request.details = json.details
      await this.setState({request: request})
    }
  }



  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.identityGroupId) {
      errors.identityGroupIdError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.identityGroupIdError
      await this.setState({errors: errors})
    }

    if (!request.workflowId) {
      errors.workflowIdError = true
      await this.setState({errors: errors})
      }
    else {
      delete errors.workflowIdError
      await this.setState({errors: errors})
    }

    if (!request.role) {
      errors.roleError = true
      await this.setState({errors: errors})
      }
    else {
      delete errors.roleError
      await this.setState({errors: errors})
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
    await rest.doXHR(`workflow/identity-groups/`, this.props.token, b )
    return r
  }

  permissionAdd = async () => {
    this.setState({loading: true})
    let b = {}
    b.data = {
      "identity_group_identifier": this.state.request.identityGroupId,
      "role": this.state.request.role,
      "workflow": {
           "id": this.state.request.workflowId
       },
       "details": this.state.request.details
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
    await rest.doXHR(`workflow/permissions/`, this.props.token, b )

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

    let jsonPretty = () => {
      return JSON.stringify(this.state.json, null, 2)
    }

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
                          style={{width: 350, borderColor: this.state.errors.newIdentityGroupColor}}
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
                  <p style={{marginRight: 25, float: 'right'}}>Workflow:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                    { this.state.workflows && this.state.workflows.length > 0 ?
                      <React.Fragment>
                        {this.state.errors.workflowIdError ?
                          <Select
                            value={this.state.request.workflowId}
                            showSearch
                            style={{width: 350, border: `1px solid red`}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.workflowIdSet(n)}
                          >
                            <React.Fragment>
                              {this.state.workflows.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n.id}>{n.name}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          <Select
                            value={this.state.request.workflowId}
                            showSearch
                            style={{width: 350}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => this.workflowIdSet(n)}
                          >
                            <React.Fragment>
                              {this.state.workflows.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n.id}>{n.name}</Select.Option>
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
                  <p style={{marginRight: 25, float: 'right'}}>Details:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                  { this.state.errors.jsonError ?
                    <React.Fragment>
                      <Input.TextArea
                        defaultValue={jsonPretty()}
                        style={{width: 350, border: `1px solid red`}}
                        rows={10}
                        onBlur={e => this.jsonValidate(e)}
                      />
                      <p style={{color: 'red'}}>{this.state.errors.jsonError}</p>
                    </React.Fragment>
                  :
                    <Input.TextArea
                      defaultValue={jsonPretty()}
                      style={{width: 350}}
                      rows={10}
                      onBlur={e => this.jsonValidate(e)}
                    />
                  }
                  </React.Fragment>
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
            { this.props.identityGroupsError ? <Error component={'permissionAdd workflow'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
            { this.props.workflowsError ? <Error component={'permissionAdd workflow'} error={[this.props.workflowsError]} visible={true} type={'workflowsError'} /> : null }
            { this.props.rolesError ? <Error component={'permissionAdd workflow'} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
            { this.props.newIdentityGroupAddError ? <Error component={'permissionAdd workflow'} error={[this.props.newIdentityGroupAddError]} visible={true} type={'newIdentityGroupAddError'} /> : null }
            { this.props.permissionAddError ? <Error component={'permissionAdd workflow'} error={[this.props.permissionAddError]} visible={true} type={'permissionAddError'} /> : null }
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
  assets: state.workflow.assets,

  identityGroups: state.workflow.identityGroups,
  workflows: state.workflow.workflows,
  permissions: state.workflow.permissions,

  identityGroupsError: state.workflow.identityGroupsError,
  newIdentityGroupAddError: state.workflow.newIdentityGroupAddError,
  workflowsError: state.workflow.workflowsError,
  rolesError: state.workflow.rolesError,
  permissionAddError: state.workflow.permissionAddError,
}))(Add);
