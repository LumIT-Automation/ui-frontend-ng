import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'
import ConcertoError from '../../concerto/error'

import {
  cloudNetworksError,
  assignCloudNetworkError,
} from '../store'

import {
  configurationsError,
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Space, Modal, Row, Col, Divider, Table, Input, Radio, Select, Button, Spin, Alert, Result } from 'antd'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*
Country = Provider
City = Region
Reference = ITSM (IT SERVICE MANAGER)
*/

class CloudNetwork extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      providers: ['AWS', 'AZURE', 'GCP', 'ORACLE'],
      ['AWS Regions']: [],
      cloudNetworks: [],
      originCloudNetworks: [],
      errors: {},
    };
  }

  componentDidMount() {

  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
      console.log(this.state.cloudNetworks)
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

  details = () => {
    this.setState({visible: true})
    if (!this.props.configurationsError) {
      this.main()
    }
  }

  main = async () => {

  }

  dataGetHandler = async (entities, assetId) => {
    await this.setState({loading: true})

    let fetchedCloudNetworks = await this.dataGet(entities, assetId)
    if (fetchedCloudNetworks.status && fetchedCloudNetworks.status !== 200 ) {
      this.props.dispatch(cloudNetworksError(fetchedCloudNetworks))
      await this.setState({loading: false})
      return
    }
    else {
      fetchedCloudNetworks.data.forEach((item, i) => {
        item.existent = true
        item.isModified = {}
        item.id = ++i
        if (item.extattrs) {
          for (let k in item.extattrs) {
            console.log(k)
            if (k === 'Country') {
              item['Provider'] = item.extattrs[k].value
            }
            else if (k === 'City') {
              item['Region'] = item.extattrs[k].value
            }
            else if (k === 'Reference') {
              item['ITSM'] = item.extattrs[k].value
            }
            else {
              item[k] = item.extattrs[k].value
            }
          }
        }
      });
      await this.setState({loading: false, originCloudNetworks: fetchedCloudNetworks.data, cloudNetworks: fetchedCloudNetworks.data})
    }
  }

  dataGet = async (entities, assetId) => {
    ///infoblox/2/networks/?fby=*Account ID&fval=Oh Sensei
    let endpoint = `${this.props.vendor}/${entities}/`
    let r
    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    if (entities === 'getNetworks') {
      endpoint = `${this.props.vendor}/${assetId}/networks/?fby=*Account ID&fval=${this.state['account ID']}`
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


  set = async (key, value, cloudNetwork) => {
    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))

    if (key === 'account ID') {
      await this.setState({['account ID']: value})
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {}
    })
  }


  render() {
    console.log('account id', this.state['account ID'])

    let randomKey = () => {
      return Math.random().toString()
    }

    let columns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.loading ? <Spin indicator={permLoadIcon} style={{margin: '10% 10%'}}/> : null }
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
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        ...this.getColumnSearchProps('network'),
      },
      {
        title: 'Network_container',
        align: 'center',
        dataIndex: 'network_container',
        key: 'network_container',
        ...this.getColumnSearchProps('network_container'),
      },
      {
        title: 'Environment',
        align: 'center',
        dataIndex: 'Environment',
        key: 'environment',
        ...this.getColumnSearchProps('Environment'),
      },
      {
        title: 'Provider',
        align: 'center',
        dataIndex: 'Provider',
        key: 'provider',
        ...this.getColumnSearchProps('Provider'),
      },
      {
        title: 'Account Name',
        align: 'center',
        dataIndex: 'Account Name',
        key: 'accountName',
        ...this.getColumnSearchProps('Account Name'),
      },
      {
        title: 'IT Service Manager',
        align: 'center',
        dataIndex: 'ITSM',
        key: 'reference',
        ...this.getColumnSearchProps('ITSM'),
      },
      {
        title: 'Comment',
        align: 'center',
        dataIndex: 'comment',
        key: 'comment',
        ...this.getColumnSearchProps('comment'),
      },
    ];

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              value={this.state['account ID']}
              onChange={event => this.set(key, event.target.value)}
            />
          )
          break;

        case 'button':
          if (action === 'getNetworks') {
            return (
              <Button
                type="primary"
                disabled={this.state['account ID'] ? false : true}
                onClick={() => this.dataGetHandler(action, this.props.asset.id)}
              >
                Get Account ID's cloud networks
              </Button>
            )
          }

        case 'radio':
          return (
            <Radio.Group
              onChange={event => this.set(event.target.value, key)}
              defaultValue={key === 'environment' ? 'AzureCloud' : null}
              value={this.state.request[`${key}`]}
              style={this.state.errors[`${key}Error`] ?
                {border: `1px solid red`}
              :
                {}
              }
            >
              <React.Fragment>
                {this.state[`${choices}`].map((n, i) => {
                  return (
                    <Radio.Button key={i} value={n}>{n}</Radio.Button>
                  )
                })
                }
              </React.Fragment>
          </Radio.Group>
          )
          break;

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={this.state.request[`${key}`]}
              onChange={event => this.set(event.target.value, key)}
              style=
              { this.state.errors[`${key}Error`] ?
                {borderColor: `red`}
              :
                {}
              }
            />
          )
          break;

        case 'select':
          return (
            <Select
              value={this.state.request[`${key}`]}
              showSearch
              style=
              { this.state.errors[`${key}Error`] ?
                {width: "100%", border: `1px solid red`}
              :
                {width: "100%"}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set(event, key)}
            >
              <React.Fragment>
              { choices === 'AWS Regions' ?
                this.state['AWS Regions'].map((v,i) => {
                  let str = `${v[0].toString()} - ${v[1].toString()}`
                  return (
                    <Select.Option key={i} value={v[1]}>{str}</Select.Option>
                  )
                })
              :
                this.state[`${choices}`].map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })
              }
              </React.Fragment>
            </Select>
          )

        default:

      }

    }

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>{this.props.service.toUpperCase()}</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.service.toUpperCase()}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='infoblox'/>
          <Divider/>

          { ( this.props.asset && this.props.asset.id ) ?
            <React.Fragment>
              { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                   status="success"
                   title="Cloud Network Assigned"
                   subTitle={this.state.network}
                 />
              }
              { !this.state.loading && !this.state.response &&
              <React.Fragment>
              <Row>
                <Col span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID:</p>
                </Col>
                <Col span={4}>
                  {createElement('input', 'account ID')}
                </Col>
                <Col offset={1} span={4}>
                  {createElement('button', '', '', '', 'getNetworks')}
                </Col>
              </Row>
              <br/>

              <Divider/>

              {
                (this.state.cloudNetworks && this.state.cloudNetworks.length > 0) ?
                  <Table
                    columns={columns}
                    style={{width: '100%', padding: 15}}
                    dataSource={this.state.cloudNetworks}
                    bordered
                    rowKey={randomKey}
                    scroll={{x: 'auto'}}
                    pagination={{ pageSize: 10 }}
                  />
                :
                  null
              }


              </React.Fragment>
              }
            </React.Fragment>
          :
            <Alert message="Asset and Partition not set" type="error" />
          }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.configurationsError ? <ConcertoError component={'assignCloudNetwork'} error={[this.props.configurationsError]} visible={true} type={'configurationsError'} /> : null }
            { this.props.cloudNetworksError ? <Error component={'cloudNetworksError'} error={[this.props.cloudNetworksError]} visible={true} type={'cloudNetworksError'} /> : null }
            { this.props.assignCloudNetworkError ? <Error component={'assignCloudNetwork'} error={[this.props.assignCloudNetworkError]} visible={true} type={'assignCloudNetworkError'} /> : null }
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
  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  configurationsError: state.concerto.configurationsError,
  cloudNetworksError: state.infoblox.cloudNetworksError,
  assignCloudNetworkError: state.infoblox.assignCloudNetworkError,
}))(CloudNetwork);
