import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import ConcertoError from '../../concerto/error'
import Validators from '../../_helpers/validators'

import {
  datacenterServersFetch,
  datacenterServerAddError
} from '../store'

import {
  configurationsError
} from '../../concerto/store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Radio, Checkbox } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      ['AWS Regions']: [],
      types: ['aws', 'azure', 'gcp'],
      'aws-authentication-methods': ['user-authentication', 'role-authentication'],
      'azure-authentication-methods': ['user-authentication', 'service-principal-authentication'],
      'gcp-authentication-methods': ['key-authentication', 'vm-instance-authentication'],
      'azure-environment': ['AzureCloud', 'AzureChinaCloud', 'AzureUSGovernment'],
      'details-levels': ['uid', 'standard', 'full'],
      request: {},
      errors: {},

    };
  }

  componentDidMount() {
    if (!this.props.configurationsError) {
      this.main()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  //SETTERS

  main = async () => {
    await this.setState({loading: true})
    let conf = []
    let configurationsFetched = await this.configurationGet()
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      this.props.dispatch(configurationsError(configurationsFetched))
      await this.setState({loading: false})
      return
    }
    else {
      if (configurationsFetched.data.configuration.length > 0) {
        try {
          conf = configurationsFetched.data.configuration
          conf.forEach((item, i) => {
            if (item.key === 'AWS Regions') {
              let list = JSON.parse(item.value)
              this.setState({['AWS Regions']: list})
            }
          });
        } catch (error) {
          console.log(error)
        }
      }
      await this.setState({loading: false})
    }
  }

  configurationGet = async () => {
    let r

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR('checkpoint/configuration/global/', this.props.token)
    return r
  }

  set = async (e, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = e
    await this.setState({request: request})
    console.log(this.state.request)
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

    if (!request['type']) {
      errors['typeError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['typeError']
      await this.setState({errors: errors})
    }

    if (!request['authentication-method']) {
      errors['authentication-methodError'] = true
      await this.setState({errors: errors})
    }
    else {
      delete errors['authentication-methodError']
      await this.setState({errors: errors})
    }

    if (this.state.request.type !== 'aws') {
      delete errors['access-key-idError']
      delete errors['secret-access-keyError']
      delete errors['regionError']
      delete errors['sts-roleError']
    }

    if (this.state.request.type !== 'azure') {
      delete errors['application-idError']
      delete errors['application-keyError']
      delete errors['directory-idError']
      delete errors['usernameError']
      delete errors['passwordError']
      delete errors['password-base64Error']
      delete errors['environmentError']
    }

    if (this.state.request.type !== 'gcp') {
      delete errors['private-keyError']
    }

    if (this.state.request.type === 'aws') {
      if (!request['access-key-id']) {
        errors['access-key-idError'] = true
        await this.setState({errors: errors})
      }
      else {
        delete errors['access-key-idError']
        await this.setState({errors: errors})
      }

      if (!request['secret-access-key']) {
        errors['secret-access-keyError'] = true
        await this.setState({errors: errors})
      }
      else {
        delete errors['secret-access-keyError']
        await this.setState({errors: errors})
      }

      if (!request['region']) {
        errors['regionError'] = true
        await this.setState({errors: errors})
      }
      else {
        delete errors['regionError']
        await this.setState({errors: errors})
      }

      if (request['enable-sts-assume-role']) {
        if (!request['sts-role']) {
          errors['sts-roleError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['sts-roleError']
          await this.setState({errors: errors})
        }
      } else {
        delete errors['sts-roleError']
      }
    }

    if (this.state.request.type === 'azure') {
      if (request['authentication-method'] === 'user-authentication') {
        if (!request['username']) {
          errors['usernameError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['usernameError']
          await this.setState({errors: errors})
        }

        if (!request['password'] && !request['password-base64']) {
          errors['passwordError'] = true
          errors['password-base64Error'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['passwordError']
          delete errors['password-base64Error']
          await this.setState({errors: errors})
        }
      }
      else {
        delete errors['usernameError']
        delete errors['passwordError']
        delete errors['password-base64Error']
      }

      if (request['authentication-method'] === 'service-principal-authentication') {
        if (!request['application-id']) {
          errors['application-idError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['application-idError']
          await this.setState({errors: errors})
        }

        if (!request['application-key']) {
          errors['application-keyError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['application-keyError']
          await this.setState({errors: errors})
        }

        if (!request['directory-id']) {
          errors['directory-idError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['directory-idError']
          await this.setState({errors: errors})
        }
      } else {
        delete errors['application-idError']
        delete errors['application-keyError']
        delete errors['directory-idError']
      }

    }

    if (this.state.request.type === 'gcp') {
      if (request['authentication-method'] === 'key-authentication') {
        if (!request['private-key']) {
          errors['private-keyError'] = true
          await this.setState({errors: errors})
        }
        else {
          delete errors['private-keyError']
          await this.setState({errors: errors})
        }
      } else {
        delete errors['private-keyError']
      }
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
      this.datacenterServerAdd()
    }
  }


  //DISPOSAL ACTION
  datacenterServerAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let list = []
    let l = []
    try {
      l = request.tags.split(',')

      l.forEach((item, i) => {
        list.push(item)
      });
    }
    catch (error) {
      console.log(error)
    }


    let b = {}
    b.data = {
      "name": request.name,
      "type": request.type,
      "authentication-method": request['authentication-method'],
      "tags": list,
      "color": "orange",
      "comments": request.comments,
      "details-level": request['details-level'],
      "ignore-warnings": true,
      "ignore-errors": false
    }

    if (this.state.request.type === 'aws') {
      b.data["access-key-id"] = request["access-key-id"]
      b.data["secret-access-key"] = request["secret-access-key"]
      b.data["region"] = request["region"]
      if (request["enable-sts-assume-role"]) {
        b.data["enable-sts-assume-role"] = request["enable-sts-assume-role"]
        b.data["sts-role"] = request["sts-role"]
        if (request["sts-external-id"]) {
          b.data["sts-external-id"] = request["sts-external-id"]
        }
      }
      /*
      b["access-key-id"] = "AKIAI4EMUXLDYNO3KFGQ"
      b["secret-access-key"] = "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"
      b["region"] = "eu-west-1"
      */
    }

    if (this.state.request.type === 'azure') {
      if (request['authentication-method'] === 'user-authentication') {
        b.data["username"] = request["username"]

        if (request["password"]) {
          b.data["password"] = request["password"]
        }
        else {
          b.data["password-base64"] = request["password-base64"]
        }
      }

      if (request['authentication-method'] === 'service-principal-authentication') {
        b.data["application-id"] = request["application-id"]
        b.data["application-key"] = request["application-key"]
        b.data["directory-id"] = request["directory-id"]
      }

      if (!request["environment"]) {
        b.data["environment"] = "AzureCloud"
      }
      else {
        b.data["environment"] = request["environment"]
      }

      /*
      b["application-id"] = "936aa61f-e04f-479c-a0fb-58d10f0e4016"
      b["application-key"] = "HiDrju0Ck2mluOv6sMh9s6h2aYvuV3wNYeHl5tKWlto="
      b["directory-id"] = "e97896c5-9549-48fb-976d-ef5f2c7dcbfc"
      */
    }

    if (this.state.request.type === 'gcp') {
      if (request["authentication-method"] === "key-authentication") {
        b.data["private-key"] = request["private-key"]
      }
    }

    console.log(b)
    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(datacenterServerAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-servers/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(datacenterServersFetch(true)), 2030)
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
    console.log(this.state.errors)
    console.log(this.props.configurationsError)



    let createComponent = (component, key, choices) => {

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

        case 'radio':
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

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              placeholder={key === 'tags' ? "Insert your tags's list. Example: tag1, tag2, ..., tagN" : ""}
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
               title="Datacenter Server addedd"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={8}>
                  {createComponent('input', 'name')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Type:</p>
                </Col>
                <Col span={8}>
                  {createComponent('radio', 'type', 'types')}
                </Col>
              </Row>
              <br/>

              {this.state.request.type === 'aws' ?
                <React.Fragment>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('radio', 'authentication-method', 'aws-authentication-methods')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Access-key-id:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('input', 'access-key-id')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Secret-access-key:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('input', 'secret-access-key')}
                    </Col>
                  </Row>
                  <br/>

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Enable-sts-assume-role:</p>
                    </Col>
                    <Col span={7} style={{marginTop: 5}}>
                      {createComponent('checkbox', 'enable-sts-assume-role')}
                    </Col>
                  </Row>
                  <br/>

                  {this.state.request['enable-sts-assume-role'] ?
                    <React.Fragment>
                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Sts-role:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'sts-role')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Sts-external-id:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'sts-external-id')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Region:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('select', 'region', 'AWS Regions')}
                    </Col>
                  </Row>
                  <br/>
                </React.Fragment>
              :
                null
              }

              {this.state.request.type === 'azure' ?
                <React.Fragment>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('radio', 'authentication-method', 'azure-authentication-methods')}
                    </Col>
                  </Row>
                  <br/>

                  { this.state.request['authentication-method'] === 'service-principal-authentication' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Application-id:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'application-id')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Application-key:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'application-key')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Directory-id:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'directory-id')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }
                  { this.state.request['authentication-method'] === 'user-authentication' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Username:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'username')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'password')}
                        </Col>
                      </Row>
                      <br/>

                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password-base64:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('input', 'password-base64')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }

                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('radio', 'environment', 'azure-environment')}
                    </Col>
                  </Row>
                  <br/>

                </React.Fragment>
              :
                null
              }

              {this.state.request.type === 'gcp' ?
                <React.Fragment>
                  <Row>
                    <Col offset={3} span={6}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                    </Col>
                    <Col span={7}>
                      {createComponent('radio', 'authentication-method', 'gcp-authentication-methods')}
                    </Col>
                  </Row>
                  <br/>

                  { this.state.request['authentication-method'] === 'key-authentication' ?
                    <React.Fragment>
                      <Row>
                        <Col offset={3} span={6}>
                          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Private-key:</p>
                        </Col>
                        <Col span={7}>
                          {createComponent('textArea', 'private-key')}
                        </Col>
                      </Row>
                      <br/>
                    </React.Fragment>
                  :
                    null
                  }
                </React.Fragment>
              :
                null
              }

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags:</p>
                </Col>
                <Col span={8}>
                  {createComponent('textArea', 'tags')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Comments:</p>
                </Col>
                <Col span={8}>
                  {createComponent('textArea', 'comments')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Details-level:</p>
                </Col>
                <Col span={8}>
                  {createComponent('radio', 'details-level', 'details-levels')}
                </Col>
              </Row>
              <br/>



              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Datacenter Server
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.datacenterServerAddError ? <Error component={'add datacenterServer'} error={[this.props.datacenterServerAddError]} visible={true} type={'datacenterServerAddError'} /> : null }
          </React.Fragment>
        :
          null
        }

        { this.props.configurationsError ? <ConcertoError vendor={this.props.vendor} error={[this.props.configurationsError]} visible={true} type={'configurationsError'} /> : null }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  datacenterServerAddError: state.checkpoint.datacenterServerAddError,
  configurationsError: state.concerto.configurationsError,
}))(Add);
