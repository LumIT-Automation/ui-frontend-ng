import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

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
      error: null,
      errors: {
      },
      message:'',
      groupToAdd: false,
      network: '',
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
    console.log('update')
    console.log(this.props.addNewDnError)
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.fetchRoles()
  }

  onSearch = (searchText) => {
    let items = []
    let options = []

    let identityGroups = Object.assign([], this.props.identityGroups)
    identityGroups.forEach( ig => {
      items.push(ig.identity_group_identifier)
    })

    let matchFound = items.filter(a =>{
      return a.toLowerCase().includes(searchText.toLowerCase())
    })

    for(var i=0; i<matchFound.length; i++)  {
      options = [...options, {"label": matchFound[i], "value": matchFound[i]}]
    }

    this.setState({
      options: options,
      items: items,
    })
  }

  selectDn = e => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)
    let dn

    if (e) {
      if (e.target) {
        dn = e.target.value
      }
      else {
        dn = e
      }

      if (this.state.items.includes(dn)) {
        this.setState({groupToAdd: false})
        request.dn = dn
        let cn = this.props.identityGroups.find( ig => {
          return ig.identity_group_identifier === dn
        })
        request.cn = cn.name
        delete errors.dnError
      }
      else {
        this.setState({groupToAdd: true})
        let list = dn.split(',')
        let cns = []

        let found = list.filter(i => {
          let iLow = i.toLowerCase()
          if (iLow.startsWith('cn=')) {
            let cn = iLow.split('=')
            cns.push(cn[1])
          }
        })

        request.dn = dn
        request.cn = cns[0]
        delete errors.dnError
      }

    }
    else {
      errors.dnError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setAsset = id => {
    let request = Object.assign({}, this.state.request)
    request.assetId = id
    //request.network.id_asset = id
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
        this.setState({loading: false, response: false})
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
    let request = Object.assign({}, this.state.request);
    request.role = role
    this.setState({request: request})
  }

  fetchNetworks = async () => {
    this.setState({networksLoading: true})

    let nets = await this.fetchNets()
    if (nets.status && nets.status !== 200) {
      await this.setState({networksLoading: false})
      return
    }

    let containers = await this.fetchContainers()
    if (containers.status && containers.status !== 200) {
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
        this.props.dispatch(setNetworksError( error ))
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
        this.props.dispatch(setContainersError( error ))
        r = error
      }
    )
    await rest.doXHR(`infoblox/${this.state.request.assetId}/network-containers/`, this.props.token)
    return r
  }

  setNetwork = n => {
    let request = Object.assign({}, this.state.request)
    let errors = Object.assign({}, this.state.errors)

    if (n) {
      if (n === 'any') {
        request.network.name = 'any'
        delete errors.networkName
      }
      else {
        request.network.name = n
        delete errors.networkName
      }
    }
    else {

      errors.networkName = 'error'
    }

    this.setState({request: request, network: n, errors: errors})
  }

  addNewDn = async () => {
    let request = Object.assign({}, this.state.request)
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

  resetError = () => {
    this.setState({ error: null})
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
      network: ''
    })
  }


  render() {

    return (
      <Space direction='vertical'>

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
            initialValues={{
              remember: true,
              dn: this.state.request.dn,
              asset: this.state.request.assetId,
              role: this.state.request.role
            }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Distinguished Name"
              name='dn'
              key="dn"
            >
              <AutoComplete
                 options={this.state.options}
                 onSearch={this.onSearch}
                 onSelect={this.selectDn}
                 onBlur={this.selectDn}
                 placeholder="cn=..."
               />
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
              label="Networks"
              name="networks"
              key="networks"
              validateStatus={this.state.errors.networkName}
              help={this.state.errors.networkName ? 'Network not found' : null }
            >

            { this.state.networksLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
              :
              <React.Fragment>
              { this.state.nets && this.state.nets.length > 0?
                <Select
                  defaultValue={this.state.network ? this.state.network : null}
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
                        <Select.Option  key={i} value={n.network}>{n.network}</Select.Option>
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

        { this.props.fetchInfobloxRolesError ? <Error error={[this.props.fetchInfobloxRolesError]} visible={true} type={'fetchInfobloxRolesError'} /> : null }
        { this.props.networksError ? <Error error={[this.props.networksError]} visible={true} type={'setInfobloxNetworksError'} /> : null }
        { this.props.containersError ? <Error error={[this.props.containersError]} visible={true} type={'setInfobloxContainersError'} /> : null }
        { this.props.addNewDnError ? <Error error={[this.props.addNewDnError]} visible={true} type={'addNewDnError'} /> : null }
        { this.props.addInfobloxPermissionError ? <Error error={[this.props.addInfobloxPermissionError]} visible={true} type={'addInfobloxPermissionError'} /> : null }

      </Space>

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
