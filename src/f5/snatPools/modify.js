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
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Table, Row, Col } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const rdIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />


class Modify extends React.Component {

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
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main()
    let members = JSON.parse(JSON.stringify(this.props.obj.members))
    let n = 1
    let newList = []


    members.forEach(member => {
      let m = {}
      m.id = n
      let list = member.split('/')
      let rd = list[2].split('%')
      m.ip = rd[0]
      m.rd = rd[1]
      newList.push(m)

      n = n + 1
    });

    this.setState({members: newList})
  }

  main = async () => {
    try {
      await this.setState({routeDomainsLoading: true})
      let fetchedRouteDomains = await this.routeDomainsGet()
      await this.setState({routeDomainsLoading: false})
      if (fetchedRouteDomains.status && fetchedRouteDomains.status !== 200 ) {
        let error = Object.assign(fetchedRouteDomains, {
          component: 'snatPoolModify',
          vendor: 'f5',
          errorType: 'routeDomainsError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        this.props.dispatch(routeDomains( fetchedRouteDomains ))
      }
    } catch (error) {
      console.log(error)
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


  //FETCH


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
    if (this.state.members.length < 1 ) {
      list = []
      list.push({id: 0})
      await this.setState({members: list})
    }
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
    let members = JSON.parse(JSON.stringify(this.state.members))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

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
      this.snatPoolModify()
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
  snatPoolModify = async () => {
    await this.addRd()
    await this.addPart()

    let b = {}
    b.data = {
      "members": this.state.request.members
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        error = Object.assign(error, {
          component: 'snatPoolModify',
          vendor: 'f5',
          errorType: 'snatPoolModifyError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/snatpool/${this.props.obj.name}/`, this.props.token, b)

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
      if (this.props.error && this.props.error.component === 'snatPoolModify') {
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

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify SnatPool</p>}
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
               title="SnatPool Modified"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={3} span={2}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  <Input disabled value={this.props.obj.name} style={{width: 250}} />
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
                    Modify SnatPool
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
}))(Modify);
