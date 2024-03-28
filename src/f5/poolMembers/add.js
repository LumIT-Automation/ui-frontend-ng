import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Validators from '../../_helpers/validators'
import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'


import {
  poolMembersLoading,
  poolMembersFetch,
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const rdIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);

    this.myRefs = {};

    this.state = {
      visible: false,
      states: ['enabled', 'disabled', 'forced offline'],
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
    this.main()
  }


  main = async () => {
    await this.setState({nodesLoading: true})
    let nodesFetched = await this.nodesGet()
    await this.setState({nodesLoading: false})
    if (nodesFetched.status && nodesFetched.status !== 200 ) {
      let error = Object.assign(nodesFetched, {
        component: 'poolMembersAdd',
        vendor: 'f5',
        errorType: 'nodesError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      await this.setState({nodes: nodesFetched.data.items})
    }
  }


  //FETCH
  nodesGet = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
    return r
  }


  //SETTERS
  set = async (value, key, obj) => {

    if (key === 'existentNode') {
      let nodes = JSON.parse(JSON.stringify(this.state.nodes))
      let node = nodes.find(n => n.name === value)
      await this.setState({node: node, existentNode: node, address: node.address, addressError: ''})
    }

    if (key === 'address') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`address`]
      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      await this.setState({address: value, addressError: ''})
      ref = this.myRefs[`address`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'port') {
      let start = 0
      let end = 0
      let ref = this.myRefs[`port`]
      if (ref && ref.input) {
        start = ref.input.selectionStart
        end = ref.input.selectionEnd
      }

      await this.setState({port: value, portError: ''})
      ref = this.myRefs[`port`]

      if (ref && ref.input) {
        ref.input.selectionStart = start
        ref.input.selectionEnd = end
      }

      ref.focus()
    }

    if (key === 'status') {
      if (value === 'enabled') {
        await this.setState({status: value, session: 'user-enabled', state: 'user-up'})
      }
      else if (value === 'disabled') {
        await this.setState({status: value, session: 'user-disabled', state: 'user-down'})
      }
      else if (value === 'forced offline') {
        await this.setState({status: value, session: 'user-disabled'})
      }
      else {}
      
    }

  }

  //VALIDATION
  validationCheck = async () => {

    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.poolMemberAdd()
    }
  }


  //DISPOSAL ACTION
  poolMemberAdd = async () => {
    let b = {}
    b.data = {
        "name": `/${this.props.partition}/${this.state.address}:${this.state.port}`,
        "connectionLimit": 0,
        "dynamicRatio": 1,
        "ephemeral": "false",
        "inheritProfile": "enabled",
        "logging": "disabled",
        "monitor": "default",
        "priorityGroup": 0,
        "rateLimit": "disabled",
        "ratio": 1,
        "state": this.state.state,
        "session": this.state.session, 
        "fqdn": {
            "autopopulate": "disabled"
        }
      }


    this.props.dispatch(poolMembersLoading(true))

    let rest = new Rest(
        "POST",
        resp => {
          this.props.dispatch(poolMembersLoading(false))
          this.setState({response: true}, () => this.response())
        },
        error => {
          this.props.dispatch(poolMembersLoading(false))
          error = Object.assign(error, {
            component: 'poolMembersAdd',
            vendor: 'f5',
            errorType: 'poolMemberAddError'
          })
          this.props.dispatch(err(error))
        }
      )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/members/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(poolMembersFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'poolMembersAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }
    
    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          if (key === 'address') {
            return (
              <Input
                value={this.state[`${key}`] ? this.state[`${key}`] : ''}
                ref={ref => this.myRefs[`address`] = ref}
                style=
                {this.state.errors[`${key}Error`] ?
                  {borderColor: 'red'}
                :
                  {}
                }
                onChange={event => this.set(event.target.value, key)}
              />
            )
          }
          else if (key === 'port') {
            return (
              <Input
                value={this.state[`${key}`] ? this.state[`${key}`] : ''}
                ref={ref => this.myRefs[`port`] = ref}
                style=
                {this.state.errors[`${key}Error`] ?
                  {borderColor: 'red'}
                :
                  {}
                }
                onChange={event => this.set(event.target.value, key)}
              />
            )
          }
          else {
            return (
              <Input
                value={this.state[`${key}`] ? this.state[`${key}`].name : ''}
                style=
                {this.state.errors[`${key}Error`] ?
                  {borderColor: 'red'}
                :
                  {}
                }
                onChange={event => this.set(event.target.value, key)}
              />
            )
          }

        case 'textArea':
          return (
            <Input.TextArea
              rows={7}
              value={this.state[`${key}`]}
              onChange={event => this.set(event.target.value, key)}
              style=
              { this.state.errors[`${key}Error`] ?
                {borderColor: `red`}
              :
                {}
              }
            />
          )

        case 'select':
          if (key === 'status') {
            return (
              <Select
                value={this.state[`${key}`] ? this.state[`${key}`] : ''}
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
                onSelect={n => this.set(n, key, obj)}
              >
                <React.Fragment>
                  
                { this.state[`${choices}`] ?
                  this.state[`${choices}`].map((n, i) => {
                    return (
                      <Select.Option key={i} value={n}>{n}</Select.Option>
                    )
                  })
                  :
                  null
                }
                </React.Fragment>
              </Select>
            )
          }
          else {
            return (
              <Select
                value={this.state[`${key}`] ? this.state[`${key}`].name : ''}
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
                onSelect={n => this.set(n, key, obj)}
              >
                <React.Fragment>
                  
                { this.state[`${choices}`] ?
                  this.state[`${choices}`].map((n, i) => {
                    return (
                      <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                    )
                  })
                  :
                  null
                }
                </React.Fragment>
              </Select>
            )
          }

        default:
      }
    }

    return (
      <Space direction='vertical'>

        <Button type="primary" onClick={() => this.details()}>Add Member</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add Pool Member</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
          maskClosable={false}
        >
          { this.props.poolMembersLoading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.props.poolMembersLoading && this.state.response &&
            <Result
               status="success"
               title="Member Added"
             />
          }
          { !this.props.poolMembersLoading && !this.state.response &&
            <React.Fragment>

              <Row>
                <Col offset={4} span={4}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Existent Node:</p>
                </Col>
                <Col span={8}>
                  { this.state.nodesLoading ?
                    <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                  :
                    <Col span={24}>
                      {createElement('select', 'existentNode', 'nodes')}
                    </Col>
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={5} span={3}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={8}>
                  {createElement('input', 'address', '')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={5} span={3}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                </Col>
                <Col span={8}>
                  {createElement('input', 'port', '')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={5} span={3}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>State:</p>
                </Col>
                <Col span={8}>
                  {createElement('select', 'status', 'states')}
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Node
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

  asset: state.f5.asset,
  partition: state.f5.partition,

  nodes: state.f5.nodes,
  poolMembersLoading: state.f5.poolMembersLoading,
}))(Add);
