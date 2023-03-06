import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  datacenterServersFetch,
  datacenterServerAddError
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
      types: ['aws', 'azure', 'google'],
      'authentication-methods': ['user-authentication', 'admin-authentication'],
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
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

/*
  "name": "Coso",
  "type": "aws",
  "authentication-method": "user-authentication",
  "access-key-id": "AKIAI4EMUXLDYNO3KFGQ",
  "secret-access-key": "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",
  "region": "eu-west-1",
  "tags": [
      "testone"
  ],
  "color": "orange",
  "comments": "proviamo",
  "details-level": "standard",
  "ignore-warnings": true
*/

  //SETTERS

  set = async (e, component, value) => {
    let data
    let request = JSON.parse(JSON.stringify(this.state.request))
    console.log('e \n', e)
    console.log('value \n', value)

    switch (component) {
      case 'input':
        data = e.target.value
        break;
      case 'textArea':
        data = e.target.value
        break;
      case 'select':
        data = e
        break;
      case 'radio':
        data = e
        break;
      case 'tags':
        data = e
        break;
        break;

      default:
        await this.setState({request: request})
    }

    request[value] = data
    await this.setState({request: request})
    console.log(this.state.request)
    /*switch (label) {
      //input
      case 'name':
      case 'access-key-id':
      case 'secret-access-key':
      case 'comments':
        request[type] = e.target.value
        await this.setState({request: request})
        break;

      //select type
      case 'type':
      case 'authentication-method':
      case 'region':
      case 'details-level':
        request[type] = e
        await this.setState({request: request})
        break;

      //boolean
      case 'ignore-warnings':
        request[type] = e
        await this.setState({request: request})

      //tags
      case 'tags':
        //
        break;

      default:
        await this.setState({request: request})
    }*/
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.name) {
      errors.nameError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.nameError
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

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      //this.datacenterServerAdd()
      console.log('POST con questo body: ', this.state.request)
    }
  }


  //DISPOSAL ACTION
  datacenterServerAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "ipv4-address-first": this.state.request.firstAddress,
      "ipv4-address-last": this.state.request.lastAddress,
    }

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

    let createComponent = (component, value, choices) => {
      switch (component) {
        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${value}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={e => this.set(e, component, value)}
            />
          )
          break;

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              placeholder="Insert your tags's list. &#10;Example: tag1, tag2, ..., tagN"
              value={this.state.request[`${value}`]}
              onChange={e => this.set(e, component, value)}
            />
          )
          break;

        case 'select':
        return (
          <Select
            value={this.state.request[`${value}`]}
            showSearch
            style=
            { this.state.errors[`${value}Error`] ?
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
            onSelect={e => this.set(e, component, value)}
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

        default:

      }

    }
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD ADDRESS RANGE</p>}
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
               title="Address range added"
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
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>type:</p>
                </Col>
                <Col span={8}>
                  {createComponent('select', 'type', 'types')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>authentication-method:</p>
                </Col>
                <Col span={8}>
                  {createComponent('select', 'authentication-method', 'authentication-methods')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>access-key-id:</p>
                </Col>
                <Col span={8}>
                  {createComponent('input', 'access-key-id')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>secret-access-key:</p>
                </Col>
                <Col span={8}>
                  {createComponent('input', 'secret-access-key')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>comments:</p>
                </Col>
                <Col span={8}>
                  {createComponent('textArea', 'comments')}
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

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  datacenterServerAddError: state.checkpoint.datacenterServerAddError
}))(Add);
