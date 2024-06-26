import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from '../concerto/error'

import {
  err
} from '../concerto/store'

import {
  fetchItems
} from './store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Radio, Checkbox, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const datacenterServerLoading = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      datacenterServers: [],
      defaultCheckedList: [],
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      'key-types': ['predefined', 'tag'],
      'predefined-keys': ['type-in-data-center', 'name-in-data-center', 'ip-address'],
      'tag-keys': ['tag'],
      'details-levels': ['uid', 'standard', 'full'],
      request: {},
      errors: {},

    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.request['key-type'] !== this.state.request['key-type']) {
      let request = JSON.parse(JSON.stringify(this.state.request))
      delete request['key']
      delete request['values']
      this.setState({request: request})
    }

    if (prevState.request['key'] !== this.state.request['key']) {
      let request = JSON.parse(JSON.stringify(this.state.request))
      delete request['values']
      this.setState({request: request})
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.datacenterServersGet()
  }

  datacenterServersGet = async () => {
    this.setState({datacenterServersLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        let list = []
        resp.data.items.forEach((item, i) => {
          list.push(item.name)
        });
        this.setState({datacenterServers: list, datacenterServersLoading: false})
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterQuerysAdd',
          vendor: 'checkpoint',
          errorType: 'datacenterQuerysError'
        })
        this.props.dispatch(err(error))
        this.setState({datacenterServersLoading: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-servers/?local`, this.props.token)

  }

  set = async (e, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = e
    await this.setState({request: request})
  }
  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request['name']) {
      errors['nameError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['nameError']
      await this.setState({errors: errors})
    }

    if (!request['key-type']) {
      errors['key-typeError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['key-typeError']
      await this.setState({errors: errors})
    }

    if (this.state.request['key-type']) {
      if (!request['key']) {
        errors['keyError'] = true
        await this.setState({errors: errors})
      }
      else {
        delete errors['keyError']
        await this.setState({errors: errors})
      }

      if (!request['values']) {
        errors['valuesError'] = true
        await this.setState({errors: errors})
      }
      else {
        delete errors['valuesError']
        await this.setState({errors: errors})
      }
    }

    if (!request['tags']) {
      errors['tagsError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['tagsError']
      await this.setState({errors: errors})
    }

    if (!request['details-level']) {
      errors['details-levelError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['details-levelError']
      await this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.datacenterQueryAdd()
    }
  }


  //DISPOSAL ACTION
  datacenterQueryAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let tags = []
    let values = []
    let l = []

    try {
      l = request.tags.split(',')
      l.forEach((item, i) => {
        tags.push(item.trim())
      });

      l = request.values.split(',')
      l.forEach((item, i) => {
        values.push(item.trim())
      });

    }
    catch (error) {
      console.log(error)
    }

    let b = {}
    b.data = {
      "name": request.name,
      "query-rules": {
        "key-type": request['key-type'],
        "key": request.key,
        "values": values
      },

      "tags": tags,
      "color": "orange",
      "comments": request.comments,
      "details-level": request['details-level'],
      "ignore-warnings": true,
      "ignore-errors": false
    }

    if (this.state.checkedList.length === 0) {
      b.data["data-centers"] = 'All'
    } else {
      b.data["data-centers"] = this.state.checkedList
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterQuerysAdd',
          vendor: 'checkpoint',
          errorType: 'datacenterQueryAddError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-queries/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(fetchItems(true)), 2030)
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

    let errors = () => {
      if (this.props.error && this.props.error.component === 'datacenterQuerysAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const onChange = (list) => {
      this.setState({checkedList: list});
      this.setState({indeterminate: (!!list.length && list.length < this.state.datacenterServers.length)} )
      this.setState({checkAll: list.length === this.state.datacenterServers.length});
    };

    const onCheckAllChange = (e) => {
      this.setState({checkedList : (e.target.checked ? this.state.datacenterServers : []) })
      this.setState({indeterminate: false})
      this.setState({checkAll: e.target.checked})
    };

    let createElement = (component, key, choices) => {

      switch (component) {
        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => this.set(event.target.value, key)}
            />
          )
          break;

        case 'checkbox':
          return (
            <Checkbox
              checked={this.state.request[`${key}`]}
              onChange={event => this.set(event.target.checked, key)}
            />
          )
          break;

        case 'checkboxGroup':
          return (
            <React.Fragment>
              <Checkbox indeterminate={this.state.indeterminate} onChange={onCheckAllChange} checked={this.state.checkAll}>
                Check all
              </Checkbox>
              <Divider />
              <Checkbox.Group options={this.state.datacenterServers} value={this.state.checkedList} onChange={onChange} />
            </React.Fragment>
          )
          break;

        case 'radio':
          return (
            <Radio.Group
              onChange={event => this.set(event.target.value, key)}
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

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              placeholder={
              (key === 'tags') ? "Insert your tags' list, each one comma separated. \nExample: tag1, tag2, ..., tagN" :
              (key === "values") ? "The value(s) of the Data Center property to match the Query Rule. Values are case-insensitive. There is an 'OR' operation between multiple values. \n\nFor key-type 'predefined' and key 'ip-address', the values must be an IPv4 or IPv6 address. \nFor key-type 'tag', the values must be the Data Center tag values. \n\nInsert your values' list, each one comma separated. \nExample: val1, val2, ..., valN" :
              ""
              }
              value={this.state.request[`${key}`]}
              onChange={event => this.set(event.target.value, key)}
              style=
              { this.state.errors[`${key}Error`] ?
                {borderColor: `red`}
              :
                {}
              }
            />
          )
          break;

        case 'select':
          return (
            <Select
              value={this.state.request[`${key}`]}
              showSearch
              style=
              { this.state.errors[`${key}Error`] ?
                {width: "100%", border: `1px solid red`}
              :
                {width: "100%"}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={event => this.set(event, key)}
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
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD DATACENTER SERVER</p>}
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
               title="Datacenter Query addedd"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={8}>
                  {createElement('input', 'name')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key Type:</p>
                </Col>
                <Col span={8}>
                  {createElement('radio', 'key-type', 'key-types')}
                </Col>
              </Row>
              <br/>

              {this.state.request['key-type'] === 'predefined' ?
                <React.Fragment>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('radio', 'key', 'predefined-keys')}
                    </Col>
                  </Row>
                  <br/>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Values:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('textArea', 'values')}
                    </Col>
                  </Row>
                  <br/>
                </React.Fragment>
              :
                null
              }

              {this.state.request['key-type'] === 'tag' ?
                <React.Fragment>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('radio', 'key', 'tag-keys')}
                    </Col>
                  </Row>
                  <br/>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Values:</p>
                    </Col>
                    <Col span={7}>
                      {createElement('textArea', 'values')}
                    </Col>
                  </Row>
                  <br/>
                </React.Fragment>
              :
                null
              }

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenters:</p>
                </Col>
                {this.state.datacenterServersLoading ?
                  <Col span={8}>
                    <Spin indicator={datacenterServerLoading} style={{margin: 'auto 48%'}}/>
                  </Col>
                :
                <Col span={8}>
                  {createElement('checkboxGroup')}
                </Col>
                }

              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags:</p>
                </Col>
                <Col span={8}>
                  {createElement('textArea', 'tags')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Comments:</p>
                </Col>
                <Col span={8}>
                  {createElement('textArea', 'comments')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Details-level:</p>
                </Col>
                <Col span={8}>
                  {createElement('radio', 'details-level', 'details-levels')}
                </Col>
              </Row>
              <br/>



              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Datacenter Query
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
  domain: state.checkpoint.domain
}))(Add);
