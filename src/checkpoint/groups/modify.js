import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  groupsFetch,
  groupModifyError,
  itemTypesError,

  hosts,
  groups,
  networks,
  addressRanges,

  hostsError,
  groupsError,
  networksError,
  addressRangesError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Radio, Divider, Table } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      groupData: {},
      request: {},
      errors: {},
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( this.state.visible && (prevState.itemTypes !== this.state.itemTypes) && (this.state.itemTypes !== null))  {
      this.dataGet()
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    let request = Object.assign({}, this.props.obj)
    this.setState({request: request})
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

  /*handleReset = clearFilters => {
    console.log(clearFilters)
    clearFilters();
    this.setState({ searchText: '' });
  };*/

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    this.setState({ searchText: '' });
  };

  //SETTERS
  itemTypesSet = e => {
    this.setState({itemTypes: e.target.value})
  }

  dataGet = async () => {
    let list = []
    let gData = JSON.parse(JSON.stringify(this.state.groupData))
    this.setState({dataLoading: true})

    let groupData = await this.groupDataGet()
    if (groupData.status && groupData.status !== 200 ) {
      this.props.dispatch(itemTypesError(groupData))
      this.setState({dataLoading: false})
    }
    else {
      switch(this.state.itemTypes) {
        case 'hosts':
          gData.hosts = groupData.data.items
          list = gData.hosts
          break;
        case 'groups':
          gData.groups = groupData.data.items
          list = gData.groups
          break;
        case 'networks':
          gData.networks = groupData.data.items
          list = gData.networks
          break;
        case 'address-ranges':
          gData['address-ranges'] = groupData.data.items
          list = gData['address-ranges']
          break;
      }
      await this.setState({groupData: gData})

    }

    let domainData = await this.domainDataGet()
    if (domainData.status && domainData.status !== 200 ) {
      switch(this.state.itemTypes) {
        case 'hosts':
          this.props.dispatch(hostsError(domainData))
          break;
        case 'groups':
          this.props.dispatch(groupsError(domainData))
          break;
        case 'networks':
          this.props.dispatch(networksError(domainData))
          break;
        case 'address-ranges':
          this.props.dispatch(addressRangesError(domainData))
          break;
      }
      this.setState({dataLoading: false})
    }
    else {
      switch(this.state.itemTypes) {
        case 'hosts':
          this.props.dispatch(hosts(domainData))
          break;
        case 'groups':
          this.props.dispatch(groups(domainData))
          break;
        case 'networks':
          this.props.dispatch(networks(domainData))
          break;
        case 'address-ranges':
          this.props.dispatch(addressRanges(domainData))
          break;
      }
    }
    list = list.concat(domainData.data.items)
    await this.setState({tableData: list, dataLoading: false})
  }

  groupDataGet = async () => {
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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/group/${this.props.obj.uid}/${this.state.itemTypes}/`, this.props.token)
    return r
  }

  domainDataGet = async () => {
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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/${this.state.itemTypes}/`, this.props.token)
    return r
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {}
    })
  }


  render() {
    console.log(this.state.itemTypes)
    console.log(this.state.tableData)

    const columns = [
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Domain',
        align: 'center',
        dataIndex: ['domain', 'name'],
        key: 'domain',
        ...this.getColumnSearchProps(['domain', 'name']),
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
      }
    ]

    let randomKey = () => {
      return Math.random().toString()
    }

    return (

      <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY GROUP</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Updated"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={1} span={16}>
                {this.state.dataLoading ?
                  <Radio.Group disabled={true} value={this.state.itemTypes}>
                    <Radio value={'hosts'}>hosts</Radio>
                    <Radio value={'groups'}>groups</Radio>
                    <Radio value={'networks'}>networks</Radio>
                    <Radio value={'address-ranges'}>address ranges</Radio>
                  </Radio.Group>
                  :
                  <Radio.Group onChange={e => this.itemTypesSet(e)} value={this.state.itemTypes}>
                    <Radio value={'hosts'}>hosts</Radio>
                    <Radio value={'groups'}>groups</Radio>
                    <Radio value={'networks'}>networks</Radio>
                    <Radio value={'address-ranges'}>address ranges</Radio>
                  </Radio.Group>
                }
                </Col>
              </Row>

              <Divider/>

              <Row>
                <Col span={24}>
                {this.state.dataLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                  <Row>
                    <Col span={24}>
                      <Table
                        columns={columns}
                        dataSource={this.state.tableData}
                        bordered
                        rowKey={randomKey}
                        scroll={{x: 'auto'}}
                        pagination={{ pageSize: 10 }}
                      />
                    </Col>
                  </Row>
                }
                </Col>
              </Row>

              <Row>
                <Col offset={11} span={4}>
                  <Button type="primary" shape='round' onClick={null} >
                    Modify Group
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.itemTypesError ? <Error component={'modify group'} error={[this.props.itemTypesError]} visible={true} type={'itemTypesError'} /> : null }
            { this.props.hostsError ? <Error component={'modify group'} error={[this.props.hostsError]} visible={true} type={'hostsError'} /> : null }
            { this.props.groupsError ? <Error component={'modify group'} error={[this.props.groupsError]} visible={true} type={'groupsError'} /> : null }
            { this.props.networksError ? <Error component={'modify group'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
            { this.props.addressRangesError ? <Error component={'modify group'} error={[this.props.addressRangesError]} visible={true} type={'addressRangesError'} /> : null }
            { this.props.groupModifyError ? <Error component={'modify group'} error={[this.props.groupModifyError]} visible={true} type={'groupModifyError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  hosts: state.checkpoint.hosts,
  groups: state.checkpoint.groups,
  networks: state.checkpoint.networks,
  addressRanges: state.checkpoint.addressRanges,

  hostsError: state.checkpoint.hostsError,
  groupsError: state.checkpoint.groupsError,
  networksError: state.checkpoint.networksError,
  addressRangesError: state.checkpoint.addressRangesError,

  itemTypesError: state.checkpoint.itemTypesError,
  groupModifyError: state.checkpoint.groupModifyError
}))(Modify);
