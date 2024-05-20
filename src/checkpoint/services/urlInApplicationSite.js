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
import { LoadingOutlined, ReloadOutlined, SearchOutlined, FormOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Modify from './modify'
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class UrlInApplicationSite extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      'change-request-id': 'ITIO-',
      applicationSites: [],
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
    if ( this.state.visible && (this.props.asset && this.props.domain) && (prevProps.domain !== this.props.domain) ) {
      this.setState({applicationSite: ''})
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
      let list = data.data.items.map(a => {
        if (a['meta-info'] && a['meta-info']['creation-time'] && a['meta-info']['creation-time']['iso-8601']) {
          a['creation-time'] = a['meta-info']['creation-time']['iso-8601']
          return a
        }
        else {
          a['creation-time'] = ''
          return a
        }
      })

      list = list.map(a => {
        if (a['url-list']) {
          a['url-list'] = a['url-list'].map(url => {
            return {url: url}
          })
        }
        return a
      })
      await this.setState({applicationSites: list, originApplicationSites: list})
    }

    this.setState({loading: false})
  }

  getData = async (entity, id) => {
    let r
    let endpoint = ''

    if (entity === 'application-sites') {
      endpoint = `checkpoint/${this.props.asset.id}/${this.props.domain}/${entity}/?custom&local`
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
    console.log(obj)
    try {
      let applicationSites = Object.assign([], this.state.applicationSites);
      let applicationSite

      if (key === 'applicationSite') {
        applicationSite = applicationSites.find(as => as.name === value)
        await this.setState({applicationSite: applicationSite, urlInputList: ''})
      }

      if (key === 'change-request-id') {
        await this.setState({['change-request-id']: value, ['change-request-idError']: false})
      }

      if (key === 'urlInputList') {
        await this.setState({urlInputList: value})
      }

      if (key === 'actualUrl') {
        this.setState({actualUrl: value})
      }

      if (key === 'replaceUrl') {
        applicationSite = Object.assign({}, this.state.applicationSite);
        let url = applicationSite['url-list'].find( url => url.url === this.state.actualUrl )
        url.url = value

        console.log(applicationSite)
        await this.setState({applicationSite: applicationSite, actualUrl: value})
      }

      if (key === 'removeUrl') {
        applicationSite = Object.assign({}, this.state.applicationSite);
        console.log(applicationSite['url-list'])
        applicationSite['url-list'] = applicationSite['url-list'].filter( url => url.url !== value)
        console.log(applicationSite['url-list'])
        await this.setState({applicationSite: applicationSite})
      }
    }
    catch (error) {
      console.log(error)
    }
    

  }

  urlListSet = async () => {
    let urlInputList = JSON.parse(JSON.stringify(this.state.urlInputList))
    let applicationSite = Object.assign({}, this.state.applicationSite);
    let list=[], nlist=[], urlsList=[], actualUrls=[]
    let regexp = new RegExp(/^[*]/g);

    try {
      urlInputList = urlInputList.replaceAll('http://','');
      urlInputList = urlInputList.replaceAll('https://','');
      urlInputList = urlInputList.replaceAll(/[\/\\]/g,'');
      urlInputList = urlInputList.replaceAll(/[/\t]/g,' ');
      urlInputList = urlInputList.replaceAll(/[,&#+()$~%'":;~?!<>{}|@$€^]/g,'');
      urlInputList = urlInputList.replaceAll(/[/\r\n]/g,' ');
      urlInputList = urlInputList.replaceAll(/[/\n]/g,' ');
      urlInputList = urlInputList.replace(/[/\s]{1,}/g, ',' )

      list = urlInputList.split(',')
      list = list.forEach(x => {
        if (x.length !== 0) {
          nlist.push(x)
        }
      });

      nlist.forEach(x => {
        if (regexp.test(x)) {
          let father = x.replace('*.', '')
          nlist.push(father)
        }
      });


      applicationSite['url-list'].forEach((item, i) => {
        actualUrls.push(item.url)
      });

      urlsList = actualUrls.concat(nlist)

      let unique = [...new Set(urlsList)];

      urlsList = []
      unique.sort().forEach((item, i) => {
        urlsList.push({url: item})
      });


      applicationSite['url-list'] = urlsList
      await this.setState({applicationSite: applicationSite})
    } catch (error) {
      console.log(error)
    }

  }

/*
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
      //this.reqHandler()
    }
  }*/

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

    const urlColumns = [
      {
        title: 'Url',
        align: 'center',
        width: 'auto',
        dataIndex: 'url',
        key: 'url',
        ...this.getColumnSearchProps('url'),
        render: (name, obj)  => (
          <Input
            //defaultValue={obj.url}
            value={obj.url}
            style={{ width: '150px' }}
            onFocus={() => this.set(obj.url, 'actualUrl')}
            //onBlur={e => this.set(e.target.value, 'replaceUrl')}
            onChange={e => this.set(e.target.value, 'replaceUrl')}
          />
        ),
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <CloseCircleOutlined 
            onClick={() => this.set(obj.url, 'removeUrl', obj)}
          />
        ),
      }
    ]


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
          width={'100%'}
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
                      AppSite
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
                          {this.state.applicationSites.map((as, i) => {
                            return (
                              <Select.Option key={i} value={as.name}>{as.name}</Select.Option>
                            )
                          })
                          }
                        </React.Fragment>
                      </Select>
                    </Col>
                  </Row>

                  <br/>
                  <br/>

                  {this.state.applicationSite ?
                    <React.Fragment>
                      <Row>
                        <Col offset={1} span={9}>
                          <Input.TextArea
                            rows={7}
                            placeholder="Insert your url's list"
                            defaultValue={this.state.urlInputList}
                            onBlur={e => this.set(e.target.value, 'urlInputList')}
                          />
                        </Col>

                        <Col offset={1} span={2}>
                          <Button type="primary" shape='round' onClick={() => this.urlListSet()} >
                            Normalize
                          </Button>
                        </Col>

                        <Col offset={1} span={9}>
                          <Table
                            columns={urlColumns}
                            dataSource={
                              this.state.applicationSite && this.state.applicationSite['url-list'] ? 
                              this.state.applicationSite['url-list']
                              :
                              []
                            }
                            bordered
                            rowKey="name"
                            scroll={{x: 'auto'}}
                            pagination={{ pageSize: 30 }}
                            style={{marginBottom: 10}}
                          />
                        </Col>
                      </Row>
                    </React.Fragment>
                  :
                    null
                  }

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
