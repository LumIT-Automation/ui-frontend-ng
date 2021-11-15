import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/infobloxError'

import {
  fetchInfobloxRolesError,
  addNewDnError,
  addInfobloxPermissionError,
} from '../../_store/store.permissions'

import {
  setPermissionsFetch,
  setNetworksError,
  setContainersError,
} from '../../_store/store.infoblox'

import { Form, Button, Space, Modal, Spin, Result, AutoComplete, Select } from 'antd';
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
      groupToAdd: false,
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
    console.log(this.state.request)
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

    let identityGroups = Object.assign([], this.props.identityGroups)
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

  setAsset = id => {
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
        this.props.dispatch(fetchInfobloxRolesError(error))
        this.setState({rolesLoading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/roles/?related=privileges`, this.props.token)
    this.setState({rolesLoading: false})
  }

  beautifyPrivileges = () => {
    let fetchedList = Object.assign([], this.state.rolesAndPrivileges)
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
      this.props.dispatch(setNetworksError( nets ))
      await this.setState({networksLoading: false})
      return
    }

    let containers = await this.fetchContainers()
    if (containers.status && containers.status !== 200) {
      this.props.dispatch(setContainersError( containers ))
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

  setNetwork = network => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.network = {}
    request.network.name = network
    this.setState({request: request})
  }

  addNewDn = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let r
    const b = {
      "data":
        {
          "name": request.cn,
          "identity_group_identifier": request.dn
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
        this.setState({loading: false, response: true})
      },
      error => {
        this.props.dispatch(addNewDnError(error))
        r = error
        this.setState({loading: false, response: false, error: error})
      }
    )
    await rest.doXHR(`infoblox/identity-groups/`, this.props.token, b )
    return r
  }

  addPermission = async () => {
    if (this.state.groupToAdd) {
      let awaitDn = await this.addNewDn()
      if (awaitDn.status && awaitDn.status !== 201) {
        return
      }
    }

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
        this.props.dispatch(addInfobloxPermissionError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/permissions/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(setPermissionsFetch(true)), 2030)
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
          <Form
            {...layout}
            name="basic"
            initialValues={this.state.request ? {
              remember: true,
              dn: this.state.request.dn,
              asset: this.state.request.assetId,
              role: this.state.request.role
            }: null}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Distinguished Name"
              name='dn'
              key="dn"
            >
              <React.Fragment>
              { this.state.items && this.state.items.length > 0 ?
                <Select
                  defaultValue={this.state.request.dn}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={n => this.setDn(n)}
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
                :
                <Select disabled value={null} onChange={null}>
                </Select>
              }
              </React.Fragment>
          </Form.Item>

            <Form.Item
              label="Asset"
              name='asset'
              key="asset"
            >
              <Select id='asset' placeholder="select" onChange={id => this.setAsset(id) }>
                {this.props.assets ? this.props.assets.map((a, i) => {
                return (
                  <Select.Option  key={i} value={a.id}>{a.fqdn} - {a.address}</Select.Option>
                )
              }) : null}
              </Select>
            </Form.Item>


              <Form.Item
                label="Role"
                name="role"
                key="role"
              >
              { this.state.rolesLoading ?
                <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
                :
                <Select id='role' onChange={r => this.setRole(r) }>
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
              </Form.Item>


            <Form.Item
              label="Network"
              name="network"
              key="network"
              validateStatus={this.state.errors.networkName}
              help={this.state.errors.networkName ? 'Network not found' : null }
            >

            { this.state.networksLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
              :
              <React.Fragment>
              { this.state.nets && this.state.nets.length > 0?
                <Select
                  defaultValue={this.state.request.network ? this.state.request.network.name : null}
                  showSearch
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
                <Select disabled value={null} onChange={null}>
                </Select>
              }
              </React.Fragment>
            }

            </Form.Item>

            {this.state.message ?
              <Form.Item
                name="message"
                key="message"
              >
                <p style={{color: 'red'}}>{this.state.message}</p>
              </Form.Item>
              :
              null
            }

            <Form.Item
              wrapperCol={ {offset: 6 }}
              name="button"
              key="button"
            >
              { this.state.request.cn && this.state.request.dn && this.state.request.role && this.state.request.network.name && this.state.request.assetId ?
                <Button type="primary" onClick={() => this.addPermission()} >
                  Add Permission
                </Button>
                :
                <Button type="primary" onClick={() => this.addPermission()} disabled>
                  Add Permission
                </Button>
              }
            </Form.Item>

          </Form>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
          { this.props.addInfobloxPermissionError ? <Error component={'add infoblox'} error={[this.props.addInfobloxPermissionError]} visible={true} type={'addInfobloxPermissionError'} /> : null }
          { this.props.fetchInfobloxRolesError ? <Error component={'add infoblox'} error={[this.props.fetchInfobloxRolesError]} visible={true} type={'fetchInfobloxRolesError'} /> : null }
          { this.props.addNewDnError ? <Error component={'add infoblox'} error={[this.props.addNewDnError]} visible={true} type={'addNewDnError'} /> : null }

          { this.props.networksError ? <Error component={'add infoblox'} error={[this.props.networksError]} visible={true} type={'setNetworksError'} /> : null }
          { this.props.containersError ? <Error component={'add infoblox'} error={[this.props.containersError]} visible={true} type={'setContainersError'} /> : null }
          </React.Fragment>
        :
          null
        }
      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,

  fetchInfobloxRolesError: state.permissions.fetchInfobloxRolesError,
  networksError: state.infoblox.networksError,
  containersError: state.infoblox.containersError,
  addNewDnError: state.permissions.addNewDnError,

  addInfobloxPermissionError: state.permissions.addInfobloxPermissionError,

  identityGroups: state.infoblox.identityGroups,
  permissions: state.infoblox.permissions,
  assets: state.infoblox.assets,
}))(Add);
