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

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {
        urlList: ["www.firsturl.com", "www.secondurl.com", "www.etc.com"]
      }
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
  application_site_categorySet = (e, v) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.application_site_category = v
    this.setState({request: request})
  }
  urlListSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.urlList = e.target.value
    this.setState({request: request})
  }



  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

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
    if (!request.application_site_category) {
      errors.application_site_categoryError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.application_site_categoryError
      this.setState({errors: errors})
    }
    if (!request.urlList) {
      errors.urlListError = true
      this.setState({errors: errors})
    }
    else {
      delete errors.urlListError
      this.setState({errors: errors})
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
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "description": this.state.request.description,
      "url-list": this.state.request.urlList,
      "primary-category": this.state.request.application_site_category,
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
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/application-sites/`, this.props.token, b)
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
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD CUSTOM APPLICATION SITES</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
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
                <Col offset={2} span={6}>
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
                <Col offset={2} span={6}>
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
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Application sites category:</p>
                </Col>
                <Col span={16}>
                  <React.Fragment>
                  { this.props.application_site_categorysLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
                  :
                    <React.Fragment>
                      {this.state.errors.application_site_categoryError ?
                        <React.Fragment>
                          <Select
                            style={{ width: '250px'}}
                            value={this.state.request.application_site_category}
                            onChange={(value, event) => this.application_site_categorySet(event, value)}>
                            { this.props.application_site_categorys ? this.props.application_site_categorys.map((d, i) => {
                              return (
                                <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                                )
                              })
                            :
                              null
                            }
                          </Select>
                          <p style={{color: 'red'}}>Select a category</p>
                        </React.Fragment>
                      :
                        <React.Fragment>
                        <React.Fragment>
                          <Select
                            style={{ width: '250px'}}
                            value={this.state.request.application_site_category}
                            onChange={(value, event) => this.application_site_categorySet(event, value)}>
                            { this.props.application_site_categorys ? this.props.application_site_categorys.map((d, i) => {
                              return (
                                <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                                )
                              })
                            :
                              null
                            }
                          </Select>
                        </React.Fragment>
                        </React.Fragment>
                      }
                    </React.Fragment>
                  }
                  </React.Fragment>
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Url list:</p>
                </Col>
                <Col span={16}>
                {this.state.errors.urlListError ?
                  <Input.TextArea
                    rows={25}
                    style={{width: 250, borderColor: 'red'}}
                    onChange={e => this.urlListSet(e)}
                  />
                :
                  <Input.TextArea
                    rows={15}
                    style={{width: 250}}
                    defaultValue={this.state.request.urlList}
                    onChange={e => this.urlListSet(e)}
                  />
                }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
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
  application_site_categorysLoading: state.checkpoint.application_site_categorysLoading,
  application_site_categorys: state.checkpoint.application_site_categorys
}))(Add);
