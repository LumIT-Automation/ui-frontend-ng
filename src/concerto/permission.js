import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'
import RolesDescription from './rolesDescription'

import { Space, Table, Input, Button, Spin, Progress } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';


import {
  permissionsError,
  assetsError,
  identityGroupsError,
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
    if (!this.props.permissionsError && !this.props.assetsError && !this.props.identityGroupsError) {
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
    fetchedPermissions,
    identityGroupsNoWorkflowLocal,
    permissionsNoWorkflowLocal,
    permissionsWithAssets

    await this.setState({loading: true})

    fetchedAssets = await this.assetsGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({assets: fetchedAssets.data.items})
    }

    fetchedIdentityGroups = await this.identityGroupsGet()
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      await this.setState({loading: false})
      return
    }
    else {
      identityGroupsNoWorkflowLocal = fetchedIdentityGroups.data.items.filter(r => r.name !== 'workflow.local');
      await this.setState({identityGroups: identityGroupsNoWorkflowLocal})
    }

    fetchedPermissions = await this.permissionsGet()
    if (fetchedPermissions.status && fetchedPermissions.status !== 200 ) {
      this.props.dispatch(permissionsError(fetchedPermissions))
      await this.setState({loading: false})
      return
    }
    else {
      permissionsNoWorkflowLocal = fetchedPermissions.data.items.filter(r => r.identity_group_name !== 'workflow.local');
      permissionsWithAssets = await this.assetWithDetails(permissionsNoWorkflowLocal)
      await this.setState({permissions: permissionsWithAssets})
    }

  await this.setState({loading: false})
  }

  assetsGet = async () => {
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
    await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token)
    return r
  }


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
    await rest.doXHR(`${this.props.vendor}/identity-groups/`, this.props.token)
    return r
  }

  permissionsGet = async () => {
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
    await rest.doXHR(`${this.props.vendor}/permissions/`, this.props.token)
    return r
  }

  assetWithDetails = async (permissions) => {

    let subAsset
    switch (this.props.vendor) {
      case 'infoblox':
        subAsset = 'network'
        break;
      case 'checkpoint':
        subAsset = 'domain'
        break;
      case 'f5':
        subAsset = 'partition'
        break;
      case 'vmware':
        subAsset = 'object'
        break;
      default:

    }
    try {
      Object.values(permissions).forEach((perm, i) => {
        let asset
        if (this.props.vendor === 'vmware') {
          asset = this.state.assets.find(a => a.id === perm[subAsset].id_asset)
        }
        else {
          asset = this.state.assets.find(a => a.id === perm[subAsset].asset_id)
        }
        perm.asset = asset
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

  permissionGet = async () => {
    let endpoint = `${this.props.vendor}/permission/`
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

    await rest.doXHR(`${endpoint}`, this.props.token)
    return r
  }

  render() {
    console.log('vendor', this.props.vendor)
    console.log('assets', this.state.assets)
    console.log('ideGroups', this.state.identityGroups)
    console.log('permissions', this.state.permissions)

    let returnCol = () => {
      return vendorColumns
    }

    const vendorColumns = [
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
      },
      {
        title: 'Asset',
        align: 'center',
        dataIndex: ['asset', 'fqdn' ],
        key: 'fqdn',
        ...this.getColumnSearchProps(['asset', 'fqdn' ]),
      },
      ...(
        this.props.vendor === 'infoblox' ?
          [
            {
              title: 'Network',
              align: 'center',
              dataIndex: ['network', 'name' ],
              key: 'network',
              ...this.getColumnSearchProps(['network', 'name' ]),
            },
          ]
        :
          this.props.vendor === 'checkpoint' ?
          [
            {
              title: 'Domain',
              align: 'center',
              dataIndex: ['domain', 'name' ],
              key: 'domain',
              ...this.getColumnSearchProps(['domain', 'name' ]),
            },
          ]
          :
          this.props.vendor === 'f5' ?
          [
            {
              title: 'Partition',
              align: 'center',
              dataIndex: ['partition', 'name' ],
              key: 'partition',
              ...this.getColumnSearchProps(['partition', 'name' ]),
            },
          ]
          :
          this.props.vendor === 'vmware' ?
          [
            {
              title: 'MoId',
              align: 'center',
              dataIndex: ['object', 'name' ],
              key: 'object',
              ...this.getColumnSearchProps(['object', 'name' ]),
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

            <Button onClick={() => this.permissionsRefresh()}><ReloadOutlined/></Button>
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
        { this.props.identityGroupsError ? <Error vendor={this.props.vendor} error={[this.props.identityGroupsError]} visible={true} type={'identityGroupsError'} /> : null }
        { this.props.permissionsError ? <Error vendor={this.props.vendor} error={[this.props.permissionsError]} visible={true} type={'permissionsError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  assetsError: state.concerto.assetsError,
  identityGroupsError: state.concerto.identityGroupsError,
  permissionsError: state.concerto.permissionsError,
}))(Permission);
