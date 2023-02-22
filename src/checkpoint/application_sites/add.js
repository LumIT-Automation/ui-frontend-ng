import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  application_sitesFetch,
  application_siteAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Table, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const deleteIcon = <CloseCircleOutlined/>



class Add extends React.Component {

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

  details = async () => {
    await this.setState({visible: true})

  }

  //SETTERS
  nameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }
  descriptionSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.description = e.target.value
    this.setState({request: request})
  }
  urlListInput = async e => {
    let input = e.target.value
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    delete request.urlList
    delete errors.urlListError
    await this.setState({request: request, errors: errors, input: input})
  }
  urlListSet = async () => {
    console.log('input', this.state.input)
    let input = JSON.parse(JSON.stringify(this.state.input))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let list=[], nlist=[], urlsList=[]
    let regexp = new RegExp(/^[*]/g);

    try {
      input = input.replace('http://','');
      input = input.replace('https://','');
      input = input.replace(/[\/\\]/g,'');
      input = input.replace(/[/\t]/g,' ');
      input = input.replace(/[,&#+()$~%'":;~?!<>{}|@$€^]/g,'');
      input = input.replace(/[/\r\n]/g,' ');
      input = input.replace(/[/\n]/g,' ');
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

      let unique = [...new Set(nlist)];

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

    if (!request.name) {
      errors.nameError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      this.setState({errors: errors})
    }
    if (!request.description) {
      errors.descriptionError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.descriptionError
      this.setState({errors: errors})
    }
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
      this.application_siteAdd()
    }
  }


  //DISPOSAL ACTION
  application_siteAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let list = []
    request.urlList.map( o => {
      list.push(o.url)
    })
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "description": this.state.request.description,
      "url-list": list,
      "primary-category": "Custom_Application_Site",
      "urls-defined-as-regular-expression": true
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(application_siteAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpointd/${this.props.asset.id}/${this.props.domain}/application-sites/`, this.props.token, b)
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
      request: {}
    })
  }


  render() {
    console.log(this.state.request)
    console.log(this.state.errors)

    let cicciput = (obj) => {
      console.log('obj', obj)
    }
    const columns = [
      {
        title: 'Url',
        align: 'center',
        width: 'auto',
        dataIndex: 'url',
        key: 'url',
        //...this.getColumnSearchProps('tags'),
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

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD CUSTOM APPLICATION SITES</p>}
          centered
          destroyOnClose={true}
            maskClosable={false}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Custom application sites added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.nameError ?
                    <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.nameSet(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} onChange={e => this.nameSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Description:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.descriptionError ?
                    <Input style={{width: 250, borderColor: 'red'}} onChange={e => this.descriptionSet(e)} />
                  :
                    <Input defaultValue={this.state.request.description} style={{width: 250}} onChange={e => this.descriptionSet(e)} />
                  }
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
                        showHeader={false}
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
                      showHeader={false}
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
                    Add Custom Application Sites
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.application_siteAddError ? <Error component={'add application_site'} error={[this.props.application_siteAddError]} visible={true} type={'application_siteAddError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  application_siteAddError: state.checkpoint.application_siteAddError,
}))(Add);
