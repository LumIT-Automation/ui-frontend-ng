import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'
import Validators from '../../_helpers/validators'

import {
  snatPoolsFetch,
  snatPoolModifyError
} from '../../_store/store.f5'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

const { TextArea } = Input;

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
    let validators = new Validators()

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
    let validation = await this.validationCheck()

    if (Object.keys(this.state.errors).length === 0) {
      this.snatPoolModify()
    }
  }


  //DISPOSAL ACTION
  snatPoolModify = async () => {
    let request = Object.assign({}, this.state.request)

    const b = {
      "data":
        {
          "apiAnonymous": this.state.request.text
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/snatPool/${this.props.obj.name}/`, this.props.token, b)
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

        <Button icon={modifyIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>Modify SnatPool</p>}
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
               title="SnatPool Modified"
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
                    <TextArea rows={25} defaultValue={this.props.obj.apiAnonymous} value={this.state.request.text} name="text" id='name' onChange={e => this.setText(e)} />
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
