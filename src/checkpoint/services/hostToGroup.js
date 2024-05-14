import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Result, Alert, Row, Col, Select, Divider, Table, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      groups: [],
      errors: {},
      groupError: ''
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( this.state.visible && (this.props.asset && this.props.domain) && (prevProps.domain !== this.props.domain) ) {
      this.setState({group: '', groups: ''})
      this.dataGet()
    }
    console.log('group', this.state.group)
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
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

  dataGet = async () => {
    let list = JSON.parse(JSON.stringify(this.state.groups))
    this.setState({loading: true})

    let data = await this.getData('groups')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'hostToGroup',
        vendor: 'checkpoint',
        errorType: 'groupsError'
      })
      this.props.dispatch(err(error))
      this.setState({loading: false})
      return
    }
    else {
      await this.setState({groups: data.data.items})
    }

    data = await this.getData('hosts')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'hostToGroup',
        vendor: 'checkpoint',
        errorType: 'hostsError'
      })
      this.props.dispatch(err(error))
      this.setState({loading: false})
      return
    }
    else {
      await this.setState({hosts: data.data.items, loading: false})
    }
  }

  getGroupHosts = async () => {
    let group = Object.assign([], this.state.group);
    this.setState({ghLoading: true})

    let data = await this.getData('group-hosts', group.uid)
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'hostToGroup',
        vendor: 'checkpoint',
        errorType: 'groupHostsError'
      })
      this.props.dispatch(err(error))
      this.setState({ghLoading: false})
      return
    }
    else {
      group.members = data.data.items
      await this.setState({group: group, ghLoading: false})
    }

  }

  getData = async (entity, id) => {
    let r
    let endpoint = ''

    if (id) {
      endpoint = `checkpoint/${this.props.asset.id}/${this.props.domain}/${entity}/${id}/`
    }
    else {
      endpoint = `checkpoint/${this.props.asset.id}/${this.props.domain}/${entity}/`
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

  set = async (value, key, obj) => {
    console.log(value)
    console.log(key)
    let groups = Object.assign([], this.state.groups);
    let group = groups.find(g => g.name === value)

    if (key === 'group') {
      await this.setState({group: group, groupError: ''})
      this.getGroupHosts()
    }
  }



  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'hostToGroup') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    let columns = [
      {
        title: 'Group member',
        align: 'center',
        dataIndex: 'groupMember',
        key: 'groupMember',
        render: (name, obj)  => (
          <React.Fragment>
            <Checkbox checked={obj.flagged} onChange={e => this.flagSet(e, obj)}/>
          </React.Fragment>
        ),
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'IPv4-address',
        align: 'center',
        dataIndex: 'ipv4-address',
        key: 'ipv4-address',
       ...this.getColumnSearchProps('ipv4-address'),
      },
      {
        title: 'Domain',
        align: 'center',
        dataIndex: ['domain', 'name'],
        key: 'domain',
        ...this.getColumnSearchProps(['domain', 'name']),
      }
    ]

    let returnColumns = () => {
      return columns
    }

    return (

      <Space direction='vertical'>

        <Button type="primary" onClick={() => this.details()}>Add remove host to Group</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add remove host to Group</p>}
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

          { ( (this.props.asset && this.props.asset.id) && this.props.domain ) ?
            <React.Fragment>
              { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 50%'}}/> }
              { !this.state.loading && this.state.response &&
                <Result
                  status="success"
                  title="Updated"
                />
              }
              { !this.state.loading && !this.state.response &&
                <React.Fragment>

                  <Row>
                    <Col offset={8} span={8}>
                      <Select
                        value={this.state.group ? this.state.group.name : ''}
                        showSearch
                        style={this.state.groupError ? {width: '100%', border: `1px solid red`} : {width: '100%'} }
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onSelect={g => this.set(g, 'group')}
                      >
                        <React.Fragment>
                          {this.state.groups.map((g, i) => {
                            return (
                              <Select.Option key={i} value={g.name}>{g.name}</Select.Option>
                            )
                          })
                          }
                        </React.Fragment>
                      </Select>
                    </Col>
                  </Row>

                  <br/>
                  
                  {this.state.group ?
                    <Row>
                      <Col span={24}>
                        {this.state.ghLoading ?
                          <Spin indicator={spinIcon} style={{margin: 'auto 50%'}}/>
                        :
                          <Table
                            columns={returnColumns()}
                            style={{width: '100%', padding: 15}}
                            dataSource={this.state.group.members}
                            bordered
                            rowKey={r => r.id}
                            scroll={{x: 'auto'}}
                            pagination={{ pageSize: 10 }}
                          />
                        }
                        
                      </Col>
                    </Row>
                  :
                    null
                  }

                  <br/>

                  <Row>
                    <Col offset={11} span={2}>
                      {(this.state.loading || this.state.itemTypes === undefined) ?
                        <Button type="primary" shape='round' disabled>
                          Modify Group
                        </Button>
                      :
                        <Button type="primary" shape='round' onClick={() => this.createBody()} >
                          Modify Group
                        </Button>
                      }
                    </Col>
                  </Row>
                </React.Fragment>
              }
              </React.Fragment>
          :
              <Alert message="Asset and Domain not set" type="error" />
            
          }
          
        </Modal>

        {errors()}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
}))(Modify);
