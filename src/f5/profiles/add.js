import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  profilesFetch,
  addProfileError
} from '../../_store/store.f5'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const profIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
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
    this.fetchProfilesType()
  }

  fetchProfilesType = async () => {
    this.setState({profileTypesLoading: true})
    let profTypes = await this.fetchProfileTypesList()

    if (profTypes.status && profTypes.status !== 200 ) {
      this.setState({profileTypesLoading: false})
      this.props.dispatch(addProfileError(profTypes))
    }
    else {
      this.setState({profileTypesLoading: false})
      this.setState({profileTypes: profTypes.data.items})
    }
  }

  fetchProfileTypesList = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/`, this.props.token)
    return r
  }

  //FETCH


  //SETTERS
  setName = e => {
    let request = Object.assign({}, this.state.request)
    request.name = e.target.value
    this.setState({request: request})
  }

  setProfileType = e => {
    let request = Object.assign({}, this.state.request)
    request.profileType = e
    this.setState({request: request})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

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

    if (!request.profileType) {
      errors.profileTypeError = true
      errors.profileTypeColor = 'red'
      this.setState({errors: errors})
      }
    else {
      delete errors.profileTypeError
      delete errors.profileTypeColor
      this.setState({errors: errors})
    }
    return errors
  }

  validation = async () => {
    let validation = await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.addProfile()
    }
  }


  //DISPOSAL ACTION
  addProfile = async () => {
    let request = Object.assign({}, this.state.request);
    const b = {
      "data":
        {
          "name": this.state.request.name,
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(addProfileError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/${this.state.request.profileType}/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(profilesFetch(true)), 2030)
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
          title={<p style={{textAlign: 'center'}}>ADD PROFILE</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Added"
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
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Profile Type:</p>
                </Col>
                <Col span={16}>
                  { this.state.profileTypesLoading ?
                    <Spin indicator={profIcon} style={{ margin: '0 10%'}}/>
                  :
                    <React.Fragment>
                      { this.state.profileTypes && this.state.profileTypes.length > 0 ?
                        <React.Fragment>
                          {this.state.errors.profileError ?
                            <Select
                              value={this.state.request.profile}
                              showSearch
                              style={{width: 250, border: `1px solid ${this.state.errors.profileColor}`}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setProfileType(n)}
                            >
                              <React.Fragment>
                                {this.state.profileTypes.map((n, i) => {
                                  return (
                                    <Select.Option key={i}value={n}>{n}</Select.Option>
                                  )
                                })
                                }
                              </React.Fragment>
                            </Select>
                          :
                            <Select
                              value={this.state.request.profile}
                              showSearch
                              style={{width: 250}}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                              }
                              onSelect={n => this.setProfileType(n)}
                            >
                              <React.Fragment>
                                {this.state.profileTypes.map((n, i) => {
                                  return (
                                    <Select.Option key={i} value={n}>{n}</Select.Option>
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
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Profile
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.addProfileError ? <Error component={'add profile'} error={[this.props.addProfileError]} visible={true} type={'addProfileError'} /> : null }
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

  addProfileError: state.f5.addProfileError
}))(Add);
