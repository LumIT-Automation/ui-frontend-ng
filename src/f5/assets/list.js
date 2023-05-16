import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Table, Input, Button, Space, Select, Spin } from 'antd'
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, SearchOutlined, CloseCircleOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import Modify from './modify'
import Delete from './delete'

import {
  assetsFetch,
  drAddError,
  drModifyError,
  drDeleteError
} from '../store'

const loadingIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (this.props.assets) {
      let assets = JSON.parse(JSON.stringify(this.props.assets))
      this.setState({assets: assets})
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
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



  assetDr = async (drId, assetId) => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let assetDr = assets.find( a => a.id === drId )
    let asset = assets.find( a => a.id === assetId )

    if (asset.assetsDr && asset.assetsDr.length < 1) {
      asset.assetDrLoading = true
      await this.setState({assets: assets})

      let b = {}
      b.data = {
        "assetDrId": drId,
        "enabled": true
      }

      let drAdd = await this.drAdd(assetId, b)
      if (drAdd.status && drAdd.status !== 201 ) {
        this.props.dispatch(drAddError(drAdd))
        asset.assetDrLoading = false
        await this.setState({assets: assets})
      }
      else {
        asset.assetDrLoading = false
        await this.setState({assets: assets})
        this.props.dispatch(assetsFetch(true))
      }
    }
    else {
      if (asset.assetsDr.length > 0 && asset.assetsDr[0].asset.id && (asset.assetsDr[0].asset.id !== drId)) {
        asset.assetDrLoading = true
        await this.setState({assets: assets})

        let drDelete = await this.drDelete(asset.id, asset.assetsDr[0].asset.id)
        if (drDelete.status && drDelete.status !== 200 ) {
          this.props.dispatch(drDeleteError(drDelete))
          asset.assetDrLoading = false
          await this.setState({assets: assets})
        }
        else {

          let b = {}
          b.data = {
            "assetDrId": drId,
            "enabled": true
          }

          let drAdd = await this.drAdd(assetId, b)
          if (drAdd.status && drAdd.status !== 201 ) {
            this.props.dispatch(drAddError(drAdd))
            asset.assetDrLoading = false
            await this.setState({assets: assets})
          }
          else {
            asset.assetDrLoading = false
            await this.setState({assets: assets})
            this.props.dispatch(assetsFetch(true))
          }
        }
      }
    }
  }

  drRemove = async (assetId) => {
    let assets = JSON.parse(JSON.stringify(this.state.assets))
    let asset = assets.find( a => a.id === assetId )
    if (asset.assetsDr && asset.assetsDr.length > 0) {
      asset.assetDrLoading = true
      await this.setState({assets: assets})

      let drDelete = await this.drDelete(asset.id, asset.assetsDr[0].asset.id)
      if (drDelete.status && drDelete.status !== 200 ) {
        this.props.dispatch(drDeleteError(drDelete))
        asset.assetDrLoading = false
        await this.setState({assets: assets})
      }
      else {
        asset.assetDrLoading = false
        await this.setState({assets: assets})
        this.props.dispatch(assetsFetch(true))
      }
    }
  }

  drAdd = async (id, b) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/asset/${id}/assetsdr/`, this.props.token, b )
    return r
  }

  drDelete = async (assetId, assetDrId) => {
    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/asset/${assetId}/assetdr/${assetDrId}/`, this.props.token )
    return r
  }


  render() {
    const columns = [
      {
        title: 'FQDN',
        align: 'center',
        dataIndex: 'fqdn',
        key: 'fqdn',
        ...this.getColumnSearchProps('fqdn'),
      },
      {
        title: 'ADDRESS',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
        ...this.getColumnSearchProps('address'),
      },
      {
        title: 'Baseurl',
        align: 'center',
        dataIndex: 'baseurl',
        key: 'baseurl',
        ...this.getColumnSearchProps('baseurl'),
      },
      {
        title: 'Environment',
        align: 'center',
        dataIndex: 'environment',
        key: 'environment',
        ...this.getColumnSearchProps('environment'),
      },
      {
        title: 'Datacenter',
        align: 'center',
        dataIndex: 'datacenter',
        key: 'datacenter',
       ...this.getColumnSearchProps('datacenter'),
      },
      {
        title: 'Position',
        align: 'center',
        dataIndex: 'position',
        key: 'position',
        ...this.getColumnSearchProps('position'),
      },
      {
        title: 'DR',
        align: 'center',
        dataIndex: 'assetsDrList',
        key: 'assetsDrList',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.assetDrLoading ?
              <Spin indicator={loadingIcon} style={{margin: 'auto auto'}}/>
            :
              <React.Fragment>
                <Select
                  value={(obj.assetsDr && obj.assetsDr.length > 0) ? obj.assetsDr[0].asset.id : null}
                  key={obj.id}
                  style={{ width: '150px'}}
                  onChange={e => this.assetDr(e, obj.id)}
                >
                  { this.state.assets.map((v,i) => {
                    let str = `${v.fqdn} - ${v.address}`
                    return (
                      <Select.Option key={i} value={v.id}>{str}</Select.Option>
                    )
                  })
                  }
                </Select>
                <CloseCircleOutlined style={{ marginLeft: '15px'}} onClick={() => this.drRemove(obj.id)}/>
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Modify',
        align: 'center',
        dataIndex: 'modify',
        key: 'modify',
        render: (name, obj)  => (
          <Space size="small">
           { this.props.authorizations && (this.props.authorizations.asset_patch || this.props.authorizations.any) ?
            <Modify
              name={name}
              obj={obj}
              vendor='f5'
              assets={this.state.assets}
            />
            :
            '-'
          }
          </Space>
        ),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.asset_delete || this.props.authorizations.any) ?
            <Delete name={name} obj={obj} vendor='f5'/>
            :
            '-'
          }
          </Space>
        ),
      }
    ];

    return (
      <React.Fragment>
        <Table
          columns={columns}
          dataSource={this.state.assets}
          bordered
          rowKey="id"
          scroll={{x: 'auto'}}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />

        { this.props.drAddError ? <Error component={'asset list f5'} error={[this.props.drAddError]} visible={true} type={'drAddError'} /> : null }
        { this.props.drModifyError ? <Error component={'asset list f5'} error={[this.props.drModifyError]} visible={true} type={'drModifyError'} /> : null }
        { this.props.drDeleteError ? <Error component={'asset list f5'} error={[this.props.drDeleteError]} visible={true} type={'drDeleteError'} /> : null }

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  assets: state.f5.assets,
  drAddError: state.f5.drAddError,
  drModifyError: state.f5.drAModifyError,
  drDeleteError: state.f5.drDeleteError,
}))(List);
