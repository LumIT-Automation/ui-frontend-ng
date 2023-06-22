import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'
import ConcertoError from '../../concerto/error'

import {
  assignCloudNetworkError,
} from '../store'

import {
  configurationsError,
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Row, Col, Divider, Input, Radio, Select, Button, Spin, Alert, Result } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class IpComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      providers: ['AWS', 'AZURE', 'GCP', 'ORACLE'],
      ['AWS Regions']: [],
      request: {
        provider: '',
        region: '',
        ['account ID']: '',
        ['account name']: '',
        ['reference']: '',
        comment: '',
      },
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
    if (!this.props.configurationsError) {
      this.main()
    }
  }

  main = async () => {
    await this.setState({loading: true})
    let conf = []
    let configurationsFetched = await this.configurationGet()

    try {
      if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
        this.props.dispatch(configurationsError(configurationsFetched))
        await this.setState({loading: false})
      }
      else {
        if (configurationsFetched.data.configuration.length > 0) {
          conf = JSON.parse(configurationsFetched.data.configuration)
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
    await rest.doXHR('infoblox/configuration/global/', this.props.token)
    return r
  }

  set = async (value, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = value
    await this.setState({request: request})
  }

  validationChecks = async () => {
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let validators = new Validators()

    for (const [key, value] of Object.entries(request)) {
      if (request.provider !== 'AWS' && key === 'region') {
        delete errors[`${key}Error`]
        this.setState({errors: errors})
        continue
      }
      if (value) {
        delete errors[`${key}Error`]
        this.setState({errors: errors})
      }
      else {
        errors[`${key}Error`] = true
        this.setState({errors: errors})
      }
    }
    return errors
  }

  validation = async (action) => {
    await this.validationChecks()

    if (Object.keys(this.state.errors).length === 0) {
      this.assignCloudNetwork()
    }
  }

  assignCloudNetwork = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let b = {}

    b.data = {
      "provider": request.provider,
      "network_data": {
        "network": "next-available",
        "comment": request.comment,
        "extattrs": {
          "Account ID": {
            "value": request['account ID']
          },
          "Account Name": {
            "value": request['account name']
          },
          "Reference": {
            "value": request['reference']
          }
        }
      }
    }

    if (request.provider === 'AWS') {
      b.data.region = `aws-${request.region}`
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PUT",
      resp => {
        if (resp.data) {
          let network = resp.data.split(':')
          network = network[1]
          this.setState({loading: false, response: true, network: network})
        }
        //"network/ZG5zLm5ldHdvcmskMTAuOS4yNy4wLzI0LzA:10.9.27.0/24/default"
        //this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(assignCloudNetworkError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/assign-cloud-network/`, this.props.token, b )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {
        provider: '',
        region: '',
        ['account ID']: '',
        ['account name']: '',
        ['reference']: '',
      },
      errors: {}
    })
  }


  render() {
    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              style=
              {this.state.errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              defaultValue={obj ? obj[key] : this.state.request ? this.state.request[key] : ''}
              onChange={event => this.set(event.target.value, key)}
              onPressEnter={() => this.validation(action)}
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
          width={1500}
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
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Provider:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('radio', 'provider', 'providers')}
                  </Col>
                </Row>
                <br/>

                { this.state.request.provider === 'AWS' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={6} span={2}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Region:</p>
                      </Col>
                      <Col span={8}>
                        {createElement('select', 'region', 'AWS Regions')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('input', 'account ID')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={6} span={2}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('input', 'account name')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IT Service Manager:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('input', 'reference')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Comment:</p>
                  </Col>
                  <Col span={8}>
                    {createElement('textArea', 'comment')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={8} span={16}>
                    <Button
                      type="primary"
                      onClick={() => this.validation()}
                    >
                      {this.props.service}
                    </Button>
                  </Col>
                </Row>
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
            { this.props.assignCloudNetworkError ? <Error component={'assignCloudNetwork'} error={[this.props.assignCloudNetworkError]} visible={true} type={'assignCloudNetworkError'} /> : null }
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
  assignCloudNetworkError: state.infoblox.assignCloudNetworkError,
}))(IpComponent);
