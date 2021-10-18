import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import {
  setPermissionsFetch,
  setRealNetworks,
  setRealNetworksFetch,
} from '../../_store/store.infoblox'

import { Form, Input, Button, Space, Modal, Radio, Spin, Result, AutoComplete, Select } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
/*

*/

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
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
      body: {
        network: {

        }
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
    this.setState({visible: true})
  }

  onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  onSearch = (searchText) => {
    let permissions = Object.assign([], this.props.permissions)
    let gi = []
    let items = []
    let options = []

    permissions.forEach(p => {
      gi.push(p.identity_group_identifier)
    })

    items = gi.filter(this.onlyUnique);

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
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)
    let dn

    if (e) {
      if (e.target) {
        console.log('e.target.')
        dn = e.target.value
        this.setState({groupToAdd: true})
      }
      else {
        console.log('')
        dn = e
        this.setState({groupToAdd: false})
      }

      let list = dn.split(',')
      let cns = []

      let found = list.filter(i => {
        let iLow = i.toLowerCase()
        if (iLow.startsWith('cn=')) {
          let cn = iLow.split('=')
          cns.push(cn[1])
        }
      })

      body.dn = dn
      body.cn = cns[0]
      delete errors.dnError
    }
    else {
      errors.dnError = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  setAsset = id => {
    let body = Object.assign({}, this.state.body)
    body.assetId = id
    body.network.id_asset = id
    this.setState({body: body}, () => this.fetchNetworks())
  }

  fetchNetworks = async () => {
    let tree = await this.fetchTree()
    this.setState({tree: tree})

    let realNetworks = await this.filterRealNetworks()
    this.props.dispatch(setRealNetworks( realNetworks ))
  }

  fetchTree = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data['/'].children
      },
      error => {
        this.props.dispatch(setError( error ))
      }
    )
    await rest.doXHR(`infoblox/${this.state.body.assetId}/tree/`, this.props.token)
    return r
  }

  filterRealNetworks = () => {
    let realNetworks = []
    let list = []

    this.state.tree.forEach(e => {
      if (e.extattrs["Real Network"]) {
        if (e.extattrs["Real Network"].value === 'yes') {
          //let n = e.network.split('/')
          //n = n[0]
          let o = e
          realNetworks.push(o)
        }
      }
    })
    return realNetworks
  }

  setNetwork = n => {
    console.log(n)
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    if (n) {
      body.network.name = n
      delete errors.networkName
    }
    else {
      errors.networkName = 'error'
    }
    this.setState({body: body, errors: errors})
  }

  fetchRoles = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPrivileges()})
        },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`infoblox/roles/?related=privileges`, this.props.token)
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

  addNewDn = async () => {
    console.log('cicciput')
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    let r
    const b = {
      "data":
        {
          "name": body.cn,
          "identity_group_identifier": body.dn
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
        this.setState({loading: false, success: true})
      },
      error => {
        r = error
        this.setState({loading: false, success: false, error: error})
      }
    )
    await rest.doXHR(`infoblox/identity-groups/`, this.props.token, b )
    return r
  }

  addPermission = async () => {

    if (this.state.groupToAdd) {
      console.log('devo aggiungernlo')
      await this.addNewDn()
    }

    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    this.setState({message: null});
    console.log(body)

    const b = {
      "data":
        {
          "identity_group_name": this.state.body.cn,
          "identity_group_identifier": this.state.body.dn,
          "role": this.state.body.role,
          "network": {
              "name": "10.8.0.0/17",
              "id_asset": this.state.body.assetId
          }
        }
      }

    /*
    const b = {
      "data": {
        "identity_group_name": "groupAdmin",
        "identity_group_identifier": "cn=groupadmin,cn=users,dc=lab,dc=local",
        "role": "admin",
        "network": {
            "name": "10.8.0.0/17",
            "id_asset": 1
        }
      }
    }
    */
    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.success()
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`infoblox/permissions/`, this.props.token, b )

  }


  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
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
    console.log(this.state.body)
    console.log(this.state.groupToAdd)
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
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.success &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
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
              label="Networks"
              name="networks"
              key="networks"
            >
              <Select id='networks' onChange={n => this.setNetwork(n) }>
                  <Select.Option  key={'any'} value={'any'}>any</Select.Option>
                {this.props.realNetworks ? this.props.realNetworks.map((a, i) => {
                return (
                  <Select.Option  key={i} value={a.network}>{a.network}</Select.Option>
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
              wrapperCol={ {offset: 6 }}
              name="button"
              key="button"
            >
              <Button type="primary" onClick={() => this.addPermission()}>
                Add Permission
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  permissions: state.infoblox.permissions,
  assets: state.infoblox.assets,
  realNetworks: state.infoblox.realNetworks
}))(Add);
