import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  snatPoolsFetch,
  snatPoolAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Row, Col } from 'antd';

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
        members: []
      },
    };
  }

  componentDidMount() {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.members.push({id:1})
    this.setState({request: request})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible){
      if (this.state.request.members && this.state.request.members.length === 0) {
        let request = JSON.parse(JSON.stringify(this.state.request))
        request.members.push({id:1})
        this.setState({request: request})
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
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

  setName = (e, id) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
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

    if (!request.name) {
      errors.nameError = true
      errors.nameColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      delete errors.nameColor
      this.setState({errors: errors})
    }

    if (members.length > 0) {
      members.forEach((member, i) => {
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
    await this.validationCheck()
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
    this.setState({list: list}, () => this.snatPoolAdd() )
  }


  //DISPOSAL ACTION
  snatPoolAdd = async () => {
    let b = {}
    b.data = {
      "name": this.state.request.name,
      "members": this.state.list
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(snatPoolAddError(error))
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
      request: {}
    })
  }


  render() {
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
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={16}>
                  {this.state.errors.nameError ?
                    <Input style={{width: 250, borderColor: this.state.errors.nameColor}} name="name" id='name' onChange={e => this.setName(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} name="name" id='name' onChange={e => this.setName(e)} />
                  }
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
                    Add SnatPool
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.snatPoolAddError ? <Error component={'add snatPool'} error={[this.props.snatPoolAddError]} visible={true} type={'snatPoolAddError'} /> : null }
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

  snatPoolAddError: state.f5.snatPoolAddError
}))(Add);
