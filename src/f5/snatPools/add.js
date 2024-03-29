import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  snatPoolsFetch,
  routeDomains,
  snatPoolAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Table, Row, Col } from 'antd';

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
      request: {},
      members: []
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible){
      if (this.state.members && this.state.members.length === 0) {
        let members = JSON.parse(JSON.stringify(this.state.members))
        members.push({id:1})
        this.setState({members: members})
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main()
  }

  main = async () => {
    await this.setState({routeDomainsLoading: true})
    let fetchedRouteDomains = await this.routeDomainsGet()
    await this.setState({routeDomainsLoading: false})
    if (fetchedRouteDomains.status && fetchedRouteDomains.status !== 200 ) {
      let error = Object.assign(fetchedRouteDomains, {
        component: 'snatPoolAdd',
        vendor: 'f5',
        errorType: 'routeDomainsError'
      })
      this.props.dispatch(err(error))
      return
    }
    else {
      this.props.dispatch(routeDomains( fetchedRouteDomains ))
    }
  }


  //FETCH
  routeDomainsGet = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/routedomains/`, this.props.token)
    return r
  }


  //SETTERS
  memberAdd = () => {
    let id = 0
    let n = 0

    this.state.members.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let m = {id: n}
    let list = JSON.parse(JSON.stringify(this.state.members))
    list.push(m)
    this.setState({members: list})
  }

  memberRemove = async r => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    let list = members.filter(n => {
      return r !== n.id
    })
    await this.setState({members: list})
  }

  nameSet = (e, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }

  ipSet = (ip, id) => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    let member = members.find( r => r.id === id )
    member.ip = ip.target.value
    this.setState({members: members})
  }

  rdSet = (rd, id) => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    let member = members.find( r => r.id === id )
    member.rd = rd.toString()
    this.setState({members: members})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.members))
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

    if (members.length > 0) {
      members.forEach((member, i) => {
        errors[member.id] = {}

        if (!member.ip || !validators.ipv4(member.ip)) {
          member.ipError = true
          errors[member.id].ipError = true
          this.setState({errors: errors, members: members})
        }
        else {
          delete member.ipError
          delete errors[member.id].ipError
          this.setState({errors: errors, members: members})
        }

        if (Object.keys(errors[member.id]).length === 0) {
          delete errors[member.id]
          this.setState({errors: errors})
        }
      })
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.snatPoolAdd()
    }
  }

  addRd = async () => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    let request = JSON.parse(JSON.stringify(this.state.request))
    let list = []
    members.forEach((member, i) => {
      if (member.rd) {
        list.push(`${member.ip}%${member.rd}`)
      } else {
        list.push(member.ip)
      }

    })
    request.members = list
    await this.setState({request: request})
  }

  addPart = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.request.members))
    let list = []
    members.forEach((member, i) => {
      list.push(`/${this.props.partition}/${member}`)
    })
    request.members = list
    await this.setState({request: request})
  }




  //DISPOSAL ACTION
  snatPoolAdd = async () => {

    await this.addRd()
    await this.addPart()

    let b = {}
    b.data = {
      "name": this.state.request.name,
      "members": this.state.request.members
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        error = Object.assign(error, {
          component: 'snatPoolAdd',
          vendor: 'f5',
          errorType: 'snatPoolAddError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/snatpools/`, this.props.token, b)

  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(snatPoolsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      request: {},
      members: []
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'snatPoolAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const membersCol = [
      {
        title: 'IP',
        align: 'center',
        dataIndex: 'ip',
        key: 'ip',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.ipError ?
              <Input
                value={obj.ip}
                style={{borderColor: 'red'}}
                onChange={e => this.ipSet(e, obj.id)}
              />
            :
              <Input
                value={obj.ip}
                onChange={e => this.ipSet(e, obj.id)}
              />
            }
          </React.Fragment>
        )
      },
      {
        title: 'Route Domain (optional)',
        align: 'center',
        dataIndex: 'rd',
        key: 'rd',
        render: (name, obj)  => (
          <React.Fragment>
            { this.state.routeDomainsLoading ?
              <Spin indicator={rdIcon} style={{ margin: '0 10%'}}/>
            :
              <React.Fragment>
                { this.props.routeDomains && this.props.routeDomains.length > 0 ?
                  <Select
                    value={obj.rd}
                    showSearch
                    style={{width: 150}}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onSelect={n => this.rdSet(n, obj.id)}
                  >
                    <React.Fragment>
                      {this.props.routeDomains.map((n, i) => {
                        return (
                          <Select.Option key={i} value={n.id}>{n.name}</Select.Option>
                        )
                      })
                      }
                    </React.Fragment>
                  </Select>
                :
                  null
                }
              </React.Fragment>
            }
          </React.Fragment>
        )
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'memberRemove',
        key: 'memberRemove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.memberRemove(obj.id)}>
            -
          </Button>
        ),
      },
    ]

    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Add SnatPool</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1000}
          maskClosable={false}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="SnatPool Added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={3} span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={12}>
                  {this.state.errors.nameError ?
                    <Input
                      value= {this.state.request.name}
                      style={{width: 250, borderColor: 'red'}}
                      onChange={e => this.nameSet(e)} />
                  :
                    <Input
                      value={this.state.request.name}
                      style={{width: 250}}
                      onChange={e => this.nameSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={3} span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Members:</p>
                </Col>
                <Col span={16}>
                  {(this.state.members && this.state.members.length > 0) ?
                    <React.Fragment>
                      <Button type="primary" onClick={() => this.memberAdd()}>
                        +
                      </Button>
                      <br/>
                      <br/>
                      <Table
                        columns={membersCol}
                        dataSource={this.state.members}
                        bordered
                        rowKey='id'
                        scroll={{x: 'auto'}}
                        pagination={false}
                        style={{marginBottom: 10}}
                      />
                    </React.Fragment>
                  :
                    null
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add SnatPool
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
  routeDomains: state.f5.routeDomains,
}))(Add);
