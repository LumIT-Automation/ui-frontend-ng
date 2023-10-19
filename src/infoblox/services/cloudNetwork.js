import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'
import ConcertoError from '../../concerto/error'

import {
  err
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
      provider: '',
      ['AWS Regions']: [],
      loading: false,
      accountsLoading: false,
      accounts: [],
      ['Account ID']: '',
      ['Account Name']: '',
      ITSM: '',
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
    console.log(this.state.accounts)

    console.log('cloudNetworks', this.state.cloudNetworks)

    if (this.state.provider !== prevState.provider) {
      this.setState({['Account ID']: '', ['Account Name']: '', ITSM: '',})
      this.dataGetHandler('accountsAndProviders', this.props.asset.id)
    } 

    if ((this.state.provider === prevState.provider) && (this.state['Account ID'] !== prevState['Account ID']) ) {
      this.dataGetHandler('getNetworks', this.props.asset.id)
    } 
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

  /* 
  @ todo
  - new tripla con itsm
  - cancellazione reti di un account id e, quindi cancellazione tripla
  - AZURE REGIONS

  - modifica id/name/itsm
  */
  main = async () => {
    await this.setState({loading: true})
    let conf = []
    let configurationsFetched = await this.dataGet('configuration')

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
    let data

    if (entities === 'accountsAndProviders') {
      await this.setState({accountsLoading: true})
      data = await this.dataGet(entities, assetId)
      if (data.status && data.status !== 200 ) {
        this.props.dispatch(err(data))
        await this.setState({accountsLoading: false})
        return
      }
      else {
        let list = data.data.map(item => {
          console.log(item)
          item.ITSM = item.Reference
          return item
        })
        await this.setState({accountsLoading: false, accounts: list})
      }
    }
    
    if (entities === 'getNetworks') {
      await this.setState({loading: true})
      data = await this.dataGet(entities, assetId)
      if (data.status && data.status !== 200 ) {
        this.props.dispatch(err(data))
        await this.setState({loading: false})
        return
      }
      else {
        try{
          data.data.forEach((item, i) => {
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
          await this.setState({loading: false, originCloudNetworks: data.data, cloudNetworks: data.data})
        }
        catch (error) {
          await this.setState({loading: false})
        }
        
        
      }
    }

    if (entities === 'newAccount') {
      await this.setState({loading: true, ['Account ID']: this.state['New Account ID'], ['Account Name']: this.state['New Account Name'], ITSM: this.state['New ITSM']})
      data = await this.dataGet('getNetworks', assetId)
      if (data.status && data.status !== 200 ) {
        this.props.dispatch(err(data))
        await this.setState({
          loading: false, 
          ['Account ID']: '', 
          ['Account Name']: '', 
          ITSM: '',
          ['New Account ID']: '', 
          ['New Account Name']: '',
          ['New ITSM']: '',
        })
        return
      }
      else {
        data.data.forEach((item, i) => {
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
        await this.setState({
          loading: false, 
          originCloudNetworks: data.data, 
          cloudNetworks: data.data, 
          ['New Account ID']: '', 
          ['New Account Name']: '', 
          ['New ITSM']: ''
        })

        this.dataGetHandler('accountsAndProviders', this.props.asset.id)
      }
    }
    
  }

  dataGet = async (entities, assetId) => {
    let endpoint
    let r

    if (entities === 'configuration') {
      endpoint = `${this.props.vendor}/${entities}/global/`
    }

   /* if (assetId) {
      endpoint = `${this.props.vendor}/${assetId}/${entities}/`
    }*/

    if (entities === 'getNetworks') {
      if (this.state['Account ID']) {
        endpoint = `${this.props.vendor}/${assetId}/networks/?fby=*Account ID&fval=${this.state['Account ID']}&fby=*Environment&fval=Cloud`
      }
      else if(this.state['Account Name']) {
        endpoint = `${this.props.vendor}/${assetId}/networks/?fby=*Account Name&fval=${this.state['Account Name']}&fby=*Environment&fval=Cloud`
      }
    }

    if (entities === 'accountsAndProviders') {
      endpoint = `${this.props.vendor}/${assetId}/list-cloud-extattrs/account+provider/?fby=*Country&fval=Cloud-${this.state.provider}`
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
    if (this.state['Account ID']) {
      p['Account ID'] = this.state['Account ID']
    }
    if (this.state['Account Name']) {
      p['Account Name'] = this.state['Account Name']
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

  /* SET */
  set = async (key, value, cloudNetwork) => {
    console.log('key', key)
    console.log('value', value)
    console.log('cloudNetwork', cloudNetwork)

    let cloudNetworks = JSON.parse(JSON.stringify(this.state.cloudNetworks))
    let origCloudNet
    let cloudNet

    if (key === 'provider') {
      await this.setState({provider: value})
    }

    if (key === 'Account ID') {
      let accounts = JSON.parse(JSON.stringify(this.state.accounts))
      let account = accounts.find( a => a['Account ID'] === value )
      await this.setState({['Account ID']: account['Account ID'], ['Account Name']: account['Account Name'], ITSM: account.ITSM})

      /*
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
      */
    }

    if (key === 'Account Name') {
      let accounts = JSON.parse(JSON.stringify(this.state.accounts))
      let account = accounts.find( a => a['Account Name'] === value )
      await this.setState({['Account ID']: account['Account ID'], ['Account Name']: account['Account Name'], ITSM: account.ITSM})
      /*
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
      */
    }

    if (key === 'New Account ID') {
      await this.setState({['New Account ID']: value})
    }

    if (key === 'New Account Name') {
      await this.setState({['New Account Name']: value})
    }

    if (key === 'New ITSM') {
      await this.setState({['New ITSM']: value})
    }

    if (cloudNetwork) {
      origCloudNet = this.state.originCloudNetworks.find(cn => cn.id === cloudNetwork.id)
      cloudNet = cloudNetworks.find(cn => cn.id === cloudNetwork.id)

      if (key === 'Region') {
        if (this.state.provider === 'AWS') {
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

  /* VALIDATION */

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
     
      if (this.state.provider === 'AWS' && !cloudNet.Region) {
        ++errors
        cloudNet.RegionError = true
      }
    }
    await this.setState({cloudNetworks: cloudNetworks})
    return errors
  }

  /* DISPOSITION */

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
          this.props.dispatch(err(n))
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
          "provider": this.state.provider,
          "network_data": {
            "network": "next-available",
            "comment": cloudNet.comment,
            "extattrs": {
              "Account ID": {
                "value": this.state['Account ID']
              },
              "Account Name": {
                "value": this.state['Account Name']
              },
              "Reference": {
                "value": this.state.ITSM
              }
            }
          }
        }

        if (this.state.provider === 'AWS') {
          body.data.region = cloudNet.Region
        }

        cloudNet.loading = true
        await this.setState({cloudNetworks: cloudNetworks})

        let cn = await this.cloudNetworkAssign(body)
        if (cn.status && cn.status !== 201 ) {
          this.props.dispatch(err(cn))
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
        else {
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
      }
    }

    if (toPatch.length > 0) {
      for (const cloudNet of toPatch) {
        let body = {}

        body.data = {
          "network_data": {
            "network": "next-available",
            "comment": cloudNet.comment,
            "extattrs": {
              "Account ID": {
                "value": this.state['Account ID']
              },
              "Account Name": {
                "value": this.state['Account Name']
              },
              "Reference": {
                "value": this.state.ITSM
              }
            }
          }
        }

        if (this.state.provider === 'AWS') {
          body.data.region = cloudNet.Region
        }

        cloudNet.loading = true
        await this.setState({cloudNetworks: cloudNetworks})
        let net = cloudNet.network.split('/')
        let cn = await this.cloudNetworkModify(net[0], body)
        
        if (cn.status && cn.status !== 200 ) {
          this.props.dispatch(err(cn))
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
        else {
          cloudNet.loading = false
          await this.setState({cloudNetworks: cloudNetworks})
        }
      }
    }

    this.dataGetHandler('accountsAndProviders', this.props.asset.id)
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
    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/delete-cloud-network/${net}/`, this.props.token )
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

  cloudNetworkModify = async (net, b) => {
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
    await rest.doXHR(`${this.props.vendor}/${this.props.asset.id}/modify-cloud-network/${net}/`, this.props.token, b )
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
      provider: '',
      ['Account ID']: '',
      ['Account Name']: '',
      cloudNetworks: [],
      originCloudNetworks: [],
    })
  }
  
  /* RENDER */

  render() {

    let randomKey = () => {
      return Math.random().toString()
    }

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':

          if (key === 'New Account ID' || key === 'New Account Name' || key === 'New ITSM') {
            return (
              <Input
                value={this.state[key]}
                onChange={event => this.set(key, event.target.value)}
              />
            )
          }

          if (key === 'Account ID' || key === 'Account Name') {
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
                value={this.state[key]}
                onChange={event => this.set(key, event.target.value)}
              />
              /*<Input
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
                  key === 'Account ID' && this.state['Account ID'] ? true
                  :
                  key === 'Account Name' && this.state['Account Name'] ? true
                  :
                  false
                }
                value={obj[key]}
                ref={ref => this.myRefs[`${obj.id}_${key}`] = ref}
                onChange={event => this.set(key, event.target.value, obj)}
              />*/
            )
          }

          break;

        case 'button':
          if (action === 'getNetworks') {
            return (
              <Button
                type="primary"
                disabled={(this.state['Account ID'] || this.state['Account Name']) ? false : true}
                onClick={() => this.dataGetHandler(action, this.props.asset.id)}
              >
                Get cloud networks
              </Button>
            )
          }

          if (action === 'newAccount') {
            return (
              <Button
                type="primary"
                disabled={(this.state['New Account ID'] && this.state['New Account Name'] && this.state['New ITSM']) ? false : true}
                onClick={() => this.dataGetHandler(action, this.props.asset.id)}
              >
                Set new Account
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
          if (key === 'Region') {
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
                disabled={(key === 'Region' && this.state.provider !== 'AWS') ? true : false}
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
                  { this.state.provider === 'AWS' ?
                    this.state['AWS Regions'].map((v,i) => {
                      let str = `${v[0].toString()} - ${v[1].toString()}`
                      return (
                        <Select.Option key={i} value={v[1]}>{str}</Select.Option>
                      )
                    })
                  :
                    null 
                  }
                </React.Fragment>
              </Select>
            )
          }
          else if (key === 'Account ID' || key === 'Account Name') {
            return (
              <Select
                value={this.state[key]}
                showSearch
                style={
                  obj[`${key}Error`] ?
                    {border: `1px solid red`, width: 180}
                  :
                    {width: 180}
                }
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onSelect={event => this.set(key, event, '')}
              >
                <React.Fragment>
                  {this.state[`${choices}`].map((n, i) => {
                    return (
                      <Select.Option key={i} value={n[key]}>{n[key]}</Select.Option>
                    )
                  })
                  }
                </React.Fragment>
            </Select>
            )
          }
          else {
            return (
              <Select
                value={this.state[key]}
                showSearch
                style={
                  obj[`${key}Error`] ?
                    {border: `1px solid red`, width: 180}
                  :
                    {width: 180}
                }
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onSelect={event => this.set(key, event, '')}
              >
                <React.Fragment>
                  {this.state[`${choices}`].map((n, i) => {
                    return (
                      <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                  }
                </React.Fragment>
            </Select>
            )
          }
          

        default:

      }

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
        title: 'Region',
        align: 'center',
        dataIndex: 'region',
        key: 'region',
        ...this.getColumnSearchProps('region'),
        render: (name, cloudNet)  => (
          cloudNet.existent ? 
            cloudNet.Region
          :
            createElement('select', 'Region', '', cloudNet, '')
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Provider:</p>
                  </Col>
                  <Col span={4}>
                    {createElement('select', 'provider', 'providers', '', '')}
                  </Col>

                </Row>

                <Row>
                  <Col span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID:</p>
                  </Col>
                  {this.state.accountsLoading ?
                    <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                  :
                    <Col span={4}>
                      {createElement('select', 'Account ID', 'accounts', '', 'getNetworks')}
                    </Col>
                  }
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                  </Col>
                  {this.state.accountsLoading ?
                    <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                  :
                    <Col span={4}>
                      {createElement('select', 'Account Name', 'accounts', '', 'getNetworks')}
                    </Col>
                  }
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ITSM:</p>
                  </Col>
                  {this.state.accountsLoading ?
                    <Spin indicator={spinIcon} style={{marginLeft: '3%'}}/>
                  :
                    <Col span={4}>
                      <p style={{marginRight: 10, marginTop: 5}}>{this.state.ITSM}</p>
                    </Col>
                  }
                </Row>

                <Row>
                  <Col span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account ID:</p>
                  </Col>
                  <Col span={4}>
                    {createElement('input', 'New Account ID', '', '', '')}
                  </Col>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New Account Name:</p>
                  </Col>
                  <Col span={4}>
                    {createElement('input', 'New Account Name', '', '', '')}
                  </Col>
                  <Col span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>New ITSM:</p>
                  </Col>
                  <Col span={4}>
                    {createElement('input', 'New ITSM', '', '', '')}
                  </Col>
                  <Col offset={1} span={2}>
                    {createElement('button', '', '', '', 'newAccount')}
                  </Col>
                </Row>

                <Divider/>

                {
                (this.state.provider && this.state['Account ID'] && this.state['Account Name'] && this.state.ITSM) ?
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
            
            { this.props.err ? <Error component={'assignCloudNetwork'} error={[this.props.err]} visible={true} type={'err'} /> : null }
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

  err : state.infoblox.err,
}))(CloudNetwork);
