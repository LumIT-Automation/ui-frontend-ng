import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'
import Validators from '../../_helpers/validators'

import {
  snatPoolsFetch,
  snatPoolModifyError
} from '../store.f5'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};


class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {
        members: []
      },
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
    let request = JSON.parse(JSON.stringify(this.props.obj))
    let n = 1
    let newList = []
    request.members.forEach(member => {

      let newMember = {}
      newMember.id = n
      let list = member.split('/')
      console.log(list)
      newMember.address = list[2]
      newList.push(newMember)
      n = n + 1
      console.log(newMember)
      console.log(newList)

    });

    request.members = newList
    console.log(request)

    this.setState({request: request})
  }


  //FETCH


  //SETTERS
  memberAdd = () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.request.members))
    let id = 0
    let n = 0

    this.state.request.members.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let member = {id: n}
    members.push(member)
    request.members = members

    this.setState({request: request})
  }

  memberRemove = r => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.request.members))

    let list = members.filter(n => {
      return r !== n.id
    })

    request.members = list

    this.setState({request: request})
  }

  setAddress = (memberId, e) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.request.members))

    let index = members.findIndex((obj => obj.id === memberId))
    members[index].address = e.target.value

    request.members = members
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let members = JSON.parse(JSON.stringify(this.state.request.members))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()

    if (members.length > 0) {
      members.forEach((member, i) => {
        let index = members.findIndex((obj => obj.id === member.id))
        errors[member.id] = {}

        if (member.address && validators.ipv4(member.address)) {
          delete errors[member.id].addressError
          delete errors[member.id].addressColor
          this.setState({errors: errors})
        }
        else {
          errors[member.id].addressError = true
          errors[member.id].addressColor = 'red'
          this.setState({errors: errors})
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
    let validation = await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.addPart()
    }
  }

  addPart = () => {
    let members = JSON.parse(JSON.stringify(this.state.request.members))
    let list = []
    members.forEach((member, i) => {
      list.push(`/${this.props.partition}/${member.address}`)
    })
    this.setState({list: list}, () => this.snatPoolModify() )
  }


  //DISPOSAL ACTION
  snatPoolModify = async () => {
    let request = Object.assign({}, this.state.request)

    const b = {
      "data":
        {
          "members": this.state.list
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(snatPoolModifyError(error))
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
      request: {}
    })
  }


  render() {
    console.log(this.props.obj)
    console.log(this.state.request)
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
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  <Input disabled value={this.state.request.name} style={{width: 250}} name="name" id='name' />
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Add a member:</p>
                </Col>
                <Col span={16}>
                  <Button type="primary" shape='round' onClick={() => this.memberAdd()}>
                    +
                  </Button>
                </Col>
              </Row>
              <br/>

              { this.state.request.members ?
                this.state.request.members.map((n, i) => {
                let address = 'address' + n.id

                return (
                  <React.Fragment>
                    <Row>
                      <Col offset={2} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                      </Col>
                      <Col span={7}>
                        { this.state.errors[n.id] && this.state.errors[n.id].addressError ?
                          <Input
                            key={address}
                            defaultValue={n.address}
                            value={n.address}
                            style={{display: 'block', width: 250, borderColor: this.state.errors[n.id].addressColor}}
                            onChange={e => this.setAddress(n.id, e)}
                          />
                        :
                          <Input
                            key={address}
                            defaultValue={n.address}
                            value={n.address}
                            style={{display: 'block', width: 250}}
                            onChange={e => this.setAddress(n.id, e)}
                          />
                        }
                      </Col>
                      <Col span={1}>
                        <Button type="danger" shape='round' onClick={() => this.memberRemove(n.id)}>
                          -
                        </Button>
                      </Col>
                    </Row>

                    <br/>

                  </React.Fragment>
                )
                })
                :
                null
              }

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

        {this.state.visible ?
          <React.Fragment>
            { this.props.snatPoolModifyError ? <Error component={'modify snatPool'} error={[this.props.snatPoolModifyError]} visible={true} type={'snatPoolModifyError'} /> : null }
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

  asset: state.f5.asset,
  partition: state.f5.partition,

  snatPoolModifyError: state.f5.snatPoolModifyError
}))(Modify);
