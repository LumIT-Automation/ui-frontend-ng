import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

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
      expandedKeys: [],
      domain: 'SHARED-SERVICES',
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

  flatProperty = async (items) => {

    let list = []
    items.forEach((item, i) => {
      let key = Object.keys(item.ipv4)[0]
      let value = Object.values(item.ipv4)[0]
      item[key] = value
      item['ipValue'] = value
      list.push(item)
      //Object.getOwnPropertyNames(object1)
    });

    await this.setState({vpnToServices: list})
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
        let beauty = JSON.stringify(resp.data.items, null, 2)
        let base64 = btoa(beauty)
        //this.flatProperty(resp.data.items)
        let list = []
        let list2 = []
        resp.data.items.forEach((item, i) => {

          item.ipv4s.forEach((ip, i) => {
            list2.push({ip: ip})
          });

          item.ipv4s = list2
          list2 = []
          //item.ipv4s = {value: item.ipv4s}
          list.push(item)
        });

        this.setState({vpnToServices: list, base64: base64})
      },
      error => {
        error = Object.assign(error, {
          component: 'vpnToService',
          vendor: 'checkpoint',
          errorType: 'vpnToServiceError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.state.domain}/vpn-to-services/`, this.props.token, b)
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

    let errors = () => {
      if (this.props.error && this.props.error.component === 'vpnToService') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const ipValueColumns = [
      {
        title: 'ipValue',
        align: 'center',
        dataIndex: 'ip',
        key: 'ip',
        ...this.getColumnSearchProps('ip'),
      }
    ]
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
        width: 300,
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'Type',
        align: 'center',
        width: 300,
        dataIndex: 'type',
        key: 'type',
        ...this.getColumnSearchProps('type'),
      },
      {
        title: 'IP',
        align: 'center',
        width: 300,
        dataIndex: '',
        key: 'ipv4s',
        render: (name, obj)  => (
          <Table
            columns={ipValueColumns}
            dataSource={obj.ipv4s}
            bordered
            scroll={{x: 'auto'}}
            style={{marginLeft: -25}}
            pagination={{ pageSize: 10 }}
            rowKey={record => record.uid}
          />
        ),
      }
    ];

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>VPN Flows by Profile</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>VPN Flows by Profile</p>}
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Group Name:</p>
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
                      VPN Flows by Profile
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
                  <React.Fragment>
                    <a download='VPN Flows by Profile.txt' href={`data:application/octet-stream;charset=utf-8;base64,${this.state.base64}`}>Download data</a>
                    <br/>
                    <br/>
                    <Table
                      columns={columns}
                      dataSource={this.state.vpnToServices}
                      bordered
                      scroll={{x: 'auto'}}
                      pagination={{ pageSize: 10 }}
                      style={{marginBottom: 10}}
                      onExpand={this.onTableRowExpand}
                      expandedRowKeys={this.state.expandedKeys}
                      rowKey={record => record.uid}
                      expandedRowRender={ record => expandedRowRender(record)}
                    />
                  </React.Fragment>
                }
              </React.Fragment>
            }
            </React.Fragment>
            :
            <Alert message="Asset and Domain not set" type="error" />
          }

        </Modal>

        {errors()}

      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
}))(VpnToServices);
