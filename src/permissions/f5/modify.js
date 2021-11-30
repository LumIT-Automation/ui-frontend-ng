import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import {
  fetchF5RolesError,
  modifyF5PermissionError
} from '../../_store/store.permissions'

import {
  setPermissionsFetch,
  setPartitionsError
} from '../../_store/store.f5'

import { Form, Button, Space, Modal, Spin, Result, AutoComplete, Select } from 'antd';
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
}



class Modify extends React.Component {

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

  details = async () => {
    this.ig()
    this.setState({visible: true})
    let request = {}
    request.cn = this.props.obj.identity_group_name
    request.dn = this.props.obj.identity_group_identifier
    request.role = this.props.obj.role
    request.asset = this.props.obj.asset
    request.partition = this.props.obj.partition
    await this.setState({request: request})
    this.fetchRoles()
    this.fetchPartitions()
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

  setAsset = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.partition.asset_id = id
    this.setState({request: request}, () => this.fetchPartitions())
  }

  fetchRoles = async () => {
    this.setState({rolesLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPrivileges()})
        },
      error => {
        this.props.dispatch(fetchF5RolesError(error))
        this.setState({rolesLoading: false, response: false})
      }
    )
    await rest.doXHR(`f5/roles/?related=privileges`, this.props.token)
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

  fetchPartitions = async (id) => {
    this.setState({partitionsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({partitions: resp.data.items, partitionsLoading: false})
      },
      error => {
        this.props.dispatch(setPartitionsError(error))
      }
    )
    await rest.doXHR(`f5/${this.state.request.partition.asset_id}/partitions/`, this.props.token)
    this.setState({partitionsLoading: false})
  }

  setPartition = partition => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.partition.name = partition
    this.setState({request: request})
  }

  modifyPermission = async () => {

    this.setState({message: null});

    const b = {
      "data":
        {
          "identity_group_name": this.state.request.cn,
          "identity_group_identifier": this.state.request.dn,
          "role": this.state.request.role,
          "partition": {
              "name": this.state.request.partition.name,
              "id_asset": this.state.request.partition.asset_id
          }
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.response()
      },
      error => {
        this.props.dispatch(modifyF5PermissionError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/permission/${this.props.obj.id}/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(setPermissionsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {
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
             title="Modify"
           />
        }
        { !this.state.loading && !this.state.response &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              asset: this.state.request.asset ? `${this.state.request.asset.fqdn} - ${this.state.request.asset.address}` : null,
              role: this.state.request.role,
            }}
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
              label="Partition"
              name="partition"
              key="partition"
              validateStatus={this.state.errors.partitionName}
              help={this.state.errors.partitionName ? 'Partition not found' : null }
            >

            { this.state.partitionsLoading ?
              <Spin indicator={spinIcon} style={{ margin: '0 10%' }}/>
              :
              <React.Fragment>
              { this.state.partitions && this.state.partitions.length > 0 ?
                <Select
                  defaultValue={this.state.request.partition.name}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={n => this.setPartition(n)}
                >
                  {this.state.request.role === 'admin' ?
                    <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                    <React.Fragment>
                    <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    {this.state.partitions.map((n, i) => {
                      return (
                        <Select.Option  key={i} value={n.name}>{n.name}</Select.Option>
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

                  : null
                }

                <Form.Item
                  wrapperCol={ {offset: 6 }}
                  name="button"
                  key="button"
                >
                  { this.state.request.cn && this.state.request.dn && this.state.request.role && this.state.request.partition.name && this.state.request.partition.asset_id ?
                    <Button type="primary" onClick={() => this.modifyPermission()} >
                      Modify Permission
                    </Button>
                    :
                    <Button type="primary" onClick={() => this.modifyPermission()} disabled>
                      Modify Permission
                    </Button>
                  }
                </Form.Item>

              </Form>
            }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
          { this.props.modifyF5PermissionError ? <Error component={'modify f5'} error={[this.props.modifyF5PermissionError]} visible={true} type={'modifyF5PermissionError'} /> : null }
          { this.props.fetchF5RolesError ? <Error component={'modify f5'} error={[this.props.fetchF5RolesError]} visible={true} type={'fetchF5RolesError'} /> : null }

          { this.props.partitionsError ? <Error component={'modify f5'} error={[this.props.partitionsError]} visible={true} type={'setF5PartitionsError'} /> : null }
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

  modifyF5PermissionError: state.permissions.modifyF5PermissionError,
  fetchF5RolesError: state.permissions.fetchF5RolesError,

  partitionsError: state.f5.partitionsError,

  identityGroups: state.f5.identityGroups,
  permissions: state.f5.permissions,
  assets: state.f5.assets,
}))(Modify);
