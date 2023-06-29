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
  cloudNetworkDeleteError,
} from '../store'

import {
  configurationsError,
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Space, Modal, Row, Col, Divider, Table, Input, Radio, Select, Button, Checkbox, Spin, Alert, Result } from 'antd'
import Highlighter from 'react-highlight-words';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const cloudNetLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*
Country = Provider
City = Region
Reference = ITSM (IT SERVICE MANAGER)
*/

class CloudNetwork extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};
    this.textAreaRefs = {};

    this.state = {
      visible: false,
      providers: ['AWS', 'AZURE', 'GCP', 'ORACLE'],
      ['AWS Regions']: [],
      cloudNetworks: [],
      originCloudNetworks: [],
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
    if (!this.props.configurationsError) {
      this.main()
    }
  }

  main = async () => {
    await this.setState({loading: true})
    let conf = []
    let configurationsFetched = await this.dataGet('configuration')
    console.log(configurationsFetched)

    try {
      if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
        this.props.dispatch(configurationsError(configurationsFetched))
        await this.setState({loading: false})
      }
      else {
        if (configurationsFetched.data.configuration.length > 0) {
          conf = configurationsFetched.data.configuration
          conf.forEach((item, i) => {
            if (item.key === 'AWS Regions') {
              let list = JSON.parse(item.value)
              let list2 = []
              list.forEach((item, i) => {
                list2.push(item)
              });
              this.setState({['AWS Regions']: list2})
            }
          });
        }
        await this.setState({loading: false})
      }
    } catch (error) {
      await this.setState({loading: false})
      console.log(error)
    }
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
            if (k === 'Country') {
              let v
              if (item.extattrs[k].value.includes('Cloud-')){
                v = item.extattrs[k].value.replace('Cloud-', '')
                item['Provider'] = v
              }
              else {
                item['Provider'] = item.extattrs[k].value
              }
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
    let endpoint
    let r

    if (entities === 'configuration') {
      endpoint = `${this.props.vendor}/${entities}/global/`
    }

    if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }
    if (entities === 'getNetworks') {
      if (this.state['account ID']) {
        endpoint = `${this.props.vendor}/${assetId}/networks/?fby=*Account ID&fval=${this.state['account ID']}&fby=*Environment&fval=Cloud`
      }
      else if(this.state['account Name']) {
        endpoint = `${this.props.vendor}/${assetId}/networks/?fby=*Account Name&fval=${this.state['account Name']}&fby=*Environment&fval=Cloud`
      }
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

  cloudNetworkAdd = async () => {
    let id = 0
    let n = 0
    let p = {}
    let list = JSON.parse(JSON.stringify(this.state.cloudNetworks))

    this.state.cloudNetworks.forEach(p => {
      if (p.id > id) {
        id = p.id
      }
    });

    n = id + 1
    p.id = n
    if (this.state['account ID']) {
      p['Account ID'] = this.state['account ID']
    }
    if (this.state['account Name']) {
      p['Account Name'] = this.state['account Name']
    }
    list.push(p)

    await this.setState({cloudNetworks: list})
  }

  cloudNetworkRemove = async p => {
    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))
    let newList = cloudNetworks.filter(n => {
      return p.id !== n.id
    })

    //delete this[`inputTextAreaRef${p.id}`]
    await this.setState({cloudNetworks: newList})
  }

  set = async (key, value, cloudNetwork) => {
    console.log('key', key)
    console.log('value', value)
    console.log('cloudNetwork', cloudNetwork)

    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))
    let origCloudNet
    let cloudNet

    if (key === 'account ID') {
      await this.setState({['account ID']: value, ['account Name']: ''})
    }
    if (key === 'account Name') {
      await this.setState({['account Name']: value, ['account ID']: ''})
    }

    if (cloudNetwork) {
      origCloudNet = this.state.originCloudNetworks.find(cn => cn.id === cloudNetwork.id)
      cloudNet = cloudNetworks.find(cn => cn.id === cloudNetwork.id)

      if (key === 'Provider') {
        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet.Provider !== value) {
              cloudNet.isModified.Provider = true
              cloudNet.Provider = value
            }
            else {
              delete cloudNet.isModified.Provider
              cloudNet.Provider = value
            }
          }
          else {
            cloudNet.Provider = value
          }
          delete cloudNet.ProviderError
        }
        if (value !== 'AWS') {
          delete cloudNet.Region
          delete cloudNet.RegionError
          if (cloudNet.isModified && cloudNet.isModified.Region) {
            delete cloudNet.isModified.Region
          }
        }
      }

      if (key === 'Region') {
        if (cloudNet.Provider === 'AWS') {
          if (value) {
            if (cloudNet.existent) {
              if (origCloudNet.Region !== 'aws-'+value) {
                cloudNet.isModified.Region = true
                cloudNet.Region = 'aws-'+value
              }
              else {
                delete cloudNet.isModified.Region
                cloudNet.Region = 'aws-'+value
              }
            }
            else {
              cloudNet.Region = 'aws-'+value
            }
            delete cloudNet.RegionError
          }
        }
      }

      if (key === 'Account ID') {
        let start = 0
        let end = 0
        let ref = this.myRefs[`${cloudNetwork.id}_Account ID`]

        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet['Account ID'] !== value) {
              cloudNet.isModified['Account ID'] = true
              cloudNet['Account ID'] = value
            }
            else {
              delete cloudNet.isModified['Account ID']
              cloudNet['Account ID'] = value
            }
          }
          else {
            cloudNet['Account ID'] = value
          }
          delete cloudNet['Account IDError']
        }
        else {
          //blank value while typing.
          cloudNet['Account ID'] = ''
        }

        await this.setState({cloudNetworks: cloudNetworks})
        ref = this.myRefs[`${cloudNetwork.id}_Account ID`]

        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'Account Name') {
        let start = 0
        let end = 0
        let ref = this.myRefs[`${cloudNetwork.id}_Account Name`]

        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet['Account Name'] !== value) {
              cloudNet.isModified['Account Name'] = true
              cloudNet['Account Name'] = value
            }
            else {
              delete cloudNet.isModified['Account Name']
              cloudNet['Account Name'] = value
            }
          }
          else {
            cloudNet['Account Name'] = value
          }
          delete cloudNet['Account NameError']
        }
        else {
          //blank value while typing.
          cloudNet['Account Name'] = ''
        }

        await this.setState({cloudNetworks: cloudNetworks})
        ref = this.myRefs[`${cloudNetwork.id}_Account Name`]

        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'ITSM') {
        let start = 0
        let end = 0
        let ref = this.myRefs[`${cloudNetwork.id}_ITSM`]

        if (ref && ref.input) {
          start = ref.input.selectionStart
          end = ref.input.selectionEnd
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet['ITSM'] !== value) {
              cloudNet.isModified['ITSM'] = true
              cloudNet['ITSM'] = value
            }
            else {
              delete cloudNet.isModified['ITSM']
              cloudNet['ITSM'] = value
            }
          }
          else {
            cloudNet['ITSM'] = value
          }
          delete cloudNet['ITSMError']
        }
        else {
          //blank value while typing.
          cloudNet['ITSM'] = ''
        }

        await this.setState({cloudNetworks: cloudNetworks})
        ref = this.myRefs[`${cloudNetwork.id}_ITSM`]

        if (ref && ref.input) {
          ref.input.selectionStart = start
          ref.input.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'comment') {
        let start = 0
        let end = 0
        let ref = this.textAreaRefs[`${cloudNetwork.id}_comment`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          start = ref.resizableTextArea.textArea.selectionStart
          end = ref.resizableTextArea.textArea.selectionEnd
        }

        if (value) {
          if (cloudNet.existent) {
            if (origCloudNet['comment'] !== value) {
              cloudNet.isModified['comment'] = true
              cloudNet['comment'] = value
            }
            else {
              delete cloudNet.isModified['comment']
              cloudNet['comment'] = value
            }
          }
          else {
            cloudNet['comment'] = value
          }
          delete cloudNet['commentError']
        }
        else {
          //blank value while typing.
          cloudNet['comment'] = ''
        }

        await this.setState({cloudNetworks: cloudNetworks})
        ref = this.textAreaRefs[`${cloudNetwork.id}_comment`]

        if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
          ref.resizableTextArea.textArea.selectionStart = start
          ref.resizableTextArea.textArea.selectionEnd = end
        }

        ref.focus()
      }

      if (key === 'toDelete') {
        if (value) {
          cloudNet.toDelete = true
        }
        else {
          delete cloudNet.toDelete
        }
      }

    }

    if (key !== 'Account ID' && key !== 'Account Name' && key !== 'ITSM' && key !== 'comment') {
      await this.setState({cloudNetworks: cloudNetworks})
    }

  }

  validation = async () => {
    let errors = await this.validationCheck()
    if (errors === 0) {
      this.cudManager()
    }
  }

  validationCheck = async () => {
    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))
    let errors = 0

    for (let cloudNet of Object.values(cloudNetworks)) {
      if (!cloudNet.Provider) {
        ++errors
        cloudNet.ProviderError = true
      }
      if (cloudNet.Provider === 'AWS' && !cloudNet.Region) {
        ++errors
        cloudNet.RegionError = true
      }
      if (!cloudNet['Account ID']) {
        ++errors
        cloudNet['Account IDError'] = true
      }
      if (!cloudNet['Account Name']) {
        ++errors
        cloudNet['Account NameError'] = true
      }
      if (!cloudNet['ITSM']) {
        ++errors
        cloudNet['ITSMError'] = true
      }
    }
    await this.setState({cloudNetworks: cloudNetworks})
    return errors
  }

  cudManager = async () => {
    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const cloudNet of Object.values(cloudNetworks)) {
      if (cloudNet.toDelete) {
        toDelete.push(cloudNet)
      }
      if (cloudNet.isModified && Object.keys(cloudNet.isModified).length > 0) {
        toPatch.push(cloudNet)
      }
      if (!cloudNet.existent) {
        toPost.push(cloudNet)
      }
    }

    console.log('toDelete', toDelete)
    console.log('toPatch', toPatch)
    console.log('toPost', toPost)


    if (toDelete.length > 0) {
      for (const cloudNet of toDelete) {
        //let per = cloudNetworks.find(p => p.id === cloudNet.id)
        cloudNet.loading = true
        await this.setState({cloudNetworks: cloudNetworks})
        let net = cloudNet.network.split('/')
        let n = await this.cloudNetworkDelete(net[0])
        if (n.status && n.status !== 200 ) {
          this.props.dispatch(cloudNetworkDeleteError(n))
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
        else {
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
      }
    }

    if (toPost.length > 0) {
      for (const cloudNet of toPost) {
        let body = {}

        body.data = {
          "provider": cloudNet.Provider,
          "network_data": {
            "network": "next-available",
            "comment": cloudNet.comment,
            "extattrs": {
              "Account ID": {
                "value": cloudNet['Account ID']
              },
              "Account Name": {
                "value": cloudNet['Account Name']
              },
              "Reference": {
                "value": cloudNet.ITSM
              }
            }
          }
        }

        if (cloudNet.Provider === 'AWS') {
          body.data.region = cloudNet.Region
        }

        cloudNet.loading = true
        await this.setState({cloudNetworks: cloudNetworks})

        let cn = await this.cloudNetworkAssign(body)
        if (cn.status && cn.status !== 201 ) {
          this.props.dispatch(assignCloudNetworkError(cn))
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
        else {
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
      }
    }

    this.dataGetHandler('getNetworks', this.props.asset.id)
  }

  cloudNetworkDelete = async (net) => {
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
    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/network/${net}/`, this.props.token )
    return r
  }

  cloudNetworkAssign = async (b) => {
    let r
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/assign-cloud-network/`, this.props.token, b )
    return r
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      ['account ID']: '',
      cloudNetworks: [],
      originCloudNetworks: [],
    })
  }


  render() {

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
            {obj.loading ? <Spin indicator={cloudNetLoadIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'Id',
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
        render: (name, cloudNet)  => (
          createElement('select', 'Provider', 'providers', cloudNet, '')
        )
      },
      {
        title: 'Region',
        align: 'center',
        dataIndex: 'region',
        key: 'region',
        ...this.getColumnSearchProps('region'),
        render: (name, cloudNet)  => (
          createElement('select', 'Region', 'AWS Regions', cloudNet, '')
        )
      },
      {
        title: 'Account ID',
        align: 'center',
        dataIndex: 'Account ID',
        key: 'account ID',
        ...this.getColumnSearchProps('Account ID'),
        render: (name, cloudNet)  => (
          createElement('input', 'Account ID', '', cloudNet, '')
        )
      },
      {
        title: 'Account Name',
        align: 'center',
        dataIndex: 'Account Name',
        key: 'account Name',
        ...this.getColumnSearchProps('Account Name'),
        render: (name, cloudNet)  => (
          createElement('input', 'Account Name', '', cloudNet, '')
        )
      },
      {
        title: 'IT Service Manager',
        align: 'center',
        dataIndex: 'ITSM',
        key: 'reference',
        ...this.getColumnSearchProps('ITSM'),
        render: (name, cloudNet)  => (
          createElement('input', 'ITSM', '', cloudNet, '')
        )
      },
      {
        title: 'Comment',
        align: 'center',
        dataIndex: 'comment',
        key: 'comment',
        ...this.getColumnSearchProps('comment'),
        render: (name, cloudNet)  => (
          createElement('textArea', 'comment', '', cloudNet, '')
        )
      },
      {
        title: 'Delete',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            {obj.existent ?
              <Checkbox
                checked={obj.toDelete}
                onChange={e => this.set('toDelete', e.target.checked, obj)}
              />
            :
              <Button
                type='danger'
                onClick={(e) => this.cloudNetworkRemove(obj)}
              >
                -
              </Button>
            }
          </Space>
        ),
      }
    ];

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          if (key === 'account ID' || key === 'account Name') {
            return (
              <Input
                style=
                {obj[`${key}Error`] ?
                  {borderColor: 'red'}
                :
                  {}
                }
                value={this.state[key]}
                onChange={event => this.set(key, event.target.value)}
                onPressEnter={event => {
                    if (event.target.value) {
                      this.dataGetHandler(action, this.props.asset.id)
                    }
                  }
                }
              />
            )
          }
          else {
            return (
              <Input
                style=
                {obj[`${key}Error`] && key === 'ITSM' ?
                  {borderColor: 'red', width: 200}
                :
                  obj[`${key}Error`] ?
                    {borderColor: 'red'}
                  :
                   key === 'ITSM' ?
                    {width: 200}
                   :
                    {}
                }
                disabled={
                  key === 'Account ID' && this.state['account ID'] ? true
                  :
                  key === 'Account Name' && this.state['account Name'] ? true
                  :
                  false
                }
                value={obj[key]}
                ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
                onChange={event => this.set(key, event.target.value, obj)}
              />
            )
          }

          break;

        case 'button':
          if (action === 'getNetworks') {
            return (
              <Button
                type="primary"
                disabled={(this.state['account ID'] || this.state['account Name']) ? false : true}
                onClick={() => this.dataGetHandler(action, this.props.asset.id)}
              >
                Get cloud networks
              </Button>
            )
          }

      /*  case 'radio':
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
*/
        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={obj[key]}
              ref={ref => this.textAreaRefs[`${obj.id}_${key}`] = ref}
              onChange={event => this.set(key, event.target.value, obj)}
              style={{width: 350}}
            />
          )
          break;

        case 'select':
          return (
            <Select
              value={obj[key]}
              showSearch
              style={
                obj[`${key}Error`] ?
                  {border: `1px solid red`, width: 180}
                :
                  {width: 180}
              }
              disabled={(key === 'Region' && obj.Provider !== 'AWS') ? true : false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set(key, event, obj)}
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
          width={1800}
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
                    {createElement('input', 'account ID', '', '', 'getNetworks')}
                  </Col>

                  <Col span={1}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>or</p>
                  </Col>

                  <Col span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                  </Col>
                  <Col span={4}>
                    {createElement('input', 'account Name', '', '', 'getNetworks')}
                  </Col>

                  <Col offset={1} span={4}>
                    {createElement('button', '', '', '', 'getNetworks')}
                  </Col>
                </Row>

                <Divider/>

                {
                (this.state.cloudNetworks && this.state.cloudNetworks.length > 0) ?
                  <React.Fragment>
                    <Button
                      type="primary"
                      style={{marginLeft: 16 }}
                      onClick={() => this.cloudNetworkAdd()}
                    >
                      Add Cloud Network
                    </Button>
                    <Table
                      columns={columns}
                      style={{width: '100%', padding: 15}}
                      dataSource={this.state.cloudNetworks}
                      bordered
                      rowKey={randomKey}
                      scroll={{x: 'auto'}}
                      pagination={{ pageSize: 10 }}
                    />
                    <Button
                      type="primary"
                      style={{float: 'right', marginRight: 15}}
                      onClick={() => this.validation()}
                    >
                      Commit
                    </Button>
                    <br/>
                  </React.Fragment>
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
            { this.props.cloudNetworkDeleteError ? <Error component={'cloudNetworkDeleteError'} error={[this.props.cloudNetworkDeleteError]} visible={true} type={'cloudNetworkDeleteError'} /> : null }
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
  cloudNetworkDeleteError: state.infoblox.cloudNetworkDeleteError
}))(CloudNetwork);
