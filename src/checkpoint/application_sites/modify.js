import React from 'react'
import {useRef} from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  application_sitesFetch,
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Table, Divider } from 'antd';

import { LoadingOutlined, EditOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />
const deleteIcon = <CloseCircleOutlined/>



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      input: [],
      errors: {},
      request: {}
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

  details = async () => {
    await this.setState({visible: true})
    let request = JSON.parse(JSON.stringify(this.state.request))
    //request.name = this.props.obj
    request.name = this.props.obj.name
    request.description = this.props.obj.description

    let list = []
    this.props.obj['url-list'].forEach( o => {
      list.push({url: o})
    })
    request.urlList = list
    await this.setState({request: request})
  }

  //SETTERS
  urlListInput = async e => {
    let input = e.target.value
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    await this.setState({request: request, errors: errors, input: input})
  }
  urlListSet = async () => {
    let input = JSON.parse(JSON.stringify(this.state.input))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let list=[], nlist=[], urlsList=[], actualUrls=[]
    let regexp = new RegExp(/^[*]/g);

    try {
      input = input.replaceAll('http://','');
      input = input.replaceAll('https://','');
      input = input.replaceAll(/[\/\\]/g,'');
      input = input.replaceAll(/[/\t]/g,' ');
      input = input.replaceAll(/[,&#+()$~%'":;~?!<>{}|@$€^]/g,'');
      input = input.replaceAll(/[/\r\n]/g,' ');
      input = input.replaceAll(/[/\n]/g,' ');
      input = input.replace(/[/\s]{1,}/g, ',' )

      list = input.split(',')
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


      request.urlList.forEach((item, i) => {
        actualUrls.push(item.url)
      });

      urlsList = actualUrls.concat(nlist)

      let unique = [...new Set(urlsList)];

      urlsList = []
      unique.sort().forEach((item, i) => {
        urlsList.push({url: item})
      });


      request.urlList = urlsList
    } catch (error) {
      console.log(error)
    }

    await this.setState({request: request})
  }

  urlSet = async obj => {
    await this.setState({url: obj.url})
  }

  urlModify = async value => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let item
    item = request.urlList.find( o => o.url === this.state.url )
    item.url = value
    await this.setState({url: value, request: request})
  }

  removeUrl = async obj => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let list = []
    request.urlList.map( o => {
      if (o.url !== obj.url) {
        list.push(o)
      }
    })
    request.urlList = list
    await this.setState({request: request})
  }



  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()
    let regexp = new RegExp(/^[*]/g);

    if (!request.urlList) {
      errors.urlListError = true
      this.setState({errors: errors})
    }
    else {
      for await (let item of request.urlList) {
        if (regexp.test(item.url)) {
          continue
        }
        if (!validators.fqdn(item.url)) {
          errors.urlListError = item.url
          await this.setState({errors: errors})
          break
        }
        else {
          delete errors.urlListError
          await this.setState({errors: errors})
        }
      }
    }
    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.application_siteModify()
    }
  }


  //DISPOSAL ACTION
  application_siteModify = async () => {
    let request = Object.assign({}, this.state.request)
    let list = []
    request.urlList.forEach( o => {
      list.push(o.url)
    })
    let b = {}
    b.data = {
      "url-list": list,
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        error = Object.assign(error, {
          component: 'application_sitesModify',
          vendor: 'checkpoint',
          errorType: 'application_siteModifyError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/application-site/${this.props.obj.uid}/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(application_sitesFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {},
      input: []
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'application_sitesModify') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const columns = [
      {
        title: 'Url',
        align: 'center',
        width: 'auto',
        dataIndex: 'url',
        key: 'url',
        ...this.getColumnSearchProps('url'),
        render: (name, obj)  => (
          <Input
            placeholder={obj.url}
            value={obj.url}
            style={{ width: '150px' }}
            onFocus={() => this.urlSet(obj)}
            onChange={e => this.urlModify(e.target.value)}
            onPressEnter={null}
          />
        ),
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <CloseCircleOutlined onClick={() => this.removeUrl(obj)}/>
        ),
      }
    ]
    return (
      <Space direction='vertical'>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify urls</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Custom application sites modified"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  <Input defaultValue={this.state.request.name} style={{width: 250}} disabled/>
                </Col>
              </Row>
              <br/>

              <Row>
                <Col span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Description:</p>
                </Col>
                <Col span={16}>
                  <Input defaultValue={this.state.request.description} style={{width: 250}} disabled/>
                </Col>
              </Row>

              <Divider/>

              {/* radio button  per text area o tabella */}
              <Row>
                <Col offset={1} span={9}>
                  <Input.TextArea
                    rows={7}
                    placeholder="Insert your url's list"
                    value={this.state.input}
                    onChange={e => this.urlListInput(e)}
                  />
                </Col>

                <Col offset={1} span={2}>
                  <Button type="primary" shape='round' onClick={() => this.urlListSet()} >
                    Normalize
                  </Button>
                </Col>

                <Col offset={1} span={9}>
                  {this.state.errors.urlListError ?
                    <React.Fragment>
                      <Table
                        columns={columns}
                        dataSource={this.state.request.urlList}
                        bordered
                        rowKey="name"
                        scroll={{x: 'auto'}}
                        pagination={{ pageSize: 10 }}
                        rowClassName={ (record, index) => (record.url === this.state.errors.urlListError) ? "rowClassName1" : "" }
                        style={{marginBottom: 10}}
                      />
                      {this.state.errors.urlListError && (this.state.errors.urlListError.length > 0) ?
                        <React.Fragment>
                          <p><span style={{color: 'red'}}>{this.state.errors.urlListError}</span> is not a valid fqdn. <a href="https://www.ietf.org/rfc/rfc952.txt" target="_blank">rfc952</a> or <a href="https://www.ietf.org/rfc/rfc1123.txt" target="_blank">rfc1123</a> for more details.</p>
                        </React.Fragment>
                      :
                        null
                      }

                    </React.Fragment>
                  :
                    <Table
                      columns={columns}
                      dataSource={this.state.request.urlList}
                      bordered
                      rowKey="name"
                      scroll={{x: 'auto'}}
                      pagination={{ pageSize: 10 }}
                      style={{marginBottom: 10}}
                    />
                  }
                </Col>
              </Row>
              <br/>

              <Row>

              </Row>

              <Row>
                <Col offset={10} span={3}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Modify Custom Application Sites
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
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
