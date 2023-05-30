import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'
import RolesDescription from './rolesDescription'

import { Space, Table, Input, Button, Checkbox, Select, Spin, Progress } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';


import {
  assetsError,
  subAssetsError,
  networksError,
  containersError,

  rolesError,
  identityGroupsError,
  permissionsError,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

//import List from './list'



class Permission extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    this.setState({permissions: []})
    if (!this.props.assetsError && !this.props.identityGroupsError && !this.props.permissionsError) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
    if (this.state.permissionsRefresh) {
      this.setState({permissionsRefresh: false})
      this.main()
    }
  }

  componentWillUnmount() {
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        }
        else if ( Array.isArray(dataIndex) ) {
          let r = record[dataIndex[0]]
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase())
        }
        else {
          return ''
        }
      }
      catch (error){

      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text => {
      return this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };


  main = async () => {
    let fetchedAssets,
    fetchedIdentityGroups,
    fetchedRoles,
    fetchedPermissions,
    identityGroupsNoWorkflowLocal,
    permissionsNoWorkflowLocal,
    permissionsWithAssets

    let subAsset, subAssets
    switch (this.props.vendor) {
      case 'infoblox':
        subAsset = 'network'
        subAssets = 'networks'
        break;
      case 'checkpoint':
        subAsset = 'domain'
        subAssets = 'domains'
        break;
      case 'f5':
        subAsset = 'partition'
        subAssets = 'partitions'
        break;
      case 'vmware':
        subAsset = 'object'
        subAssets = 'objects'
        break;
      default:

    }

    await this.setState({loading: true, subAssets: subAssets, subAsset: subAsset})

    fetchedAssets = await this.dataGet('assets')
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      await this.setState({loading: false})
      return
    }
    else {
      let assets = []
      fetchedAssets.data.items.forEach((item, i) => {
        item[subAssets] = []
        assets.push(item)
      });

      await this.setState({assets: assets})
    }

    await this.assetWithSubAssets()

    fetchedRoles = await this.dataGet('roles')
    if (fetchedRoles.status && fetchedRoles.status !== 200 ) {
      this.props.dispatch(rolesError(fetchedRoles))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({roles: fetchedRoles.data.items})
    }

    fetchedIdentityGroups = await this.dataGet('identity-groups')
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      await this.setState({loading: false})
      return
    }
    else {
      identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
      await this.setState({identityGroups: identityGroupsNoWorkflowLocal})
    }

    fetchedPermissions = await this.dataGet('permissions')
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      this.props.dispatch(permissionsError(fetchedPermissions))
      await this.setState({loading: false})
      return
    }
    else {
      permissionsNoWorkflowLocal = fetchedPermissions.data.items.filter(r => r.identity_group_name !== 'workflow.local');
      permissionsWithAssets = await this.permsWithAsset(permissionsNoWorkflowLocal)
      permissionsWithAssets.forEach((item, i) => {
        item.existent = true
        item.isModified = {}
      });

      await this.setState({permissions: permissionsWithAssets, originPermissions: permissionsWithAssets})
    }

  await this.setState({loading: false})
  }

  dataGet = async (entities, assetId) => {
    let endpoint = `${this.props.vendor}/${entities}/`
    let r
    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, this.props.token)
    return r
  }

  assetWithSubAssets = async () => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let subAssetsFetched

    try {
      for (const asset of Object.values(assets)) {
        await this.setState({assets: assets})

        switch (this.state.subAssets) {
          case 'networks':
            subAssetsFetched = await this.networksGet(asset.id)
            break;
          case 'domains':
            subAssetsFetched = await this.dataGet('domains', asset.id)
            break;
          case 'partitions':
            subAssetsFetched = await this.dataGet('partitions', asset.id)
            break;
          case 'objects':
            subAssetsFetched = []
            break;
          default:
        }

        console.log('subAssetsFetched', subAssetsFetched)

        if (subAssetsFetched.status && subAssetsFetched.status !== 200 ) {
          this.props.dispatch(subAssetsError(subAssetsFetched))
          await this.setState({assets: assets})
          return
        }
        else {
          if (subAssetsFetched.data && subAssetsFetched.data.items) {
            asset[this.state.subAssets] = subAssetsFetched.data.items
          }
          else {
            asset[this.state.subAssets] = subAssetsFetched
          }

          await this.setState({assets: assets})
        }
      };
      return assets
    } catch(error) {
      console.log(error)
      return assets
    }
  }

  networksGet = async (assetId) => {
    let nets = await this.dataGet('networks', assetId)
    if (nets.status && nets.status !== 200) {
      this.props.dispatch(networksError( nets ))
      return
    }

    let containers = await this.dataGet('network-containers', assetId)
    if (containers.status && containers.status !== 200) {
      this.props.dispatch(containersError( containers ))
      return
    }

    let networks = nets.data.concat(containers.data)
    return networks
  }


  permsWithAsset = async (permissions) => {
    try {
      Object.values(permissions).forEach((perm, i) => {
        let asset = this.state.assets.find(a => a.id === perm[this.state.subAsset].id_asset)
        perm.asset = asset
        perm.assetFqdn = asset.fqdn
      });
      return permissions
    } catch(error) {
      console.log(error)
      return permissions
    }
  }

  permissionsRefresh = async () => {
    await this.setState({permissionsRefresh: true})
  }


  permissionAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(this.state.permissions))

    this.state.permissions.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });
    n = id + 1
    p.id = n
    p.asset = {}
    p.assetFqdn = ''
    p.identity_group_identifier = ''
    p.identity_group_name = ''
    p[this.state.subAsset] = {}
    p.role = ''
    list.push(p)

    await this.setState({permissions: list})
  }

  permissionRemove = async p => {
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let newList = permissions.filter(n => {
      return p.id !== n.id
    })
    await this.setState({permissions: newList})
  }


  set = async (key, value, permission) => {
    console.log('key', key)
    console.log('value', value)
    console.log('permission', permission)

    //console.log('this.state.assets', this.state.assets)
    //console.log('this.state.identityGroups', this.state.identityGroups)
    console.log('originPermissions', this.state.originPermissions)


    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let identityGroups = JSON.parse(JSON.stringify(this.state.identityGroups))
    let permissions = JSON.parse(JSON.stringify(this.state.permissions))
    let origPerm = this.state.originPermissions.find(p => p.id === permission.id)
    let perm = permissions.find(p => p.id === permission.id)


    if (key === 'identity_group_identifier') {
      if (value) {
        let ig = identityGroups.find(i => i.identity_group_identifier === value)
        if (perm.existent) {
          if (ig.identity_group_identifier !== origPerm.identity_group_identifier) {
            perm.isModified.identity_group_identifier = true
            perm.identity_group_identifier = ig.identity_group_identifier
            perm.identity_group_name = ig.name
          }
          else {
            delete perm.isModified.identity_group_identifier
            perm.identity_group_identifier = ig.identity_group_identifier
            perm.identity_group_name = ig.name
          }
        }
        else {
          perm.identity_group_identifier = ig.identity_group_identifier
          perm.identity_group_name = ig.name
        }
      }
    }

    if (key === 'role') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm.role) {
            perm.isModified.role = true
            perm.role = value
          }
          else {
            delete perm.isModified.role
            perm.role = value
          }
        }
        else {
          perm.role = value
        }
      }
    }

    if (key === 'assetId') {
      if (value) {
        let asset = assets.find(a => a.id === value)
        console.log('asset', asset)
        if (perm.existent) {
          if (asset.id !== origPerm.asset.id) {
            perm.isModified.subAsset_assetId = true
            perm.isModified.subAsset_name = true
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            perm[this.state.subAsset] = {id_asset: value}
          }
          else {
            delete perm.isModified.subAsset_assetId
            perm.asset = asset
            perm.assetFqdn = asset.fqdn
            perm[this.state.subAsset] = {id_asset: value}
            perm.isModified.subAsset_name = true
          }
        }
        else {
          perm.asset = asset
          perm.assetFqdn = asset.fqdn
          perm[this.state.subAsset] = {id_asset: value}
        }
      }
    }

    if (key === 'subAsset') {
      if (value) {
        if (perm.existent) {
          if (value !== origPerm[this.state.subAsset].name) {
            perm.isModified.subAsset_name = true
            perm[this.state.subAsset].name = value
          }
          else {
            delete perm.isModified.subAsset_name
            perm[this.state.subAsset].name = value
          }
        }
        else {
          perm[this.state.subAsset].name = value
        }
      }
    }

    if (key === 'toDelete') {
      if (value) {
        perm.toDelete = true
      }
      else {
        delete perm.toDelete
      }
    }
    await this.setState({permissions: permissions})
  }


  render() {
    //console.log('assets', this.state.assets)
    console.log('subAssets', this.state.subAssets)
    console.log('subAsset', this.state.subAsset)
    //console.log('roles', this.state.roles)
    console.log('permissions', this.state.permissions)

    let returnCol = () => {
      return vendorColumns
    }

    const vendorColumns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'AD group name',
        align: 'center',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
        ...this.getColumnSearchProps('identity_group_name'),
      },
      {
        title: 'Distinguished name',
        align: 'center',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
        ...this.getColumnSearchProps('identity_group_identifier'),
        render: (name, obj)  => (
          <Select
            value={obj.identity_group_identifier}
            showSearch
            style=
            { obj.identity_group_identifierError ?
              {width: '100%', border: `1px solid red`}
            :
              {width: '100%'}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('identity_group_identifier', value, obj )}
          >
            { this.state.identityGroups.map((ig, i) => {
                return (
                  <Select.Option key={i} value={ig.identity_group_identifier}>{ig.identity_group_identifier}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      {
        title: 'Asset',
        align: 'center',
        dataIndex: 'assetFqdn',
        key: 'assetFqdn',
        ...this.getColumnSearchProps('assetFqdn'),
        render: (name, obj)  => (
          <Select
            value={obj.assetFqdn}
            showSearch
            style=
            { obj.assetFqdnError ?
              {width: 150, border: `1px solid red`}
            :
              {width: 150}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('assetId', value, obj )}
          >
            { this.state.assets.map((ass, i) => {
                return (
                  <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
                )
              })
            }
          </Select>
        ),
      },
      ...(
        this.props.vendor === 'infoblox' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={!obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj.networkError ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.network ? sub.network : ''}>{sub.network ? sub.network : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
        :
          this.props.vendor === 'checkpoint' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={!obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj.networkError ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.name ? sub.name : ''}>{sub.name ? sub.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
          :
          this.props.vendor === 'f5' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={!obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj.networkError ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.name ? sub.name : ''}>{sub.name ? sub.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
          :
          this.props.vendor === 'vmware' ?
          [
            {
              title: this.state.subAsset,
              align: 'center',
              dataIndex: [this.state.subAsset, 'name' ],
              key: this.state.subAsset,
              ...this.getColumnSearchProps([this.state.subAsset, 'name' ]),
              render: (name, obj)  => (
                  <Select
                    value={obj && obj[this.state.subAsset] ? obj[this.state.subAsset].name : null}
                    disabled={!obj[this.state.subAsset].id_asset ? true : false}
                    showSearch
                    style=
                    { obj.networkError ?
                      {width: 150, border: `1px solid red`}
                    :
                      {width: 150}
                    }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={value => this.set('subAsset', value, obj )}
                  >
                    {obj && obj.role && obj.role === 'admin' ?
                      <Select.Option key={'any'} value={'any'}>any</Select.Option>
                    :
                      <React.Fragment>
                        <Select.Option key={'any'} value={'any'}>any</Select.Option>
                        { (obj && obj.asset && obj.asset[this.state.subAssets]) ? obj.asset[this.state.subAssets].map((sub, i) => {
                            return (
                              <Select.Option key={i} value={sub.name ? sub.name : ''}>{sub.name ? sub.name : ''}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </React.Fragment>
                    }

                  </Select>
              ),
            },
          ]
        :
        []
      ),
      {
        title: <RolesDescription vendor={this.props.vendor} title={`roles' description`}/>,
        align: 'center',
        dataIndex: 'role',
        key: 'role',
        ...this.getColumnSearchProps('role'),
        render: (name, obj)  => (
          <Select
            value={obj && obj.role ? obj.role : null}
            showSearch
            style=
            { obj.roleError ?
              {width: 150, border: `1px solid red`}
            :
              {width: 150}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => this.set('role', value, obj )}
          >
            { (this.state.roles ? this.state.roles.map((role, i) => {
                return (
                  <Select.Option key={i} value={role.role ? role.role : ''}>{role.role ? role.role : ''}</Select.Option>
                )
              })
            :
              null
            )}
          </Select>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                shape='round'
                onClick={(e) => this.permissionRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>
        {this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>

            <Button onClick={() => this.permissionsRefresh()}>
              <ReloadOutlined/>
            </Button>
            <Button type="primary" onClick={() => this.permissionAdd()}>
              +
            </Button>
            <br/>
            <br/>
            <Table
              columns={returnCol()}
              dataSource={this.state.permissions}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
          </Space>
        }
        { this.props.assetsError ? <Error vendor={this.props.vendor} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
        { this.props.subAssetsError ? <Error vendor={this.props.vendor} error={[this.props.subAssetsError]} visible={true} type={'subAssetsError'} /> : null }
        { this.props.networksError ? <Error vendor={this.props.vendor} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
        { this.props.containersError ? <Error vendor={this.props.vendor} error={[this.props.containersError]} visible={true} type={'containersError'} /> : null }

        { this.props.rolesError ? <Error vendor={this.props.vendor} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
        { this.props.identityGroupsError ? <Error vendor={this.props.vendor} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error vendor={this.props.vendor} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  assetsError: state.concerto.assetsError,
  subAssetsError: state.concerto.subAssetsError,
  networksError: state.concerto.networksError,
  containersError: state.concerto.containersError,

  rolesError: state.concerto.rolesError,

  identityGroupsError: state.concerto.identityGroupsError,

  permissionsError: state.concerto.permissionsError,
}))(Permission);
