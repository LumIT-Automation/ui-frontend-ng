import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'
import InfobloxError from '../../infoblox/error'

import { Space, Table, Input, Button, Spin, Progress } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import Add from './add'
import Delete from './delete'

import {
  triggers,
  triggersFetch,
  triggersError,
} from '../store'

import {
  assetsError,
} from '../../infoblox/store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

//import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
  }

  componentDidMount() {
    if (!this.props.triggersError && !this.props.triggers) {
      this.props.dispatch(triggersFetch(false))
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.vendor !== this.props.vendor) {
      this.props.dispatch(triggersFetch(false))
      this.main()
    }
    if (this.props.triggersFetch) {
      this.props.dispatch(triggersFetch(false))
      this.main()
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
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
    await this.setState({loading: true})

    let fetchedAssets = await this.assetGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({assets: fetchedAssets.data.items})
    }

    let fetchedTriggers = await this.triggerGet()
    if (fetchedTriggers.status && fetchedTriggers.status !== 200 ) {
      this.props.dispatch(triggersError(fetchedTriggers))
      await this.setState({loading: false})
      return
    }
    else {
      let trigs = []
      fetchedTriggers.data.items.forEach((trig, i) => {
        let asset = this.state.assets.find(a => a.id === trig.dst_asset_id)
        trig.dst_asset_fqdn = asset.fqdn
        trigs.push(trig)
      });


      await this.setState({loading: false})
      await this.props.dispatch(triggers(trigs))
    }
  }

  triggersRefresh = async () => {
    this.props.dispatch(triggersFetch(true))
  }

  assetGet = async () => {
    let endpoint = `${this.props.vendor}/assets/`

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

  triggerGet = async () => {
    let endpoint = `${this.props.vendor}/triggers/`

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
    
    let returnCol = () => {
      switch (this.props.vendor) {
        case 'infoblox':
          return infobloxColumns
          break;
        default:
      }
    }


    const infobloxColumns = [
      {
        title: 'Id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        ...this.getColumnSearchProps('id'),
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'dst_asset_fqdn',
        align: 'center',
        dataIndex: 'dst_asset_fqdn',
        key: 'dst_asset_fqdn',
        ...this.getColumnSearchProps('dst_asset_fqdn'),
      },
      {
        title: 'dst_asset_id',
        align: 'center',
        dataIndex: 'dst_asset_id',
        key: 'dst_asset_id',
        ...this.getColumnSearchProps('dst_asset_id'),
      },
      {
        title: 'Action',
        align: 'center',
        dataIndex: 'action',
        key: 'action',
        ...this.getColumnSearchProps('action'),
      },
      {
        title: 'Enabled',
        align: 'center',
        dataIndex: 'enabled',
        key: 'enabled',
        ...this.getColumnSearchProps('enabled'),
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Delete name={name} obj={obj} vendor='infoblox'/>
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

            <Space wrap>
              <Button
                shape='round'
                onClick={() => this.triggersRefresh()}
              >
                <ReloadOutlined/>
              </Button>

              <Add vendor={this.props.vendor} assets={this.state.assets}/>
            </Space>

            <br/>
            <Table
              columns={returnCol()}
              dataSource={this.props.triggers}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
            />
          </Space>
        }
        { this.props.triggersError ? <Error vendor={this.props.vendor} error={[this.props.triggersError]} visible={true} type={'triggersError'} /> : null }
        { this.props.assetsError ? <InfobloxError vendor={this.props.vendor} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  triggers: state.concerto.triggers,
  triggersFetch: state.concerto.triggersFetch,
  triggersError: state.concerto.triggersError,

  assetsError: state.infoblox.assetsError,
}))(Manager);
