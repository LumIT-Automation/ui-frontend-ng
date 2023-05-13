import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Input, Row, Col, Radio, Select, Checkbox } from 'antd'
import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  triggersFetch,
  triggersError,
  triggerAddError,
} from '../store'


const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const loadingIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      assets: [],
      names: ['infoblox-ipv4s_posta'],
      actions: ['dst:ipv4s-replica'],
      request: {
        name: '',
        dst_asset_id: '',
        action: '',
        enabled: true
      },
      errors: {}
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

  details = async () => {
    await this.setState({visible: true})
    if (this.props.assets) {
      let assets = JSON.parse(JSON.stringify(this.props.assets))
      await this.setState({assets: assets})
      console.log('update assets', this.state.assets)
    }
  }

  //SETTER
  set = async (value, key) => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request[key] = value
    await this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    for (const [key, value] of Object.entries(request)) {
      if (key === 'enabled') {
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

  validation = async () => {
    await this.validationCheck()
    if (Object.keys(this.state.errors).length === 0) {
      this.triggerAddHandler()
    }
  }


  triggerAddHandler = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let b = {}

    b.data = {
      "name": request.name,
      "dst_asset_id": request.dst_asset_id,
      "action": request.action,
    }

    if (request.enabled){
      b.data.enabled = 1
    }
    else {
      b.data.enabled = 0
    }

    console.log(b)
    await this.setState({loading: true})
    let triggerAdd = await this.triggerAdd(b)
    if (triggerAdd.status && triggerAdd.status !== 201 ) {
      this.props.dispatch(triggerAddError(triggerAdd))
      await this.setState({loading: false})
      //return
    }
    else {
      await this.setState({loading: false, response: true})
      this.response()
    }
  }

  //DISPOSAL ACTION
  triggerAdd = async (b) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/triggersd/`, this.props.token, b )
    return r
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(triggersFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      request: {},
      errors: {}
    })
  }


  render() {
    console.log('add', this.state.assets)
    console.log('add', this.state.request)

    let createElement = (element, key, choices, obj, action) => {
      switch (element) {

        case 'input':
          return (
            <Input
              suffix={(key === 'username') ? <UserOutlined className="site-form-item-icon" /> : null }
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

        case 'checkbox':
          return (
            <Checkbox
              onChange={event => this.set(event.target.checked, key)}
              checked={this.state.request.enabled}
            >
              Enabled
            </Checkbox>
          )

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
              { choices === 'assets' ?
                this.state.assets.map((a, i) => {
                  return (
                    <Select.Option key={i} value={a.id}>{a.fqdn}</Select.Option>
                  )
                })
              :
                this.state[`${choices}`].map((c, i) => {
                  return (
                    <Select.Option key={i} value={c}>{c}</Select.Option>
                  )
                })
                }
            </Select>
          )

        default:
      }
    }

    return (
      <React.Fragment>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD ASSET</p>}
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
             title="Trigger Added"
           />
        }
        { !this.state.loading && !this.state.response &&
          <React.Fragment>
            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
              </Col>
              <Col span={8}>
                {createElement('select', 'name', 'names')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Dest asset:</p>
              </Col>
              <Col span={8}>
                {createElement('select', 'dst_asset_id', 'assets')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Action:</p>
              </Col>
              <Col span={8}>
                {createElement('select', 'action', 'actions')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={8} span={8}>
                {createElement('checkbox', 'enabled')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => this.validation()} >
                  Add Trigger
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.triggerAddError ? <Error component={`trigger add ${this.props.vendor}`} error={[this.props.triggerAddError]} visible={true} type={'triggerAddError'} /> : null }
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
 	triggerAddError: state.concerto.triggerAddError,
}))(Add);
