import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Select, Row, Col } from 'antd'
import { LoadingOutlined, EditOutlined } from '@ant-design/icons'

import Rest from "../../_helpers/Rest"
import Error from '../error'

import {
  permissionsFetch,
  rolesError,
  permissionModifyError,
  identityGroups,
  identityGroupsError,

  partitionsError
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

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
    if (this.state.request.assetId && (prevState.request.assetId !== this.state.request.assetId)) {
      this.partitionsGet()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main()
  }

  main = async () => {
    let obj = JSON.parse(JSON.stringify(this.props.obj))
    let request = {}
    request.cn = obj.identity_group_name
    request.identityGroupId = obj.identity_group_identifier
    request.role = obj.role
    request.asset = obj.asset
    request.assetId = obj.asset.id
    request.partition = obj.partition
    await this.setState({request: request})

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
        this.setState({partitions: null, partitionsLoading: false})
      }
    )
    await rest.doXHR(`f5/${this.state.request.assetId}/partitions/`, this.props.token)
  }


  //SET
  identityGroupIdSet = async identityGroupId => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.identityGroupId = identityGroupId

    let cn = this.props.identityGroups.find( ig => {
      return ig.identity_group_identifier === identityGroupId
    })
    request.cn = cn.name
    await this.setState({request: request})
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

    if (!request.partition) {
      errors.partitionError = true
      this.setState({errors: errors})
      }
    else {
      delete errors.partitionError
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.permissionModify()
    }
  }


  //DISPOSAL ACTION
  permissionModify = async () => {
    let b = {}
    b.data = {
      "identity_group_name": this.state.request.cn,
      "identity_group_identifier": this.state.request.identityGroupId,
      "role": this.state.request.role,
      "partition": {
        "name": this.state.request.partition.name,
        "id_asset": this.state.request.assetId
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.response()
      },
      error => {
        this.props.dispatch(permissionModifyError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/permission/${this.props.obj.id}/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(permissionsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = async () => {
    await this.setState({
      visible: false,
      request: {},
      partitions: []
    })
  }


  render() {
    return (
      <React.Fragment>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify permission</p>}
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
               title="Modifyed"
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
                            style={{width: 350, border: `1px solid red}`}}
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
                              value={this.state.request.partition ? this.state.request.partition.name : null}
                              showSearch
                              style={{width: 350, border: `1px solid red`}}
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
                              value={this.state.request.partition ? this.state.request.partition.name : null}
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
                    Modify Permission
                  </Button>
                </Col>
              </Row>

            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.identityGroupsError ? <Error component={'permissionModify f5'} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
            { this.props.rolesError ? <Error component={'permissionModify f5'} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
            { this.props.partitionsError ? <Error component={'permissionModify f5'} error={[this.props.partitionsError]} visible={true} type={'partitionsError'} /> : null }
            { this.props.permissionModifyError ? <Error component={'permissionModify f5'} error={[this.props.permissionModifyError]} visible={true} type={'permissionModifyError'} /> : null }
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
  identityGroupsError: state.f5.identityGroupsError,
  partitionsError: state.f5.partitionsError,
  permissionModifyError: state.f5.permissionModifyError,
}))(Modify);
