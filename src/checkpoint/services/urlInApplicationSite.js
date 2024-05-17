import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
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



class UrlInApplicationSite extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      'change-request-id': 'ITIO-',
      applicationSites: [],
      applicationSitesCategories: [],
      applicationSite: {},
      errors: {},
      applicationSiteError: ''
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('applicationSites', this.state.applicationSites)
    console.log('applicationSitesCategories', this.state.applicationSitesCategories)
    if ( this.state.visible && (this.props.asset && this.props.domain) && (prevProps.domain !== this.props.domain) ) {
      this.setState({applicationSite: '', applicationSitesCategories: ''})
      this.dataGet() 
    }
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
    let list = JSON.parse(JSON.stringify(this.state.applicationSites))
    this.setState({loading: true})

    let data = await this.getData('application-sites')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'urlInApplicationSite',
        vendor: 'checkpoint',
        errorType: 'applicationSitesError'
      })
      this.props.dispatch(err(error))
      this.setState({loading: false})
      return
    }
    else {
      await this.setState({applicationSites: data.data.items})
    }

    /*
    data = await this.getData('application-site-categories')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'urlInApplicationSite',
        vendor: 'checkpoint',
        errorType: 'applicationSitesCategoriesError'
      })
      this.props.dispatch(err(error))
      this.setState({loading: false})
      return
    }
    else {
      await this.setState({applicationSitesCategories: data.data.items})
    }

/*
    data = await this.getData('urls')
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'urlInApplicationSite',
        vendor: 'checkpoint',
        errorType: 'urlsError'
      })
      this.props.dispatch(err(error))
      this.setState({loading: false})
      return
    }
    else {
      await this.setState({urls: data.data.items, loading: false})
    }*/

    this.setState({loading: false})
  }

  getApplicationSiteUrls = async () => {
    let applicationSite = Object.assign([], this.state.applicationSite);
    this.setState({ghLoading: true})

    let data = await this.getData('applicationSite-urls', applicationSite.uid)
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'urlInApplicationSite',
        vendor: 'checkpoint',
        errorType: 'applicationSiteUrlsError'
      })
      this.props.dispatch(err(error))
      this.setState({ghLoading: false})
      return
    }
    else {
      applicationSite.members = data.data.items
      let id = 1
      applicationSite.members.forEach((item, i) => {
        item.applicationSiteMember = true
        item.flagged = true
        item.id = id 
        id++
      });
      await this.setState({applicationSite: applicationSite, ghLoading: false})
    }

  }

  getData = async (entity, id) => {
    let r
    let endpoint = ''

    if (entity === 'application-sites') {
      endpoint = `checkpoint/${this.props.asset.id}/${this.props.domain}/${entity}/?custom&local`
    }
    if (entity === 'application-site-categories') {
      endpoint = `checkpoint/${this.props.asset.id}/${this.props.domain}/${entity}/`
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
    let applicationSite = Object.assign([], this.state.applicationSite);
    applicationSite.members = list
    await this.setState({applicationSite: applicationSite})
  }

  itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions()
    let list = await commonFunctions.itemRemove(item, items)
    let applicationSite = Object.assign([], this.state.applicationSite);
    applicationSite.members = list
    await this.setState({applicationSite: applicationSite})
  }

  set = async (value, key, obj) => {
    let applicationSites = Object.assign([], this.state.applicationSites);
    let applicationSite = applicationSites.find(g => g.name === value)
    let urls = Object.assign([], this.state.urls);
    let url
    let member

    if (key === 'applicationSite') {
      await this.setState({applicationSite: applicationSite, applicationSiteError: ''})
      this.getApplicationSiteUrls()
    }
    if (key === 'flag') {
      applicationSite = Object.assign([], this.state.applicationSite);
      let url = applicationSite.members.find(h => h.name === obj.name)
      url.flagged = !url.flagged
      await this.setState({applicationSite: applicationSite})
    }
    if (key === 'urlname') {
      applicationSite = Object.assign([], this.state.applicationSite);
      url = urls.find(h => h.name === value)
      member = applicationSite.members.find(m => m.id === obj.id)
      member = Object.assign(member, url);
      delete member.nameError
      delete member.ipError
      await this.setState({applicationSite: applicationSite})
    }
    if (key === 'ipv4-address') {
      applicationSite = Object.assign([], this.state.applicationSite);
      url = urls.find(h => h['ipv4-address'] === value)
      member = applicationSite.members.find(m => m.id === obj.id)
      member = Object.assign(member, url);
      delete member.ipError
      delete member.nameError
      await this.setState({applicationSite: applicationSite})
    }

    if (key === 'change-request-id') {
      await this.setState({['change-request-id']: value, ['change-request-idError']: false})
    }

  }


  validationCheck = async () => {
    let validators = new Validators()
    let applicationSite = Object.assign([], this.state.applicationSite);
    let ok = true

    if (!this.state['change-request-id']) {
      await this.setState({['change-request-idError']: true})
    }

    if (!this.state.applicationSite) {
      await this.setState({applicationSiteError: true})
    }

    applicationSite.members.forEach(element => {
      if (!element.name) {
        element.nameError = true
        ok = false
      }
      if (!validators.ipv4(element['ipv4-address'])) {
        element.ipError = true
        ok = false
      }
    });

    this.setState({applicationSite: applicationSite})
    return ok
  }

  validation = async () => {
    await this.validationCheck()

    let valid = await this.validationCheck()
    if (valid) {
      this.reqHandler()
    }
  }

  reqHandler = async () => {
    let applicationSite = Object.assign([], this.state.applicationSite);
    let toRemove = []
    let toAdd = []

    applicationSite.members.forEach(element => {
      if (element.applicationSiteMember && !element.flagged) {
        toRemove.push(element.uid)
      }
      if (!element.applicationSiteMember) {
        toAdd.push(element.uid)
      }
    })

    if (toRemove.length > 0 || toAdd.length > 0) {
      if (toRemove.length > 0) {
        await this.setState({loading: true})
        let data = await this.toDel(toRemove)
        await this.setState({loading: false})
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'urlInApplicationSite',
            vendor: 'checkpoint',
            errorType: 'deleteUrlsError'
          })
          this.props.dispatch(err(error))
          return
        }
      }
  
      if (toAdd.length > 0) {
        await this.setState({loading: true})
        let data = await this.toAdd(toAdd)
        await this.setState({loading: false})
        if (data.status && data.status !== 200 ) {
          let error = Object.assign(data, {
            component: 'urlInApplicationSite',
            vendor: 'checkpoint',
            errorType: 'addUrlsError'
          })
          this.props.dispatch(err(error))
          return
        }
      }
      
      await this.getApplicationSiteUrls()
    }
    
  }

  toDel = async (list) => {

    let body = {}

    body.data = {
      "url-list": list,
      "change-request-id": this.state['change-request-id']
    }

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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/applicationsite-urls/${this.state.applicationSite.uid}/`, this.props.token, body )
    return r
  }


  toAdd = async (list) => {

    let body = {}

    body.data = {
      "url-list": list,
      "change-request-id": this.state['change-request-id']
    }

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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/applicationSite-urls/${this.state.applicationSite.uid}/`, this.props.token, body )
    return r
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
      if (this.props.error && this.props.error.component === 'urlInApplicationSite') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }


    return (

      <Space direction='vertical'>

        <Button type="primary" onClick={() => this.details()}>Url In ApplicationSite</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Url In ApplicationSite</p>}
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
                    <Col offset={6} span={3}>
                      Change request id
                    </Col>

                    <Col span={6}>
                      <Input
                        defaultValue={this.state['change-request-id']}
                        placeholder='ITIO-6 to 18 numbers'
                        style={this.state['change-request-idError'] ? {borderColor: 'red'} : null}
                        onBlur={e => this.set(e.target.value, 'change-request-id')}
                      />
                    </Col>
                  </Row>

                  <br/>

                  <Row>
                    <Col offset={6} span={3}>
                      ApplicationSite
                    </Col>
                    <Col span={6}>
                      <Select
                        value={this.state.applicationSite ? this.state.applicationSite.name : ''}
                        showSearch
                        style={this.state.applicationSiteError ? {width: '100%', border: `1px solid red`} : {width: '100%'} }
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onSelect={g => this.set(g, 'applicationSite')}
                      >
                        <React.Fragment>
                          {this.state.applicationSites.map((g, i) => {
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
                  
                  {/*this.state.applicationSite ?
                  :
                    null
                  */}

                  <br/>

                  <Row>
                    <Col offset={11} span={2}>
                      {(this.state.loading || !this.state.applicationSite || !this.state['change-request-id']) ?
                        <Button type="primary" shape='round' disabled>
                          Modify ApplicationSite
                        </Button>
                      :
                        <Button type="primary" shape='round' onClick={() => this.validation()} >
                          Modify ApplicationSite
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
}))(UrlInApplicationSite);
