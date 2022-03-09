import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  irulesFetch,
  iruleModifyError
} from '../store.f5'

import { Input, Button, Space, Modal, Spin, Result, Row, Col } from 'antd'
import { LoadingOutlined, EditOutlined } from '@ant-design/icons'

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const modifyIcon = <EditOutlined style={{color: 'white' }}  />



class Modify extends React.Component {

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
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    let request = Object.assign({}, this.props.obj)
    request.text = this.props.obj.apiAnonymous
    this.setState({request: request})
  }

  //FETCH


  //SETTERS
  setText = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.text = e.target.value
    this.setState({request: request})
  }

  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let errors = JSON.parse(JSON.stringify(this.state.errors))

    if (!request.text) {
      errors.textError = true
      errors.textColor = 'red'
      this.setState({errors: errors})
    }
    else {
      delete errors.textError
      delete errors.textColor
      this.setState({errors: errors})
    }

    return errors
  }

  validation = async () => {
    await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.iruleModify()
    }
  }


  //DISPOSAL ACTION
  iruleModify = async () => {
    let b = {}
    b.data = {
      "apiAnonymous": this.state.request.text
    }

    this.setState({loading: true})

    let rest = new Rest(
      "PATCH",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(iruleModifyError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/irule/${this.props.obj.name}/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(irulesFetch(true)), 2030)
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

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify Irule</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Irule Modified"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>

              <Row>
                <Col offset={2} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Text:</p>
                </Col>
                <Col span={10}>
                  {this.state.errors.textError ?
                    <TextArea rows={25} style={{borderColor: this.state.errors.textColor}} value={this.state.request.text} name="text" id='text' onChange={e => this.setText(e)} />
                  :
                    <TextArea rows={25} value={this.state.request.text} name="text" id='name' onChange={e => this.setText(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={8} span={16}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Modify Irule
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.iruleModifyError ? <Error component={'modify irule'} error={[this.props.iruleModifyError]} visible={true} type={'iruleModifyError'} /> : null }
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

  iruleModifyError: state.f5.iruleModifyError
}))(Modify);
