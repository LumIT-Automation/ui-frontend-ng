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

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class VpnToHost extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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
        let list = []
        resp.data.items.forEach((item, i) => {
          let o = {}
          //console.log(item)
          for (let property in item) {
            if ( (property !== 'port') && (property !== 'protocol') && (property !== 'type') ) {
              o.uid = property
              o.name = item[property].name
              //console.log(property)
            }
            o.port = item.port
            o.protocol = item.protocol
            o.type = item.type
          }
          list.push(o)
        });
        this.setState({vpnToHosts: list})
      },
      error => {
        this.props.dispatch(vpnToHostError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/vpn-to-host/`, this.props.token, b)
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
    console.log(this.state.vpnToHosts)
    const columns = [
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Port',
        align: 'center',
        dataIndex: 'port',
        key: 'port',
        ...this.getColumnSearchProps('port'),
      },
      {
        title: 'Protocol',
        align: 'center',
        dataIndex: 'protocol',
        key: 'protocol',
        ...this.getColumnSearchProps('protocol'),
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
      }
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>VPN TO HOST</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>VPN TO HOST</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='checkpoint'/>
          <Divider/>

          { (( this.props.asset && this.props.asset.id ) && this.props.domain) ?
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
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>rule-package:</p>
                  </Col>
                  <Col span={8}>
                    <Input
                      defaultValue="FWRAVPN_PKG"
                      disabled
                    />
                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    <Button
                      type="primary"
                      onClick={() => this.validation()}
                    >
                      Vpn to host
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
                    rowKey={randomKey}
                    scroll={{x: 'auto'}}
                    pagination={{ pageSize: 10 }}
                    style={{marginBottom: 10}}
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
  domain: state.checkpoint.domain,

  vpnToHostError: state.checkpoint.vpnToHostError,
}))(VpnToHost);
