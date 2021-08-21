import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setAssetList } from '../../_store/store.f5'
import { setF5Permissions, setF5PermissionsBeauty } from '../../_store/store.permissions'

import { Form, Input, Button, Space, Modal, Spin, Result, Select } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
}

class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      body: {}
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    /*if (prevState.body.assetId !== this.state.body.assetId) {
      console.log(this.state.body.assetId)
      this.fetchAssetPartitions(this.state.body.assetId)
    }*/
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.setValues()
  }

  setValues = () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    body.dn = this.props.obj.dn
    body.name = this.props.obj.name
    body.role = this.props.obj.role
    body.assetId = this.props.obj.assetId
    body.partition = this.props.obj.partition
    delete errors.dnError

    this.setState({body: body, errors: errors}, () => {this.fetchAssetPartitions(this.state.body.assetId)})
  }

  setDistinguishedName = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    switch(e.target.id) {
      case 'dn':
        if (e.target.value) {
          let dn = e.target.value
          let first = dn.split(",")
          let name = first[0].split("=")
          body.dn = e.target.value
          body.name = name[1]
          delete errors.dnError
        }
        else {
          errors.dnError = 'error'
        }
        this.setState({body: body, errors: errors})
        break
      default:
    }
  }

  setAsset = id => {
    let body = Object.assign({}, this.state.body);
    body.assetId = id
    this.setState({body: body}, () => {this.fetchAssetPartitions(id)})
  }

  fetchAssetPartitions = async (id) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.setState({partitions: resp.data.items})
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.state.body.assetId}/partitions/`, this.props.token)
  }

  setPartition = partition => {
    let body = Object.assign({}, this.state.body);
    body.partition = partition
    this.setState({body: body})
  }

  fetchRoles = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPrivileges()})
        },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/roles/?related=privileges`, this.props.token)
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
    let body = Object.assign({}, this.state.body);
    body.role = role
    this.setState({body: body})
  }

  modifyPermission = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    this.setState({message: null});

    const b = {
      "data":
        {
          "identity_group_name": this.state.body.name,
          "identity_group_identifier": this.state.body.dn,
          "role": this.state.body.role,
          "partition": {
              "name": this.state.body.partition,
              "id_asset": this.state.body.assetId
          }
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, success: true}, () => {this.fetchPermissions()})
        this.success()
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/permission/${this.props.obj.permissionId}/`, this.props.token, b )

  }

  fetchPermissions = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Permissions(resp))
        this.permissionsInRows()
        },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/permissions/`, this.props.token)
  }

  permissionsInRows = () => {

    let permissions = Object.assign([], this.props.f5Permissions)
    let list = []

    for ( let p in permissions) {
      let asset = this.props.assetList.find(a => a.id === permissions[p].partition.asset_id)
      let permissionId = permissions[p].id
      let name = permissions[p].identity_group_name
      let dn = permissions[p].identity_group_identifier
      let role = permissions[p].role
      let assetId = permissions[p].partition.asset_id
      let partition = permissions[p].partition.name
      let fqdn = asset.fqdn
      let address = asset.address

      list.push({
        permissionId: permissionId,
        name: name,
        dn: dn,
        role: role,
        assetId: assetId,
        partition: partition,
        fqdn: fqdn,
        address: address
      })
    }
    this.props.dispatch(setF5PermissionsBeauty(list))
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
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
      <Space direction='vertical'>

          <Button type="primary" onClick={() => this.details()}>
            Modify Permission
          </Button>

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
          { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.success &&
            <Result
               status="success"
               title="Updated"
             />
          }
          { !this.state.loading && !this.state.success &&
            <Form
              {...layout}
              name="basic"
              initialValues={{
                remember: true,
                dn: this.state.body.dn,
                asset: this.state.body.assetId,
                partition: this.state.body.partition,
                role: this.state.body.role
              }}
              onFinish={null}
              onFinishFailed={null}
            >
              <Form.Item
                label="Distinguished Name"
                name="dn"
                key="dn"
              >
                {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
                <Input id='dn' onBlur={e => this.setDistinguishedName(e)} />
              </Form.Item>

              <Form.Item
                label="Asset"
                name='asset'
                key="asset"
              >
                <Select id='asset' onChange={id => this.setAsset(id) }>
                  {this.props.assetList ? this.props.assetList.map((a, i) => {
                  return (
                    <Select.Option  key={i} value={a.id}>{a.fqdn} - {a.address}</Select.Option>
                  )
                }) : null}
                </Select>
              </Form.Item>

              <Form.Item
                label="Partition"
                name="partition"
                key="partition"
              >
                <Select id='partition' onChange={p => this.setPartition(p) }>
                  <Select.Option  key={'any'} value={'any'}>any</Select.Option>
                  {this.state.partitions ? this.state.partitions.map((a, i) => {
                  return (
                    <Select.Option  key={i} value={a.name}>{a.name}</Select.Option>
                  )
                }) : null}
                </Select>
              </Form.Item>

              <Form.Item
                label="Role"
                name="role"
                key="role"
              >
                <Select id='role' onFocus={() => this.fetchRoles()} onChange={r => this.setRole(r) }>
                  {this.state.rolesBeauty ? this.state.rolesBeauty.map((a, i) => {
                  return (
                    <Select.Option  key={i} value={a}>{a}</Select.Option>
                  )
                }) : null}
                </Select>
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
                wrapperCol={ {offset: 8 }}
                name="button"
                key="button"
              >
                <Button type="primary" onClick={() => this.modifyPermission()}>
                  Modify Permission
                </Button>
              </Form.Item>

            </Form>
          }
          </Modal>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  assetList: state.f5.assetList,
  f5Permissions: state.permissions.f5Permissions,
  f5PermissionsBeauty: state.permissions.f5PermissionsBeauty
}))(Modify);
