import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  vpnToServiceError,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class VpnToServices extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      vpnToServices: []
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
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    if (!this.state.name) {
      errors.nameError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      await this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.vpnToService()
    }
  }

  vpnToService = async () => {
    await this.setState({nameloading: true})
    let b = {}

    b.data = {
      "name": this.state.name,
    }

    let rest = new Rest(
      "PUT",
      resp => {
        this.setState({vpnToServices: resp.data.items})
      },
      error => {
        this.props.dispatch(vpnToServiceError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/vpn-to-services/`, this.props.token, b)
    await this.setState({nameloading: false})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      name: null,
      vpnToServices: [],
      errors: {}
    })
  }


  render() {
    console.log(this.state.vpnToServices)
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

        <Button type="primary" onClick={() => this.details()}>VPN TO SERVICES</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>VPN TO SERVICES</p>}
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                  </Col>
                  <Col span={8}>

                    <Input
                      defaultValue={this.state.name}
                      style={this.state.errors.nameError ? {borderColor: 'red'} : null}
                      onChange={e => this.setKey(e, 'name')}
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
                      Vpn to services
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

              <Divider/>

            { this.state.nameloading ?
              <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
            :
              <React.Fragment>
                { this.state.vpnToServices.length < 1 ?
                  null
                :
                  <Table
                    columns={columns}
                    dataSource={this.state.vpnToServices}
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
            { this.props.vpnToServiceError ? <Error component={'vpnToService'} error={[this.props.vpnToServiceError]} visible={true} type={'vpnToServiceError'} /> : null }
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

  vpnToServiceError: state.checkpoint.vpnToServiceError,
}))(VpnToServices);
