import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/infobloxError'

import {
  fetchInfobloxRolesError,
  modifyInfobloxPermissionError
} from '../../_store/store.permissions'

import {
  permissionsFetch,
  networksError,
  containersError
} from '../../_store/store.infoblox'

import { Form, Button, Space, Modal, Spin, Result, AutoComplete, Select, Row, Col } from 'antd';
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
}



class Modify extends React.Component {

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
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
    this.main()
    console.log(this.props.obj)
  }

  main = async () => {
    this.ig()
    let request = {}
    request.cn = this.props.obj.identity_group_name
    request.dn = this.props.obj.identity_group_identifier
    request.role = this.props.obj.role
    request.asset = this.props.obj.asset
    request.network = this.props.obj.network
    await this.setState({request: request})
    this.fetchRoles()
    this.fetchNetworks()
  }

  ig = () => {
    let items = []

    let identityGroups = JSON.parse(JSON.stringify(this.props.identityGroups))
    identityGroups.forEach( ig => {
      items.push(ig.identity_group_identifier)
    })
    this.setState({items: items})
  }


  //FETCH
  fetchRoles = async () => {
    this.setState({rolesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPrivileges()})
        },
      error => {
        this.props.dispatch(fetchInfobloxRolesError(error))
        this.setState({rolesLoading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/roles/?related=privileges`, this.props.token)
    this.setState({rolesLoading: false})
  }

  beautifyPrivileges = () => {
    let fetchedList = JSON.parse(JSON.stringify(this.state.rolesAndPrivileges))
    let newList = []

    for (let r in fetchedList) {
      let newRole = fetchedList[r].role
      newList.push(newRole)
    }
    this.setState({rolesBeauty: newList})
  }

  fetchNetworks = async () => {
    this.setState({networksLoading: true})

    let nets = await this.fetchNets()
    if (nets.status && nets.status !== 200) {
      this.props.dispatch(networksError( nets ))
      await this.setState({networksLoading: false})
      return
    }

    let containers = await this.fetchContainers()
    if (containers.status && containers.status !== 200) {
      this.props.dispatch(containersError( containers ))
      await this.setState({networksLoading: false})
      return
    }

    let networks = nets.concat(containers)
    this.setState({nets: networks, networksLoading: false})
  }

  fetchNets = async () => {
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
    await rest.doXHR(`infoblox/${this.state.request.network.asset_id}/networks/`, this.props.token)
    return r
  }

  fetchContainers = async () => {
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
    await rest.doXHR(`infoblox/${this.state.request.network.asset_id}/network-containers/`, this.props.token)
    return r
  }



  //SETTER
  setDn = dn => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.dn = dn

    let cn = this.props.identityGroups.find( ig => {
      return ig.identity_group_identifier === dn
    })
    request.cn = cn.name
    this.setState({request: request})
  }

  setAsset = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.network.asset_id = id
    this.setState({request: request}, () => this.fetchNetworks())
  }

  setRole = role => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.role = role
    this.setState({request: request})
  }

  setNetwork = net => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.network.name = net
    this.setState({request: request})
  }




  //VALIDATION
  validation = async () => {
    if (this.state.request.cn && this.state.request.dn && this.state.request.role && this.state.request.network.name && this.state.request.network.asset_id) {
      this.modifyPermission()
    }
  }




  modifyPermission = async () => {

    const b = {
      "data":
        {
          "identity_group_name": this.state.request.cn,
          "identity_group_identifier": this.state.request.dn,
          "role": this.state.request.role,
          "network": {
            "name": this.state.request.network.name,
            "id_asset": this.state.request.network.asset_id
          }
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(modifyInfobloxPermissionError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/permission/${this.props.obj.id}/`, this.props.token, b )
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
    })
  }


  render() {

    let name = () => {
      let n = `${this.state.request.asset.fqdn} - ${this.state.request.asset.address}`
      return n
    }

    return (
      <React.Fragment>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY PERMISSION</p>}
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
             title="Permission modified"
           />
        }
        { !this.state.loading && !this.state.response &&
          <React.Fragment>
            <Row>
              { this.state.items && this.state.items.length > 0 ?
                <React.Fragment>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 25, float: 'right'}}>Distinguished Name:</p>
                  </Col>
                  <Col span={16}>
                    <Select
                      defaultValue={this.state.request.dn}
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
                      onSelect={n => this.setDn(n)}
                    >
                      <React.Fragment>
                        {this.state.items.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n}>{n}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  </Col>
                </React.Fragment>
              :
                <React.Fragment>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 25, float: 'right'}}>Distinguished Name:</p>
                  </Col>
                  <Col>
                    <Select disabled value={null} onChange={null}>
                    </Select>
                  </Col>
                </React.Fragment>
              }
            </Row>
            <br/>

            <Row>
              <React.Fragment>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 25, float: 'right'}}>Asset:</p>
                </Col>
                { this.state.request && this.state.request.asset ?
                  <Col span={16}>
                    <Select style={{width: 350}} defaultValue={name()} id='asset' onChange={id => this.setAsset(id) }>
                      {this.props.assets ? this.props.assets.map((a, i) => {
                        return (
                          <Select.Option  key={i} value={a.id}>{a.fqdn} - {a.address}</Select.Option>
                        )
                        })
                      :
                        null
                      }
                    </Select>
                  </Col>
                :
                  <Col>
                    <Select style={{width: 350}} disabled value={null} onChange={null}>
                    </Select>
                  </Col>
                }
              </React.Fragment>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 25, float: 'right'}}>Role:</p>
              </Col>

              <Col span={16}>
                { this.state.rolesLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
                :
                  <React.Fragment>
                    { this.state.request && this.state.request.role ?
                      <Select style={{width: 350}} id='role' defaultValue={this.state.request.role} onChange={r => this.setRole(r) }>
                        {this.state.rolesBeauty ? this.state.rolesBeauty.map((a, i) => {
                          return (
                            <Select.Option  key={i} value={a}>{a}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </Select>
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
              <Col offset={2} span={6}>
                <p style={{marginRight: 25, float: 'right'}}>Network:</p>
              </Col>
              <Col span={16}>
                { this.state.networksLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
                :
                  <React.Fragment>
                      { (this.state.nets && this.state.nets.length > 0) ?
                        <Select
                          defaultValue={this.state.request.network ? this.state.request.network.name : null}
                          showSearch
                          style={{width: 350}}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                          }
                          onChange={n => this.setNetwork(n)}
                        >
                          {this.state.request.role === 'admin' ?
                            <Select.Option key={'any'} value={'any'}>any</Select.Option>
                          :
                            <React.Fragment>
                              <Select.Option key={'any'} value={'any'}>any</Select.Option>
                              {this.state.nets.map((n, i) => {
                                return (
                                    <Select.Option key={i} value={n.network}>{n.network}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          }
                        </Select>
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
                <Button type="primary" onClick={() => this.validation()} >
                  Modify Permission
                </Button>
              </Col>
            </Row>

          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
          { this.props.modifyInfobloxPermissionError ? <Error component={'modify infoblox'} error={[this.props.modifyInfobloxPermissionError]} visible={true} type={'modifyInfobloxPermissionError'} /> : null }
          { this.props.fetchInfobloxRolesError ? <Error component={'modify infoblox'} error={[this.props.fetchInfobloxRolesError]} visible={true} type={'fetchInfobloxRolesError'} /> : null }

          { this.props.networksError ? <Error component={'modify infoblox'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
          { this.props.containersError ? <Error component={'modify infoblox'} error={[this.props.containersError]} visible={true} type={'containersError'} /> : null }
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

  modifyInfobloxPermissionError: state.permissions.modifyInfobloxPermissionError,
  fetchInfobloxRolesError: state.permissions.fetchInfobloxRolesError,

  networksError: state.infoblox.networksError,
  containersError: state.infoblox.containersError,

  identityGroups: state.infoblox.identityGroups,
  permissions: state.infoblox.permissions,
  assets: state.infoblox.assets,
}))(Modify);
