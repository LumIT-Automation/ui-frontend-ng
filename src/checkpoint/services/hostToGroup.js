import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import CommonFunctions from '../../_helpers/commonFunctions'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Radio, Result, Alert, Row, Col, Select, Divider, Table, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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
    console.log('hosts', this.state.hosts)
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
      let id = 1
      group.members.forEach((item, i) => {
        item.groupMember = true
        item.flagged = true
        item.id = id 
        id++
      });
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

  itemAdd = async (items, type) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemAdd(items, type)
    let group = Object.assign([], this.state.group);
    group.members = list
    await this.setState({group: group})
  }

  itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(item, items)
    let group = Object.assign([], this.state.group);
    group.members = list
    await this.setState({group: group})
  }

  set = async (value, key, obj) => {
    console.log(value)
    console.log(key)
    console.log(obj)
    let groups = Object.assign([], this.state.groups);
    let group = groups.find(g => g.name === value)
    let hosts = Object.assign([], this.state.hosts);
    console.log(hosts)
    let host
    let member

    if (key === 'group') {
      await this.setState({group: group, groupError: ''})
      this.getGroupHosts()
    }
    if (key === 'flag') {
      group = Object.assign([], this.state.group);
      let host = group.members.find(h => h.name === obj.name)
      host.flagged = !host.flagged
      await this.setState({group: group})
    }
    if (key === 'hostname') {
      group = Object.assign([], this.state.group);
      host = hosts.find(h => h.name === value)
      member = group.members.find(m => m.id === obj.id)
      member = Object.assign(member, host);
      delete member.nameError
      await this.setState({group: group})
    }
    if (key === 'ipv4-address') {
      group = Object.assign([], this.state.group);
      host = hosts.find(h => h['ipv4-address'] === value)
      member = group.members.find(m => m.id === obj.id)
      member = Object.assign(member, host);
      delete member.ipError
      await this.setState({group: group})
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
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        ...this.getColumnSearchProps('name'),
        render: (name, obj)  => (
          <React.Fragment>
            {obj.groupMember ? 
              name
            :
              <Select
                value={obj.name}
                showSearch
                style={obj.nameError ? {width: '80%', border: `1px solid red`} : {width: '80%'} }
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onSelect={n => this.set(n, 'hostname', obj)}
              >
                <React.Fragment>
                  {this.state.hosts.map((h, i) => {
                    return (
                      <Select.Option key={i} value={h.name}>{h.name}</Select.Option>
                    )
                  })
                  }
                </React.Fragment>
              </Select>
            }
          </React.Fragment>
        )
      },
      {
        title: 'IPv4-address',
        align: 'center',
        dataIndex: 'ipv4-address',
        key: 'ipv4-address',
       ...this.getColumnSearchProps('ipv4-address'),
       render: (name, obj)  => (
        <React.Fragment>
          {obj.groupMember ? 
            name
          :
            <Select
              value={obj['ipv4-address']}
              showSearch
              style={obj.ipError ? {width: '80%', border: `1px solid red`} : {width: '80%'} }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={n => this.set(n, 'ipv4-address', obj)}
            >
              <React.Fragment>
                {this.state.hosts.map((h, i) => {
                  return (
                    <Select.Option key={i} value={h['ipv4-address']}>{h['ipv4-address']}</Select.Option>
                  )
                })
                }
              </React.Fragment>
            </Select>
          }
        </React.Fragment>
      )
      },
      {
        title: 'Domain',
        align: 'center',
        dataIndex: ['domain', 'name'],
        key: 'domain',
        ...this.getColumnSearchProps(['domain', 'name']),
      },
      {
        title: 'Group member',
        align: 'center',
        dataIndex: 'groupMember',
        key: 'groupMember',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.groupMember ? 
              <Checkbox checked={obj.flagged} onChange={e => this.set(e, 'flag', obj)}/>
            :
              <Button
                type='danger'
                onClick={() => this.itemRemove(obj, this.state.group.members)}
              >
                -
              </Button>
            }
          </React.Fragment>
        ),
      },
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
                          <React.Fragment>
                            {/*to do: createElement()*/} 
                            <Radio.Group>
                              <Radio.Button
                                style={{marginLeft: 10 }}
                                onClick={() => this.getGroupHosts()}
                              >
                                <ReloadOutlined/>
                              </Radio.Button>
                            </Radio.Group>
                
                            <Radio.Group
                              buttonStyle="solid"
                            >
                              <Radio.Button
                                buttonStyle="solid"
                                style={{marginLeft: 10 }}
                                onClick={() => this.itemAdd(this.state.group.members)}
                              >
                                +
                              </Radio.Button>
                            </Radio.Group>
                
                            <br/>
                            <br/>
                            <Table
                              columns={returnColumns()}
                              style={{width: '100%', padding: 15}}
                              dataSource={this.state.group.members}
                              bordered
                              rowKey={r => r.id}
                              scroll={{x: 'auto'}}
                              pagination={{ pageSize: 10 }}
                            />
                          </React.Fragment>  
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
