import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Spin, Result, Input, Row, Col, Select, Checkbox } from 'antd'
import { LoadingOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  triggersFetch,
  err,
} from '../store'


const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      assets: [],
      names: ['infoblox-ipv4s_post', 'infoblox-ipv4s_posta'],
      actions: ['dst:ipv4s-replica', 'dst:ipv4s-replicante'],
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
    }
    let request = JSON.parse(JSON.stringify(this.props.obj))
    if (request.enabled) {
      request.enabled = true
    }
    else {
      request.enabled = false
    }

    await this.setState({request: request})
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
      this.triggerModifyHandler()
    }
  }


  triggerModifyHandler = async () => {
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

    await this.setState({loading: true})
    let triggerModify = await this.triggerModify(b)
    if (triggerModify.status && triggerModify.status !== 200 ) {
      let error = Object.assign(triggerModify, {
        component: 'triggerModify',
        vendor: 'concerto',
        errorType: 'triggerModifyError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      //return
    }
    else {
      await this.setState({loading: false, response: true})
      this.response()
    }
  }

  //DISPOSAL ACTION
  triggerModify = async (b) => {
    let r
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}/trigger/${this.props.obj.id}/`, this.props.token, b )
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

    let errors = () => {
      if (this.props.error && this.props.error.component === 'triggerModify') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>MODIFY TRIGGER</p>}
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
             title="Trigger Modified"
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
                  Modify Trigger
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            {errors()}
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
  error: state.concerto.err,
}))(Modify);
