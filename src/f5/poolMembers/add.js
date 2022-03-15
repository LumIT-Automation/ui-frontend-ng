import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  nodes,
  nodesError,
  poolMembersLoading,
  poolMembersFetch,
  poolMemberAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const rdIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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
    /*
    if (this.state.visible) {
      if (this.props.asset && this.props.partition) {
        if (!this.props.nodesError) {
          if (!this.props.nodes) {
            this.main()
          }
        }
      }
    }
    */
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
      this.props.dispatch(nodesError(nodesFetched))
      return
    }
    else {
      this.props.dispatch(nodes( nodesFetched ))
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
  poolMemberSet = id => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.poolMember = id.toString()
    this.setState({request: request})
  }

  portSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.port = e.target.value
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (!request.poolMember) {
      errors.poolMemberError = true
      errors.poolMemberColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.poolMemberError
      delete errors.poolMemberColor
      this.setState({errors: errors})
    }

    if (!request.port || !validators.port(request.port)) {
      errors.portError = true
      errors.portColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.portError
      delete errors.portColor
      this.setState({errors: errors})
    }

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
        "name": `${this.state.request.poolMember}:${this.state.request.port}`,
        "connectionLimit": 0,
        "dynamicRatio": 1,
        "ephemeral": "false",
        "inheritProfile": "enabled",
        "logging": "disabled",
        "monitor": "default",
        "priorityGroup": 0,
        "rateLimit": "disabled",
        "ratio": 1,
        "state": "up",
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
          this.props.dispatch(poolMemberAddError(error))
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
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add Pool Member</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
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
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Nodes:</p>
                </Col>
                <Col span={16}>
                  { this.state.nodesLoading ?
                    <Spin indicator={rdIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.props.nodes && this.props.nodes.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.poolMemberError ?
                            <Select
                              value={this.state.request.poolMember}
                              showSearch
                              style={{width: 250, border: `1px solid ${this.state.errors.poolMemberColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.poolMemberSet(n)}
                            >
                              <React.Fragment>
                                {this.props.nodes.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.fullPath}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              value={this.state.request.poolMember}
                              showSearch
                              style={{width: 250}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.poolMemberSet(n)}
                            >
                              <React.Fragment>
                                {this.props.nodes.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n.fullPath}>{n.name}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          }
                        </React.Fragment>
                      :
                        null
                      }
                    </React.Fragment>
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.portError ?
                    <Input style={{width: 250, borderColor: this.state.errors.portColor}} name="port" id='port' onChange={e => this.portSet(e)} />
                  :
                    <Input defaultValue={this.state.request.port} style={{width: 250}} name="port" id='port' onChange={e => this.portSet(e)} />
                  }
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

        {this.state.visible ?
          <React.Fragment>
            { this.props.nodesError ? <Error component={'add poolMember'} error={[this.props.nodesError]} visible={true} type={'nodesError'} /> : null }
            { this.props.poolMemberAddError ? <Error component={'add poolMember'} error={[this.props.poolMemberAddError]} visible={true} type={'poolMemberAddError'} /> : null }
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
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  nodes: state.f5.nodes,
  nodesError: state.f5.nodesError,
  poolMembersLoading: state.f5.poolMembersLoading,
  poolMemberAddError: state.f5.poolMemberAddError
}))(Add);
