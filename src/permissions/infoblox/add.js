import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/infobloxError'

import {
  permissionsFetch,
  fetchRolesError,
  addNewDnError,
  addPermissionError,
  identityGroups,
  identityGroupsError,

  networksError,
  containersError,
} from '../../_store/store.infoblox'

import { Button, Modal, Spin, Result, Select, Row, Col, Input } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
}



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      request: {
        network: {}
      }
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
    this.fetchRoles()
  }

  ig = () => {
    let items = []

    let identityGroups = JSON.parse(JSON.stringify(this.props.identityGroups))
    identityGroups.forEach( ig => {
      items.push(ig.identity_group_identifier)
    })
    this.setState({items: items})
  }

  setDn = dn => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.dn = dn

    let cn = this.props.identityGroups.find( ig => {
      return ig.identity_group_identifier === dn
    })
    request.cn = cn.name
    this.setState({request: request})
  }

  setNewDn = async e => {
    let dn = e.target.value
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.items.includes(dn)) {
      errors.newDn = null
      await this.setState({errors: errors})
      this.setDn(dn)
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

  handleNewDn = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (this.state.newDn && this.state.newCn) {

      errors.newDn = null
      await this.setState({errors: errors})

      let awaitDn = await this.addNewDn(this.state.newDn, this.state.newCn)
      this.setState({addDnLoading: false})

      if (awaitDn.status && awaitDn.status !== 201) {
        this.props.dispatch(addNewDnError(awaitDn))
        return
      }

      let identityGroups = await this.fetchIdentityGroups()
      if (identityGroups.status && identityGroups.status !== 200 ) {
        this.props.dispatch(identityGroupsError(identityGroups))
        return
      }
      else {
        this.props.dispatch(identityGroups( identityGroups ))
      }
      this.setDn(this.state.newDn)
    }
    else {
      errors.newDn = 'error'
      this.setState({errors: errors})
    }
  }

  addNewDn = async (dn, cn) => {
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
    await rest.doXHR(`infoblox/identity-groups/`, this.props.token, b )
    return r
  }

  fetchIdentityGroups = async () => {
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

  asset = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.assetId = id
    this.setState({request: request}, () => this.fetchNetworks())
  }

  fetchRoles = async () => {
    this.setState({rolesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPrivileges()})
        },
      error => {
        this.props.dispatch(fetchRolesError(error))
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

  setRole = role => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.role = role
    this.setState({request: request})
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
    await rest.doXHR(`infoblox/${this.state.request.assetId}/networks/`, this.props.token)
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
    await rest.doXHR(`infoblox/${this.state.request.assetId}/network-containers/`, this.props.token)
    return r
  }

  network = network => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.network = {}
    request.network.name = network
    this.setState({request: request})
  }

  addPermission = async () => {
    this.setState({message: null});

    const b = {
      "data":
        {
          "identity_group_name": this.state.request.cn,
          "identity_group_identifier": this.state.request.dn,
          "role": this.state.request.role,
          "network": {
            "name": this.state.request.network.name,
            "id_asset": this.state.request.assetId
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
        this.props.dispatch(addPermissionError(error))
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

  closeModal = () => {
    this.setState({
      visible: false,
      request: {},
      nets: []
    })
  }


  render() {

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
              <Col offset={2} span={6}>
                <p style={{marginRight: 25, float: 'right'}}>Add new Dn (optional):</p>
                {this.state.errors.newDn ? <p style={{color: 'red', marginRight: 25, float: 'right'}}>Error: new DN not set.</p> : null }
              </Col>
              <Col span={16}>
                <Input style={{width: 350}} name="newDn" id='newDn' defaultValue="cn= ,cn= ,dc= ,dc= " onBlur={e => this.setNewDn(e)} />
                <Button icon={addIcon} type='primary' shape='round' style={{marginLeft: 20}} onClick={() => this.handleNewDn()} />
              </Col>
            </Row>


            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 25, float: 'right'}}>Asset:</p>
              </Col>
              <Col span={16}>
                <Select style={{width: 350}} id='asset' onChange={id => this.asset(id) }>
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
                  <Select style={{width: 350}} id='role' onChange={r => this.setRole(r) }>
                    {this.state.rolesBeauty ? this.state.rolesBeauty.map((a, i) => {
                      return (
                        <Select.Option  key={i} value={a}>{a}</Select.Option>
                        )
                      })
                    :
                      null
                    }
                  </Select>
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
                        defaultValue={this.state.network ? this.state.request.network.name : null}
                        showSearch
                        style={{width: 350}}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onChange={n => this.network(n)}
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

            {this.state.message ?
              <p style={{color: 'red'}}>{this.state.message}</p>
            :
              null
            }

            <Row>
              <Col offset={8} span={16}>
                { this.state.request.cn && this.state.request.dn && this.state.request.role && this.state.request.network.name && this.state.request.assetId ?
                  <Button type="primary" onClick={() => this.addPermission()} >
                    Add Permission
                  </Button>
                :
                  <Button type="primary" onClick={() => this.addPermission()} disabled>
                    Add Permission
                  </Button>
                }
              </Col>
            </Row>

          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
          { this.props.addPermissionError ? <Error component={'add infoblox'} error={[this.props.addPermissionError]} visible={true} type={'addPermissionError'} /> : null }
          { this.props.fetchRolesError ? <Error component={'add infoblox'} error={[this.props.fetchRolesError]} visible={true} type={'fetchRolesError'} /> : null }
          { this.props.addNewDnError ? <Error component={'add infoblox'} error={[this.props.addNewDnError]} visible={true} type={'addNewDnError'} /> : null }

          { this.props.networksError ? <Error component={'add infoblox'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
          { this.props.containersError ? <Error component={'add infoblox'} error={[this.props.containersError]} visible={true} type={'containersError'} /> : null }
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

  fetchRolesError: state.infoblox.fetchRolesError,
  addNewDnError: state.infoblox.addNewDnError,

  networksError: state.infoblox.networksError,
  containersError: state.infoblox.containersError,

  addPermissionError: state.infoblox.addPermissionError,

}))(Add);
