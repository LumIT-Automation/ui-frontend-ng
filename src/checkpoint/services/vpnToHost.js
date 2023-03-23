import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  vpnToHostError,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space, Badge, Dropdown} from 'antd'
import { LoadingOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class VpnToHost extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      domain: 'SHARED-SERVICES',
      expandedKeys: [],
      errors: {},
      vpnToHosts: []
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

  onTableRowExpand = (expanded, record) => {
    let keys = Object.assign([], this.state.expandedKeys);

    if(expanded){
      keys.push(record.uid); // I have set my record.id as row key. Check the documentation for more details.
    }
    else {
      keys = keys.filter(k => k !== record.uid)
    }
    this.setState({expandedKeys: keys});
  }

  details = () => {
    this.setState({visible: true})
  }

  setKey = async (e, kName) => {
    await this.setState({[kName]: e.target.value})
  }

  validationCheck = async () => {
    let validators = new Validators()
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!this.state['ipv4-address'] || !validators.ipv4(this.state['ipv4-address'])) {
      errors['ipv4-addressError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['ipv4-addressError']
      await this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.vpnToHost()
    }
  }

  vpnToHost = async () => {
    await this.setState({loading: true})
    let b = {}

    b.data = {
      "ipv4-address": this.state['ipv4-address'],
      "rule-package": "FWRAVPN_PKG",
    }

    let rest = new Rest(
      "PUT",
      resp => {
        this.setState({vpnToHosts: resp.data.items})
      },
      error => {
        this.props.dispatch(vpnToHostError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.state.domain}/vpn-to-host/`, this.props.token, b)
    await this.setState({loading: false})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ['ipv4-address']: null,
      vpnToHosts: [],
      errors: {}
    })
  }



  render() {
    const expandedRowRender = (...params) => {
      const columns = [
        {
          title: 'Port',
          align: 'center',
          dataIndex: 'port',
          key: 'port',
          ...this.getColumnSearchProps('port'),
        },
        {
          title: 'Type',
          align: 'center',
          dataIndex: 'type',
          key: 'type',
          ...this.getColumnSearchProps('type'),
        }
      ];

      return <Table columns={columns} dataSource={params[0].services} pagination={false} />;
    };

    const columns = [
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      }
    ];

    let randomKey = () => {
      return Math.random().toString()
    }



    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>Get VPN Profiles</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Get VPN Profiles</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='checkpoint' domain={this.state.domain}/>
          <Divider/>

          { (( this.props.asset && this.props.asset.id ) && this.state.domain) ?
            <React.Fragment>

              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ipv4-address:</p>
                  </Col>
                  <Col span={8}>
                    <Input
                      defaultValue={this.state['ipv4-address']}
                      style={this.state.errors['ipv4-addressError'] ? {borderColor: 'red'} : null}
                      onChange={e => this.setKey(e, 'ipv4-address')}
                      onPressEnter={() => this.validation()}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    <Button
                      type="primary"
                      onClick={() => this.validation()}
                    >
                      Get VPN Profiles
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

              <Divider/>

            { this.state.loading ?
              <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
            :
              <React.Fragment>
                { this.state.vpnToHosts.length < 1 ?
                  null
                :
                  <Table
                    columns={columns}
                    dataSource={this.state.vpnToHosts}
                    bordered
                    scroll={{x: 'auto'}}
                    pagination={{ pageSize: 10 }}
                    style={{marginBottom: 10}}
                    onExpand={this.onTableRowExpand}
                    expandedRowKeys={this.state.expandedKeys}
                    rowKey={record => record.uid}
                    expandedRowRender={ record => expandedRowRender(record)}
                    /*expandable={{
                      //expandedRowRender: record => expandedRowRender(record),
                      expandedRowRender,
                      //defaultExpandedRowKeys: ['0'],
                    }}*/
                    //expandedRowRender={record => expandedRowRender(record)}
                  />
                }
              </React.Fragment>
            }
            </React.Fragment>
            :
            <Alert message="Asset and Domain not set" type="error" />
          }

        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.vpnToHostError ? <Error component={'vpnToHost'} error={[this.props.vpnToHostError]} visible={true} type={'vpnToHostError'} /> : null }
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
  authorizations: state.authorizations.checkpoint,
  asset: state.checkpoint.asset,

  vpnToHostError: state.checkpoint.vpnToHostError,
}))(VpnToHost);
